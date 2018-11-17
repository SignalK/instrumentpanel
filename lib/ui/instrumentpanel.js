var Bacon = require('baconjs');
var BaconModel = require('bacon.model');

var widgetModulesByType = {};
var widgetModulesByPath = {};

var browser = require('../util/browser');
var signalkClient = require('@signalk/client').Client;
var signalk = new signalkClient;
var SignalKSchemaData = require('../util/signalkschemadata');

//Have to use explicit require's for browserify
var widgetModules = [
  require('./widgets/universal'),
  require('./widgets/compass'),
  require('./widgets/windmeter'),
  require('./widgets/digitalposition')
];

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

function InstrumentPanel(streamBundle) {
  this.flushCache = false;
  this.streamBundle = streamBundle;
  this.currentPage = 0;
  this.pages = [newPage()]
  this.gridSettingsModel = new Bacon.Model("");
  this.pushGridChanges();
  var isUnkownKey = function(key) {
    return typeof this.getCurrentPage().knownKeys[key] === 'undefined';
  }.bind(this)
  this.streamBundle.allSources.filter(isUnkownKey).onValue(this.handlePossiblyNewSource.bind(this));
}

InstrumentPanel.prototype.setPage = function(page) {
  if (page > this.pages.length || page < 0) {
    console.error("No such page:" + page);
  }
  if (page === this.pages.length && page < 10) {
    this.pages[page] = newPage();
  }
  this.currentPage = page;
  this.pushGridChanges();
}

InstrumentPanel.prototype.deleteCurrentPage = function() {
  //TODO implement unsubscribe
  this.pages.splice(this.currentPage, 1);
  this.currentPage = Math.min(this.currentPage, this.pages.length-1);
  this.persist();
  this.pushGridChanges();
}

InstrumentPanel.prototype.getCurrentPage = function() {
  return this.pages[this.currentPage];
}

InstrumentPanel.prototype.getLayout = function() {
  return this.pages[this.currentPage].layout;
}

InstrumentPanel.prototype.getWidgets = function() {
  return this.pages[this.currentPage].widgets;
}

InstrumentPanel.prototype.pushGridChanges = function() {
  this.gridSettingsModel.set({
    layout: this.getLayout(),
    activeWidgets: this.getActiveWidgets(),
    serializable: this.serializableSettings()
  });
}

InstrumentPanel.prototype.dispatch = function(delta) {
  this.streamBundle.handleDelta(delta);
}

InstrumentPanel.prototype.handlePossiblyNewSource = function(newSource) {
  var handled = this.getWidgets().reduce(function(previous, widget) {
    return widget.handleNewSource.call(widget, newSource) || previous
  }, false);
  if (!handled) {
    var module = widgetModuleFor(newSource.path) || widgetModules[0];
    var widget = new module.constructor(this.getWidgets().length, {
      sourceId: newSource.sourceId,
      key: newSource.key,
      path: newSource.path,
      active: true
    }, this.streamBundle, this);
    this.getWidgets().push(widget);
    var initialDimensions = widget.getInitialDimensions();
    this.getLayout().unshift({
      "w": 2,
      "h": initialDimensions.h,
      "x": getColumnforPath(newSource.path) * 2,
      "y": 0,
      "i": this.getLayout().length + ''
    });
    this.pushGridChanges();
  }
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
        knownKeys: page.knownKeys
      }
    })
  }
}

InstrumentPanel.prototype.setWidgetData = function(widgetData) {
  var that = this;
  if (widgetData && widgetData.pages) {
    this.pages = widgetData.pages.map(function(page) {
      return {
        layout: page.layout,
        widgets: page.widgets.map(that.deserializeWidget.bind(that)),
        knownKeys: page.knownKeys
      }
    });
    this.currentPage = 0;
    this.pushGridChanges();
  }
}

InstrumentPanel.prototype.deserializeWidget = function(oneWidgetData, i) {
  var module = widgetModulesByType[oneWidgetData.type];
  if (!module) {
    console.error("Could not find widget for " + JSON.stringify(oneWidgetData));
    return new widgetModules[0].constructor(i, {
      path: 'error'
    }, this.streamBundle);
  }
  if (typeof oneWidgetData.options.active === 'undefined') {
    oneWidgetData.options.active = true;
  }
  var widget = new module.constructor(i, oneWidgetData.options, this.streamBundle, this);
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
  browser.saveGrid(this.host, this.serializableSettings());
}

InstrumentPanel.prototype.getActiveWidgets = function() {
  var result = this.pages[this.currentPage].widgets.filter(function(widget) {
    return widget.options.active
  }).
  map(function(widget) {
    return widget.getReactElement();
  });
  return result;
}

InstrumentPanel.prototype.connected = function(host) {
  var that = this;
  this.host = host;
  this.schemadata = new SignalKSchemaData({host: host.split(':')[0], port: host.split(':')[1], ssl: this.useSSL});
  if (browser.getUrlParameter("flushCache")) {
    this.flushCache = true;
  }
  if (browser.getUrlParameter("useGridFromServer")) {
    browser.ajax("layouts/" + host.split(':')[0] + ".json",
      this.setWidgetData.bind(this),
      function(error) {
        console.log(error)
      });
  } else {
    this.setWidgetData(browser.retrieveGrid(host));
  }
}


const columnsForPaths = {
  navigation: 0,
  environment: 1
}

function getColumnforPath(path) {
  const group = path.split('.')[0]
  let column = columnsForPaths[group]
  if (typeof column === "undefined") {
    column = Object.keys(columnsForPaths).length
    columnsForPaths[group] = column
  }
  return column
}

module.exports = InstrumentPanel;
