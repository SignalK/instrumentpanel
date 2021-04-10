import BaconModel from 'bacon.model';
import compareVersions from 'compare-versions';
import Debug from 'debug';

const debug = Debug('instrumentpanel')

import {
  getUrlParameter,
  getLayoutName
} from '../util/browser';
import {
  retrievePreferredUnits,
  storePreferredUnits,
  storeGrid,
  retrieveGrid,
  retrieveWidgetActiveMode,
  storeWidgetActiveMode
} from '../util/localstorage';
import SignalKSchemaData from '../util/signalkschemadata';
import {
  getConversionsList,
  getConversion
} from './settings/conversions'
import Universal from './widgets/universal';
import Compass from './widgets/compass';
import Windmeter from './widgets/windmeter';
import Digitalposition, {getIndexFromPositionFormatLabel, getPositionFormatLabels} from './widgets/digitalposition';
import Digitaldatetime, {getIndexFromDateFormatLabel, getDateFormatLabels} from './widgets/digitaldatetime';
import Attitude from './widgets/attitude';
import Notification from './widgets/notification';
import Specifictext from './widgets/specifictext';
import {
  defaultLayoutName,
  CS_LIGHT,
  CS_DARK,
  CS_BY_MAINBAR,
  CS_BY_OS,
  CS_BY_SKPATH,
  notificationPageId,
  WA_BASE_DATA,
  WA_ALL,
  WA_NO
} from './settings/constants';

//import { Client } from '@signalk/client';
import Client from '../util/signalk-client';

var widgetModulesByType = {};
var widgetModulesByPath = {};

var widgetModules = [
  Universal,
  Compass,
  Windmeter,
  Digitalposition,
  Digitaldatetime,
  Attitude,
  Notification,
  Specifictext
];

var defaultNotificationColors = {
  0: "#C0C0C0", //nominal
  1: "#C0C0C0", //normal
  2: "#FFFF00", //alert
  3: "#FF8000", //warn
  4: "#FF4000", //alarm
  5: "#FF00F7" //emergency
};

var defaultPaths = [
  'environment.wind.angleApparent',
  'environment.wind.angleTrueGround',
  'environment.wind.angleTrueWater',
  'environment.wind.speedApparent',
  'environment.wind.speedOverGround',
  'environment.wind.speedTrue',
  'navigation.position',
  'navigation.courseOverGroundTrue',
  'navigation.courseOverGroundMagnetic',
  'navigation.headingMagnetic',
  'navigation.headingTrue',
  'environment.depth',
  'navigation.datetime'
]

widgetModules.forEach(function(widget) {
  widgetModulesByType[widget.type] = widget;
});

function widgetModuleFor(path) {
  return widgetModules.find(function(widgetModule) {
    return widgetModule.paths.some(function(widgetPath) {
      return new RegExp('^' + widgetPath + '$').test(path);
    })
  });
}

export function getPathsByWidgetType(widgetType) {
  const module = widgetModulesByType[widgetType]
  return module.paths;
}

function newPage() {
  return {
    layout: [],
    widgets: [],
    knownKeys: {}
  }
}

export default function InstrumentPanel(streamBundle) {
  this.backupSettings = false;
  this.streamBundle = streamBundle;
  this.currentPage = 0;
  this.pages = [newPage()];
  this.notificationPage = newPage();
  this.notificationColors = defaultNotificationColors;
  this.notificationLevel = 0;
  this.notificationLevelHidden = 0;
  this.notificationColor = this.notificationColors[0];
  this.notificationColorHidden = this.notificationColors[0];
  this.gridSettingsModel = new BaconModel.Model("");
  this.pushGridChanges();
  this.handleSaveLayoutDelay = null;
  this.reloadRequired = new BaconModel.Model(false);
  this.preferredUnits = {};
  this.layoutName = defaultLayoutName;
  this.colorSchemeTool = null;
  this.colorScheme = {
    colorSchemeCurrent: CS_LIGHT,
    colorSchemeSetBy: CS_BY_MAINBAR
  }
  this.widgetActiveMode = WA_BASE_DATA;
  this.signalkServer; // undefined if no signalkServer in URL
  this.loginStatus = {};
  var isUnkownKey = function(key) {
    return typeof this.getCurrentPage().knownKeys[key.key] === 'undefined';
  }.bind(this)
  this.streamBundle.allSources.filter(isUnkownKey).onValue( newSource => {
      newSource.stream = this.streamBundle.getValueStreamForSourcePath(newSource.sourceId, newSource.path);
      this.handlePossiblyNewSource(newSource, this);
    }
  );

  var useTLS = window.location.protocol === 'https:'
  var host = window.location.hostname;
  var port = parseInt(window.location.port);
  if (!Number.isInteger(port)) {
    port = (useTLS) ? 443 : 80;
  }
  this.signalkServer = getUrlParameter("signalkServer");
  if (typeof this.signalkServer !== 'undefined') {
    useTLS = this.signalkServer.startsWith('wss://');
    host = this.signalkServer.split(':')[1].replace(/\//g, '');
    port = parseInt(this.signalkServer.split(':')[2]);
    if (!Number.isInteger(port)) {
      port = (useTLS) ? 443 : 80;
    }
  }
  this.loadPreferredUnits();
  this.loadWidgetActiveMode();
  this.SignalkClient = new Client({
    hostname: host,
    port: port,
    useTLS: useTLS,
    reconnect: true,
    autoConnect: false,
    notifications: false,
    maxRetries: -1
  });
}

InstrumentPanel.prototype.setReloadRequired = function() {
  this.reloadRequired.set(true);
}

InstrumentPanel.prototype.isReloadRequired = function() {
  return this.reloadRequired.get();
}

InstrumentPanel.prototype.setPage = function(page) {
  if (page > this.pages.length || page < notificationPageId) {
    console.error("No such page:" + page);
    page = 0;
  }
  if (page === this.pages.length && page < 10) {
    this.pages[page] = newPage();
    this.populateNewPage(page);
    this.persist();
  }
  this.currentPage = page;
  this.sortNotificationLayout();
  this.pushGridChanges();
}

/*
 toNext = true => goto next page
 toNext = false => goto previous page
*/
InstrumentPanel.prototype.gotoNextPrevPage = function(toNext) {
    const direction = (toNext) ? 1 : -1;
    var nextPage = this.currentPage + direction;
    if (nextPage < notificationPageId) {nextPage = this.pages.length -1;}
    else if (nextPage === this.pages.length) {nextPage = notificationPageId;}
    this.setPage(nextPage);
}

InstrumentPanel.prototype.populateNewPage = function(page) {
  if (page < 0) {return;}
  var that = this;
  const newPage = page;
  this.pages.forEach(function(page) { // scan all pages to find existing widget
    page.widgets.forEach(function(existingWidget) {
      const foundKey = that.pages[newPage].widgets.find( widgetOnNewPage =>
        existingWidget.options.key === widgetOnNewPage.options.key
      );
      if (! foundKey) {
        var module = widgetModuleFor(existingWidget.options.path) || widgetModules[0];
        var newOptions = Object.assign({}, existingWidget.options);
        newOptions.active = that.getWidgetActiveModeByPath(newOptions.path);
        var newWidget = new module.constructor(newPage + '-' + that.pages[newPage].widgets.length,
          newOptions, that.streamBundle, that);
        that.pages[newPage].widgets.push(newWidget);
      }
    });
  });
}

InstrumentPanel.prototype.deleteCurrentPage = function() {
  if (this.currentPage < 0) {return;}
  //TODO implement unsubscribe
  this.pages.splice(this.currentPage, 1);
  this.currentPage = Math.min(this.currentPage, this.pages.length-1);
  this.persist();
  this.pushGridChanges();
}

InstrumentPanel.prototype.getCurrentPage = function() {
  if (this.currentPage !== notificationPageId) {
   return this.pages[this.currentPage];
  } else {
    return this.notificationPage;
  }
}

InstrumentPanel.prototype.getLayout = function(page) {
  if (typeof page === 'undefined') {
   page = this.currentPage;
  }
  if (page === notificationPageId) {
    return this.notificationPage.layout;
  }
  if (typeof this.pages[page] === 'undefined') {
    this.pages[page] = newPage();
  }
  return this.pages[this.currentPage].layout;
}

InstrumentPanel.prototype.getWidgets = function(page) {
  if (typeof page === 'undefined') {
    page = this.currentPage;
  }
  if (page === notificationPageId) {
    return this.notificationPage.widgets;
  }
  if (typeof this.pages[page] === 'undefined') {
    this.pages[page] = newPage();
  }
  return this.pages[page].widgets;
}

InstrumentPanel.prototype.getWidgetActiveModeByPath = function(path) {
  if (this.widgetActiveMode === WA_ALL) {
    return true;
  } else if (this.widgetActiveMode === WA_NO) {
    return false;
  }
  // assume this.widgetActiveMode === WA_BASE_DATA
  return this.isPathInDefaultPaths(path);
}

InstrumentPanel.prototype.isPathInDefaultPaths = function(path) {
  return (defaultPaths.indexOf(path) >= 0) ? true : false;
}

InstrumentPanel.prototype.pushGridChanges = function() {
  this.gridSettingsModel.set({
    layout: this.getLayout(this.currentPage),
    activeWidgets: this.getActiveWidgets()
  });
}

InstrumentPanel.prototype.dispatch = function(delta) {
  this.streamBundle.handleDelta(delta, this);
}

InstrumentPanel.prototype.handlePossiblyNewSource = function(newSource) {
  var module = widgetModuleFor(newSource.path) || widgetModules[0];
  var handled = true;
  var notification = (module.type === 'notification') ? true : false;
  var handlePage = (notification) ? notificationPageId : this.currentPage;

  if ( this.currentPage !== notificationPageId || notification ) {
    var handled = this.getWidgets(handlePage).reduce(function(previous, widget) {
      return widget.handleNewSource.call(widget, newSource) || previous
    }, false);
  }

  if (!handled) {
      var widget = new module.constructor(handlePage + '-' + this.getNextFreeID(handlePage), {
      sourceId: newSource.sourceId,
      key: newSource.key,
      path: newSource.path,
      active: this.getWidgetActiveModeByPath(newSource.path) || notification
    }, this.streamBundle, this);
    widget.handleNewSource.call(widget, newSource);
    this.getWidgets(handlePage).push(widget);
    if ((this.currentPage === handlePage) && (widget.options.active)) {
      this.pushGridChanges();
    }
  }
  this.getCurrentPage().knownKeys[newSource.key] = true;
}

InstrumentPanel.prototype.getNextFreeID = function(page) {
  let nextFreeID = this.getWidgets(page).length;
  if (page !== notificationPageId) {
    let idList = this.getWidgets(page).map(widget => {return parseInt(widget.id.split('-')[1])}).sort((a,b)=>{return a - b})
    for(let i=0;i<=idList.length;i++) {
     if(idList[i] != i) {
       nextFreeID = i;
       break;
     }
    }
  }
  return nextFreeID;
}

InstrumentPanel.prototype.serializableSettings = function() {
  return {
    pages: this.pages.map(function(page) {
      return {
        layout: page.layout,
        widgets: page.widgets.map(function(widget) {
          return {
            id: widget.id,
            type: widget.getType(),
            options: widget.getOptions()
          }
        }),
        knownKeys: {}
      }
    })
  }
}

InstrumentPanel.prototype.setWidgetData = function(widgetData) {
  var that = this;
  if (widgetData && widgetData.pages) {
    this.pages = widgetData.pages.map(function(page, pageID) {
      let cleanedWidgets = [];
      if (typeof page.widgets !== 'undefined') {
        for (const [key, widget] of page.widgets.entries()) {
          if (!widget.id) widget.id = pageID + '-' + key;
          if (widget.options && widget.options.delete !== true) {
            widget.options.delete = undefined;
            cleanedWidgets.push(widget);
          } else {
            let layoutId = page.layout.findIndex((layout) => {return layout.i === widget.id});
            if (layoutId >= 0) {
              page.layout.splice(layoutId,1);
            }
          }
        }
      }
      return {
        layout: page.layout.map(that.updateLayoutFormat.bind(that, pageID)),
        widgets: cleanedWidgets.map(that.deserializeWidget.bind(that, pageID)),
        knownKeys: {}
      }
    });
    this.currentPage = 0;
    this.pushGridChanges();
  }
}

InstrumentPanel.prototype.updateLayoutFormat = function(pageID, layout) {
  if (typeof layout.i === 'number') {layout.i = pageID + '-' + layout.i}
  return layout;
}

InstrumentPanel.prototype.deserializeWidget = function(pageID, oneWidgetData, i) {
  var module = widgetModulesByType[oneWidgetData.type];
  var updatedModule = widgetModuleFor(oneWidgetData.options.path) || widgetModules[0];
  if (oneWidgetData.type !== updatedModule.type) {
    console.warn("Module type:'" + oneWidgetData.type + "' is outdated, module type :'" +
      updatedModule.type + "' will be used instead");
    console.warn("widget details:" + JSON.stringify(oneWidgetData));
    module = updatedModule;
  }
  if (typeof oneWidgetData.options === 'undefined') {
    oneWidgetData.options = {};
  }
  if (typeof oneWidgetData.options.active === 'undefined') {
    oneWidgetData.options.active = true;
  }
  if (typeof oneWidgetData.options.path === 'undefined') {
    oneWidgetData.options.path = 'error';
  }
  var widget = new module.constructor(oneWidgetData.id, oneWidgetData.options, this.streamBundle, this);
  this.getCurrentPage().knownKeys[oneWidgetData.options.key] = true;
  return widget;
}

InstrumentPanel.prototype.onWidgetChange = function(widget) {
  this.pushGridChanges();
}

InstrumentPanel.prototype.persist = function() {
  if (this.currentPage !== notificationPageId) {
    var that = this;
    if (this.handleSaveLayoutDelay !== null) {
      clearTimeout(this.handleSaveLayoutDelay);
    }
    this.handleSaveLayoutDelay = setTimeout(() => {
      that.handleSaveLayoutDelay = null;
      storeGrid(this.SignalkClient.get('hostname'), this.layoutName, that.serializableSettings());
    }, 1000);
  }
}

InstrumentPanel.prototype.getActiveWidgets = function() {
  var activePage = (this.currentPage === notificationPageId)? this.notificationPage : this.pages[this.currentPage];
  var result = activePage.widgets.filter(function(widget) {
    return widget.options.active
  }).
  map(function(widget) {
    const widgetId = widget.id.toString();
    var layout = widget.instrumentPanel.getLayout().find(layout => layout.i === widgetId);
    if (typeof layout === 'undefined') {
      layout = widget.getInitialLayout();
    }
    return {
      id: widgetId,
      layout: layout,
      reactWidget: widget.getReactElement(),
      toolTips: widget.toolTips,
      handledSources: widget.getHandledSources()
    };
  });
  return result;
}

InstrumentPanel.prototype.getEnabledWidgets = function(page) {
  if (typeof page === 'undefined') {
    page = this.currentPage;
  }
  var activePage = (page === notificationPageId)? this.notificationPage : this.pages[page];
  var result = activePage.widgets.filter(function(widget) {
    return widget.options.active
  })
  return result;
}

InstrumentPanel.prototype.getDisabledWidgets = function(page) {
  if (typeof page === 'undefined') {
    page = this.currentPage;
  }
  var activePage = (page === notificationPageId)? this.notificationPage : this.pages[page];
  var result = activePage.widgets.filter(function(widget) {
    return ! widget.options.active
  })
  return result;
}

InstrumentPanel.prototype.connected = function() {
  this.schemadata = new SignalKSchemaData({
    host: this.SignalkClient.get('hostname'),
    port: this.SignalkClient.get('port'),
    tls: this.SignalkClient.get('useTLS')
  });
  this.layoutName = getLayoutName();
  this.setWidgetData(retrieveGrid(this.SignalkClient.get('hostname'), this.SignalkClient.get('port'), this.layoutName));
}

InstrumentPanel.prototype.sortNotificationLayout = function() {
  var widgets = this.getEnabledWidgets(notificationPageId);
  var oldLayout = this.notificationPage.layout;
  if (oldLayout.length === 0) {
    var yOffset = 0;
    widgets.forEach( widget => {
      oldLayout.push({
        w: 100,
        h: 2,
        x: 0,
        y: yOffset,
        i: widget.id,
        moved: false,
        static: false
      })
      yOffset *=2
    })
  }
  var newLayout = oldLayout.sort(function (item1, item2) {
    var id1 = item1.i;
    var id2 = item2.i;
    var widget1 = widgets.find(widget => widget.id === id1);
    var widget2 = widgets.find(widget => widget.id === id2);
    if ((typeof widget1 !== 'undefined') && (typeof widget2 !== 'undefined')) {
      if (widget1.notification.value.level > widget2.notification.value.level) return -1;
      if (widget1.notification.value.level < widget2.notification.value.level) return 1;
      if (widget1.notification.value.date > widget2.notification.value.date) return -1;
      if (widget1.notification.value.date < widget2.notification.value.date) return 1;
    } else { return 1 }
  });
  for (var y = 0; y < newLayout.length; y++) {
    newLayout[y].y = y*2;
  }
  this.notificationPage.layout = newLayout;
}

InstrumentPanel.prototype.updateNotificationLevel = function(levelChange) {
  if (typeof levelChange === 'undefined') {levelChange = false}
  var mustPushGridChanges = false;
  var newLevelEnabled;
  var newLevelDisabled;
  var widgets = this.getEnabledWidgets(notificationPageId);
  if (widgets.length > 0) {
    var maxWidget = widgets.reduce(function(previous, current) {
      if (typeof previous.notification.value === 'undefined'){
        previous = {'notification': {'value': {'level': 0}}}
      }
      if (typeof current.notification.value === 'undefined'){
        current = {'notification': {'value': {'level': 0}}}
      }
      return current.notification.value.level > previous.notification.value.level ? current : previous;
    });
    newLevelEnabled = maxWidget.notification.value.level;
  } else {
    newLevelEnabled = 0;
  }
  widgets = this.getDisabledWidgets(notificationPageId);
  if (widgets.length > 0) {
    var maxWidget = widgets.reduce(function(previous, current) {
      if (typeof previous.notification.value === 'undefined'){
        previous = {'notification': {'value': {'level': 0}}}
      }
      if (typeof current.notification.value === 'undefined'){
        current = {'notification': {'value': {'level': 0}}}
      }
      return current.notification.value.level > previous.notification.value.level ? current : previous;
    });
    newLevelDisabled = maxWidget.notification.value.level;
  } else {
    newLevelDisabled = 0;
  }
  if ((newLevelEnabled !== this.notificationLevel)
      || (newLevelDisabled !== this.notificationLevelHidden)) {
    this.notificationLevel = newLevelEnabled;
    this.notificationColor = this.notificationColors[this.notificationLevel];
    this.notificationLevelHidden = newLevelDisabled;
    this.notificationColorHidden = this.notificationColors[this.notificationLevelHidden];
    mustPushGridChanges = true;
  }
  if (mustPushGridChanges || (levelChange && this.currentPage === notificationPageId)) {
    this.pushGridChanges();
  }
}

const columnsForPaths = {
  navigation: 0,
  environment: 1
}

InstrumentPanel.prototype.getColumnforPath = function(path) {
  const group = path.split('.')[0];
  if (group === "notifications") {
    return 0
  }
  let column = columnsForPaths[group]
  if (typeof column === "undefined") {
    column = Object.keys(columnsForPaths).length
    columnsForPaths[group] = column
  }
  return column
}

InstrumentPanel.prototype.loadPreferredUnits = function() {
  var savedPreferredUnitsList = retrievePreferredUnits();
  if (savedPreferredUnitsList === null) {return;}

  if (savedPreferredUnitsList['date']) {
    if (getIndexFromDateFormatLabel(savedPreferredUnitsList['date']) > 0 ) {
      this.preferredUnits['date'] = savedPreferredUnitsList['date'];
    }
    savedPreferredUnitsList['date'] = undefined;
  }

  if (savedPreferredUnitsList['position']) {
    if (getIndexFromPositionFormatLabel(savedPreferredUnitsList['position']) > 0 ) {
      this.preferredUnits['position'] = savedPreferredUnitsList['position'];
    }
    savedPreferredUnitsList['position'] = undefined;
  }

  getConversionsList().map( srcUnit => {
    const dstUnit = savedPreferredUnitsList[srcUnit];
    if ((typeof dstUnit !== 'undefined') &&
        (typeof getConversion(srcUnit, dstUnit) === 'function')) {
      this.preferredUnits[srcUnit] = dstUnit;
    }
  })

  this.savePreferredUnits();
}

InstrumentPanel.prototype.savePreferredUnits = function() {
  storePreferredUnits(this.preferredUnits);
}

InstrumentPanel.prototype.loadWidgetActiveMode = function() {
  this.widgetActiveMode = retrieveWidgetActiveMode();
  this.saveWidgetActiveMode();
}

InstrumentPanel.prototype.saveWidgetActiveMode = function() {
  storeWidgetActiveMode(this.widgetActiveMode);
}

InstrumentPanel.prototype.getPreferredUnit = function(unit) {
  return this.preferredUnits[unit] || '';
}

InstrumentPanel.prototype.resetPreferredUnit = function() {
  this.preferredUnits = {};
  this.savePreferredUnits();
}

InstrumentPanel.prototype.setPreferredUnit = function(srcUnit, dstUnit) {
  let index = 0;
  if (srcUnit === 'date') {
    index = getIndexFromDateFormatLabel(dstUnit);
    this.preferredUnits[srcUnit] = (index > 0) ? dstUnit : undefined;
    this.savePreferredUnits();
    return index !== -1
  }
  if (srcUnit === 'position') {
    index = getIndexFromPositionFormatLabel(dstUnit);
    this.preferredUnits[srcUnit] = (index > 0) ? dstUnit : undefined;
    this.savePreferredUnits();
    return index !== -1
  }
  if (srcUnit === dstUnit) {
    this.preferredUnits[srcUnit] = undefined;
    this.savePreferredUnits();
    return true;
  }
  const conversion = getConversion(srcUnit, dstUnit)
  if (typeof conversion === 'function') {
    this.preferredUnits[srcUnit] = dstUnit;
    this.savePreferredUnits();
    return true;
  }
  return false;
}

InstrumentPanel.prototype.getPages = function() {
  return this.pages;
}

InstrumentPanel.prototype.getDarkMode = function() {
  return (this.colorScheme.colorSchemeCurrent === CS_DARK);
}

InstrumentPanel.prototype.setDarkMode = function(darkModeOn) {
  this.colorSchemeTool.scheme = (darkModeOn) ? CS_DARK : CS_LIGHT;
  this.colorScheme.colorSchemeCurrent = this.colorSchemeTool.scheme;
}

InstrumentPanel.prototype.getColorSchemeCurrent = function() {
  return this.colorScheme.colorSchemeCurrent;
}

InstrumentPanel.prototype.setColorSchemeSetBy = function(newColorSchemeSetBy) {
  this.colorScheme.colorSchemeSetBy = newColorSchemeSetBy;
}

InstrumentPanel.prototype.setColorSchemeSetByMAINBAR = function() {
  this.colorScheme.colorSchemeSetBy = CS_BY_MAINBAR;
}

InstrumentPanel.prototype.isColorSchemeByOS = function() {
  return (this.colorScheme.colorSchemeSetBy === CS_BY_OS);
}

InstrumentPanel.prototype.isColorSchemeSetBySKPATH = function() {
  return (this.colorScheme.colorSchemeSetBy === CS_BY_SKPATH);
}

InstrumentPanel.prototype.getReloadParams = function() {
  let params = {layout: this.layoutName};
  if (typeof this.signalkServer !== 'undefined') params['signalkServer'] = this.signalkServer;
  return params;
}

InstrumentPanel.prototype.getSsAvailable = function() {
  var connectionInfo = this.SignalkClient.connectionInfo;
  debug("[getSsAvailable] connectionInfo: " + JSON.stringify(connectionInfo));
  return (connectionInfo && connectionInfo.name === 'signalk-server' && compareVersions(connectionInfo.version, '1.27.0') >= 0);
}

InstrumentPanel.prototype.isMetaUpdateInWS = function() {
  var connectionInfo = this.SignalkClient.connectionInfo;
  return (connectionInfo && connectionInfo.name === 'signalk-server' && compareVersions(connectionInfo.version, '1.37.5') >= 0);
}

InstrumentPanel.prototype.retrieveLoginStatus = function(cb) {
  const opts = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  this.SignalkClient.fetch('/loginStatus', opts)
    .then(loginStatus => {
      debug("[fetch loginStatus] response OK:" + JSON.stringify(loginStatus))
      this.loginStatus = loginStatus;
      if (typeof cb === 'function') {
        cb(loginStatus);
      }
    }).catch(err => {
      debug("[fetch loginStatus] POST " + err)
      this.loginStatus = {};
      if (typeof cb === 'function') {
        cb(null);
      }
    })
}
