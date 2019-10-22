import BaconModel from 'bacon.model';
import {
  getUrlParameter,
  getLayoutName
} from '../util/browser';
import {
  retrievePreferredUnits as localstorageRetrievePreferredUnits,
  savePreferredUnits as localstorageSavePreferredUnits,
  defaultLayoutName,
  saveGrid as localstorageSaveGrid,
  retrieveGrid as localstorageRetrieveGrid,
} from '../util/localstorage';
import SignalKSchemaData from '../util/signalkschemadata';
import {
  getConversionsList,
  getConversion
} from './settings/conversions'
import Universal from './widgets/universal';
import Compass from './widgets/compass';
import Windmeter from './widgets/windmeter';
import Digitalposition from './widgets/digitalposition';
import Digitaldatetime from './widgets/digitaldatetime';
import Attitude from './widgets/attitude';
import Notification from './widgets/notification';
import Specifictext from './widgets/specifictext';

import { Client } from '@signalk/client';

const notificationPageId = -1;

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

function newPage() {
  return {
    layout: [],
    widgets: [],
    knownKeys: {}
  }
}

export default function InstrumentPanel(streamBundle) {
  this.flushCache = false;
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
  this.reloadRequired = false;
  this.preferredUnits = {};
  this.layoutName = defaultLayoutName;
  var isUnkownKey = function(key) {
    return typeof this.getCurrentPage().knownKeys[key.key] === 'undefined';
  }.bind(this)
  this.streamBundle.allSources.filter(isUnkownKey).onValue(this.handlePossiblyNewSource.bind(this));

  var useTLS = window.location.protocol === 'https:'
  var host = window.location.hostname;
  var port = parseInt(window.location.port);
  if (!Number.isInteger(port)) {
    port = (useTLS) ? 443 : 80;
  }
  const signalkServer = getUrlParameter("signalkServer");
  if (typeof signalkServer !== 'undefined') {
    useTLS = signalkServer.startsWith('wss://');
    host = signalkServer.split(':')[1].replace(/\//g, '');
    port = parseInt(signalkServer.split(':')[2]);
    if (!Number.isInteger(port)) {
      port = (useTLS) ? 443 : 80;
    }
  }
  this.SignalkClient = new Client({
    hostname: host,
    port: port,
    useTLS: useTLS,
    reconnect: true,
    autoConnect: false,
    notifications: false,
    maxRetries: 10
  });
  this.loadPreferredUnits();
}

InstrumentPanel.prototype.setReloadRequired = function() {
  this.reloadRequired = true;
}

InstrumentPanel.prototype.isReloadRequired = function() {
  return this.reloadRequired;
}

InstrumentPanel.prototype.setPage = function(page) {
  if (page > this.pages.length || page < notificationPageId) {
    console.error("No such page:" + page);
    page = 0;
  }
  if (page === this.pages.length && page < 10) {
    this.pages[page] = newPage();
    this.populateNewPage(page);
  }
  this.currentPage = page;
  this.sortNotificationLayout();
  this.pushGridChanges();
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
        newOptions.active = true;
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

InstrumentPanel.prototype.pushGridChanges = function() {
  this.gridSettingsModel.set({
    layout: this.getLayout(this.currentPage),
    activeWidgets: this.getActiveWidgets(),
    serializable: this.serializableSettings()
  });
}

InstrumentPanel.prototype.dispatch = function(delta) {
  this.streamBundle.handleDelta(delta);
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
    var widget = new module.constructor(handlePage + '-' + this.getWidgets(handlePage).length, {
      sourceId: newSource.sourceId,
      key: newSource.key,
      path: newSource.path,
      active: true
    }, this.streamBundle, this);
    this.getWidgets(handlePage).push(widget);
    this.pushGridChanges();
  }
  this.getCurrentPage().knownKeys[newSource.key] = true;
}

InstrumentPanel.prototype.serializableSettings = function() {
  return {
    pages: this.pages.map(function(page) {
      return {
        layout: page.layout,
        widgets: page.widgets.map(function(widget) {
          return {
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
      if (typeof page.widgets !== 'undefined') {
        for (const [key, widget] of page.widgets.entries()) {
          if ((widget.type === 'notification') || ( new RegExp('^notifications\.').test(widget.options.path))) {
            page.layout.splice(key,1);
            page.widgets.splice(key,1);
          }
        }
      }
      return {
        layout: page.layout.map(that.updateLayoutFormat.bind(that, pageID)),
        widgets: page.widgets.map(that.deserializeWidget.bind(that, pageID)),
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
  var widget = new module.constructor(pageID + '-' + i, oneWidgetData.options, this.streamBundle, this);
  this.getCurrentPage().knownKeys[oneWidgetData.options.key] = true;
  return widget;
}


InstrumentPanel.prototype.onLayoutChange = function(layout) {
  this.getCurrentPage().layout = layout;
  this.persist();
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
      localstorageSaveGrid(this.SignalkClient.get('hostname'), this.layoutName, that.serializableSettings());
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
  if (getUrlParameter("flushCache")) {
    this.flushCache = true;
  }
  this.layoutName = getLayoutName();
  this.setWidgetData(localstorageRetrieveGrid(this.SignalkClient.get('hostname'), this.SignalkClient.get('port'), this.layoutName));
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

InstrumentPanel.prototype.getColumnforPath = function getColumnforPath(path) {
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

InstrumentPanel.prototype.loadPreferredUnits = function loadPreferredUnits() {
  var savedPreferredUnitsList = localstorageRetrievePreferredUnits();
  if (savedPreferredUnitsList === null) {return;}

  getConversionsList().map( srcUnit => {
    const dstUnit = savedPreferredUnitsList[srcUnit];
    if ((typeof dstUnit !== 'undefined') &&
        (typeof getConversion(srcUnit, dstUnit) === 'function')) {
      this.preferredUnits[srcUnit] = dstUnit;
    }
  })

  this.savePreferredUnits();
}

InstrumentPanel.prototype.savePreferredUnits = function savePreferredUnits() {
  localstorageSavePreferredUnits(this.preferredUnits);
}

InstrumentPanel.prototype.getPreferredUnit = function getPreferredUnit(unit) {
  return this.preferredUnits[unit] || '';
}

InstrumentPanel.prototype.resetPreferredUnit = function resetPreferredUnit() {
  this.preferredUnits = {};
  this.savePreferredUnits();
}

InstrumentPanel.prototype.setPreferredUnit = function setPreferredUnit(srcUnit, dstUnit) {
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

InstrumentPanel.prototype.getPages = function getPages() {
  return this.pages;
}
