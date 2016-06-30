let Bacon = require('baconjs');
let BaconModel = require('bacon.model');
let {Client} = require('signalk-client');
let browser = require('./util/browser');

let debug = require('debug')('signalk:instrumentPanel');

let signalk = new Client;

//Have to use explicit require's for browserify
let widgetModules = [
  require('./ui/widgets/universal'),
  require('./ui/widgets/compass'),
  require('./ui/widgets/windmeter'),
  require('./ui/widgets/digitalposition')
];

let widgetModulesByType = {};
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
  this.isConnected = new Bacon.Model(false);
  this.streamBundle = streamBundle;
  this.currentPage = 0;
  this.pages = [newPage()];
  this.gridSettingsModel = new Bacon.Model("");
  this.pushGridChanges();
  var isUnkownKey = function(key) {
    return typeof this.getCurrentPage().knownKeys[key] === 'undefined';
  }.bind(this);
  this.streamBundle.allSources.filter(isUnkownKey).onValue(this.handlePossiblyNewSource.bind(this));

  if(browser.isConnected()) {
    this.reconnect();
  }
}

InstrumentPanel.prototype.setPage = function(page) {
  if (page > this.pages.length || page < 0) {
    debug("No such page:" + page);
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
      "w": initialDimensions.w,
      "h": initialDimensions.h,
      "x": 0,
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
    debug("Could not find widget for " + JSON.stringify(oneWidgetData));
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
  if (browser.getUrlParameter("useGridFromServer")) {
    browser.ajax("layouts/" + host.split(':')[0] + ".json",
      this.setWidgetData.bind(this),
      function(error) {
        debug(error);
      });
  } else {
    this.setWidgetData(browser.retrieveGrid(host));
  }

  browser.saveHost(host);
  browser.isConnected(true);
  this.isConnected.set(true);
}

InstrumentPanel.prototype.connect = function(host) {
  this.connection = signalk.connectDelta(host, this.dispatch.bind(this),
    function(skConnection) {
      skConnection.subscribeAll();
      this.connected(host);
    }.bind(this),
    this.disconnect,
    function(error) {
      debug(error);
    },
    'self'
  );
}

InstrumentPanel.prototype.disconnect = function() {
  if(this.connection) {
    this.connection.disconnect();
  }

  this.isConnected.set(false);
  browser.isConnected(false);
}

InstrumentPanel.prototype.reconnect = function() {
  this.connect(browser.retrieveLastHost());
}

InstrumentPanel.prototype.getHosts = function() {
  const hosts = browser.retrieveHosts();

  if(hosts === {}) {
    return [];
  }

  return hosts;
}

InstrumentPanel.prototype.getLastHost = function() {
  return browser.retrieveLastHost() || location.host;
}

module.exports = InstrumentPanel;
