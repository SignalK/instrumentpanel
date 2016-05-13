var React = require('react');

var BaseWidget = require('./basewidget');
require('util').inherits(Digital, BaseWidget);

var componentClass = require('./digitalcomponent');

function Digital(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options = options;
  this.widget = React.createElement(componentClass,{
    key: id,
    unit: this.getUnitForPath(options.path) || "",
    valueStream: streamBundle.getStreamForSourcePath(options.sourceId, options.path).toProperty(),
    label: this.getLabelForPath(options.path),
    sourceId: options.sourceId
  });
}

Digital.prototype.getReactElement = function() {
  return this.widget;
}

Digital.prototype.getType = function() {
  return "digital";
}

Digital.prototype.getOptions = function() {
  return this.options;
}

module.exports = {
  constructor: Digital,
  type: "digital",
  paths: []
}
