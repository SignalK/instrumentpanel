var Bacon = require('baconjs');

var widgetModulesByType = {};
var widgetModulesByPath = {};


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
  this.changes = new Bacon.Bus();
}

InstrumentPanel.prototype.push = function(pathValue) {
  this.streamBundle.push.call(this.streamBundle, pathValue);
  this.handlePossiblyNewPath(pathValue);
}

InstrumentPanel.prototype.onWidgetListChanged = function(func) {
  this.onWidgetListChanged = func;
}

InstrumentPanel.prototype.handlePossiblyNewPath = function(pathValue) {
  if (!this.widgetsByPath[pathValue.path]) {
    var module = widgetModulesByPath[pathValue.path] || widgetModulesByType['digital'];
    var widget = new module.constructor(this.widgets.length, {path: pathValue.path}, this.streamBundle);
    widget.getHandledPaths().forEach(function(path) {
      this.widgetsByPath[path] = widget;
    }, this);
    this.widgets.push(widget);
    if (this.onWidgetListChanged) {
      this.onWidgetListChanged();
    }
  }
}


InstrumentPanel.prototype.setWidgetData = function(widgetData) {
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
}

InstrumentPanel.prototype.deserializeWidget = function(oneWidgetData, i) {
  var module = widgetModulesByType[oneWidgetData.type];
  if (!module) {
    console.error("Could not find widget for " + JSON.stringify(oneWidgetData));
    return new Digital(i, {
      path: 'error'
    }, this.streamBundle);
  }
  return new module.constructor(i, oneWidgetData.options, this.streamBundle);

}

InstrumentPanel.prototype.getWidgetLayout = function() {
  return this.layout || [];
}

InstrumentPanel.prototype.onLayoutChange = function(layout) {
  this.layout = layout;
}

InstrumentPanel.prototype.onWidgetChange = function(widget) {
  changes.push(widget);
}

InstrumentPanel.prototype.getWidgets = function() {
  return this.widgets.filter(function(widget) {
    return widget.active
  }).
  map(function(widget) {
    return widget.getReactElement();
  });
}

InstrumentPanel.prototype.serialize = function() {
  return JSON.stringify({
    layout: this.layout,
    widgets: this.widgets.map(function(widget){
      return {
        type: widget.getType(),
        options: widget.getOptions()
      }
    })
  })
}

module.exports = InstrumentPanel;