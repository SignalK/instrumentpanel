var React = require('react');



var pathsCovered = [
  "navigation.courseOverGroundTrue",
  "navigation.courseOverGroundMagnetic",
];

var componentClass = require('./compassreadingcomponent');
// var componentClass = require('./compassRoseComponent');

var BaseWidget = require('./basewidget');
require('util').inherits(Compass, BaseWidget);

function Compass(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options = options;
  this.options.initialDimensions = this.options.initialDimensions || {w: 2, h: 4};
  this.widget = React.createElement(componentClass,{
    key: id,
    value: streamBundle.getStreamForSourcePath(options.sourceId, options.path),
    label: this.getLabelForPath(options.path),
    sourceId: options.sourceId
  });
}

Compass.prototype.getReactElement = function() {
  return this.widget;
}

Compass.prototype.getType = function() {
  return "compass";
}

Compass.prototype.getOptions = function() {
  return this.options;
}

Compass.prototype.getInitialDimensions = function() {
  return this.options.initialDimensions;
}

module.exports = {
  constructor: Compass,
  type: "compass",
  paths: pathsCovered
}
