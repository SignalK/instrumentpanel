var Bacon = require('baconjs');
var BaconModel = require('bacon.model');

var widgetModulesByType = {};
var widgetModulesByPath = {};

var browser = require('./util/browser');



//Have to use explicit require's for browserify
[
  require('./widgets/compass'),
  require('./widgets/windmeter'),
  require('./widgets/digital'),
  require('./widgets/digitalposition')
].forEach(function(widget) {
  widgetModulesByType[widget.type] = widget;
  widget.paths.forEach(function(path) {
    if (widgetModulesByPath[path]) {
      console.error("Multiple widget modules for path:" + path + " at least " + widget);
    }
    widgetModulesByPath[path] = widget;
  });

});


var Digital = require('./widgets/digital').constructor;
var Compass = require('./widgets/compass').constructor;



function InstrumentPanel(streamBundle) {
  this.streamBundle = streamBundle;
  this.widgetsByPath = {};
  this.widgets = [];
  this.layout = [];
  this.gridSettingsModel = new Bacon.Model("");
  this.pushGridChanges();
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
  delta.updates.forEach(function(update) {
    update.values.forEach(function(pathValue) {
      that.pushValue(pathValue);
    });
  });
}

InstrumentPanel.prototype.pushValue = function(pathValue) {
  this.streamBundle.push.call(this.streamBundle, pathValue);
  this.handlePossiblyNewPath(pathValue);
}


InstrumentPanel.prototype.handlePossiblyNewPath = function(pathValue) {
  if (!this.widgetsByPath[pathValue.path]) {
    var module = widgetModulesByPath[pathValue.path] || widgetModulesByType['digital'];
    var widget = new module.constructor(this.widgets.length, {
      path: pathValue.path,
      active: true
    }, this.streamBundle, this);
    widget.getHandledPaths().forEach(function(path) {
      this.widgetsByPath[path] = widget;
    }, this);
    this.widgets.push(widget);
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