var Bacon = require('baconjs');
var BaconModel = require('bacon.model');

var widgetModulesByType = {};
var widgetModulesByPath = {};

var browser = require('./util/browser');
var signalkClient = require('signalk-client').Client;
var signalk = new signalkClient;

var vesselSchema = require('signalk-schema/schemas/vessel');

var signalkMainPaths = {};
for (var prop in vesselSchema.properties) {
  if (typeof vesselSchema.properties[prop] === 'object') {
    signalkMainPaths[prop] = true;
  }
}



//Have to use explicit require's for browserify
var widgetModules = [
  require('./widgets/digital'),
  require('./widgets/compass'),
  require('./widgets/windmeter'),
  require('./widgets/digitalposition'),
  require('./widgets/analog')
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


var Digital = require('./widgets/digital').constructor;
var Compass = require('./widgets/compass').constructor;



function InstrumentPanel(streamBundle) {
  this.streamBundle = streamBundle;
  this.widgetsByPath = {};
  this.widgets = [];
  this.layout = [];
  this.gridSettingsModel = new Bacon.Model("");
  this.pushGridChanges();
  this.isSelf = function() {
    return true;
  }
}

InstrumentPanel.prototype.pushGridChanges = function() {
  this.gridSettingsModel.set({
    layout: this.layout,
    activeWidgets: this.getActiveWidgets(),
    serializable: this.serializableSettings()
  });
}

InstrumentPanel.prototype.dispatch = function(delta) {
  var that = this;
  if (this.isSelf(delta) && delta.updates) {
    delta.updates.forEach(function(update) {
      update.values.forEach(function(pathValue) {
        if (signalkMainPaths[pathValue.path.split('.')[0]]) {
          that.pushValue(pathValue);
        }
      });
    });
  }
}

InstrumentPanel.prototype.pushValue = function(pathValue) {
  this.handlePossiblyNewPath(pathValue);
  this.streamBundle.push.call(this.streamBundle, pathValue);
}


InstrumentPanel.prototype.handlePossiblyNewPath = function(pathValue) {
  if (!this.widgetsByPath[pathValue.path]) {
    var module =  widgetModuleFor(pathValue.path) || widgetModules[0];
    var widget = new module.constructor(this.widgets.length, {
      path: pathValue.path,
      active: true
    }, this.streamBundle, this);
    widget.getHandledPaths().forEach(function(path) {
      this.widgetsByPath[path] = widget;
    }, this);
    this.widgets.push(widget);
    this.layout.push( {
      "w": 2,
      "h": 2,
      "x": 0,
      "y": 0,
      "i": this.layout.length
    });
    this.pushGridChanges();
  }
}


InstrumentPanel.prototype.setWidgetData = function(widgetData) {
  if (widgetData) {
    this.layout = widgetData.layout;
    this.widgets = widgetData.widgets.map(this.deserializeWidget.bind(this));
    this.widgetsByPath = {};
    var that = this;
    this.widgets.forEach(function(widget) {
      widget.instrumentPanel = that;
      widget.getHandledPaths().forEach(function(path) {
        this.widgetsByPath[path] = widget;
      }, this);
    }, this);
    this.pushGridChanges();
  }
}

InstrumentPanel.prototype.deserializeWidget = function(oneWidgetData, i) {
  var module = widgetModulesByType[oneWidgetData.type];
  if (!module) {
    console.error("Could not find widget for " + JSON.stringify(oneWidgetData));
    return new Digital(i, {
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
  this.layout = layout;
  this.persist();
}

InstrumentPanel.prototype.onWidgetChange = function(widget) {
  this.pushGridChanges();
}


InstrumentPanel.prototype.persist = function(layout) {
  browser.saveGrid(this.host, this.serializableSettings());
}

InstrumentPanel.prototype.getActiveWidgets = function() {
  var result = this.widgets.filter(function(widget) {
    return widget.options.active
  }).
  map(function(widget) {
    return widget.getReactElement();
  });
  return result;
}

InstrumentPanel.prototype.serializableSettings = function() {
  return {
    layout: this.layout,
    widgets: this.widgets.map(function(widget) {
      return {
        type: widget.getType(),
        options: widget.getOptions()
      }
    })
  }
}

InstrumentPanel.prototype.connected = function(host) {
  var that = this;
  signalk.getSelfMatcher(host)
    .then(function(selfMatcher) {
      that.isSelf = selfMatcher;
    })
    .catch(function(error) {
      console.log(error);
    });
  this.host = host;
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

module.exports = InstrumentPanel;
