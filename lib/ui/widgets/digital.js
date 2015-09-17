var React = require('react');

var BaseWidget = require('./basewidget');
require('util').inherits(Digital, BaseWidget);

function Digital(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options = options;
  this.widget = React.createElement(this.createClass(this.displayValue, this.render),{
    key: id,
    unit: this.getUnitForPath(options.path) || "",
    value: streamBundle.getStream(options.path),
    label: this.getLabelForPath(options.path)
  });
}

Digital.prototype.createClass = function(displayValue, render) {
  return React.createClass({
    mixins: [require('../util/baconvaluewithlabelmixin')],
    displayValue: displayValue,
    render: render
  })
}

Digital.prototype.render = function() {
  return (
    <svg height="100%" width="100%" viewBox="0 0 20 40">
      <text x="10" y="8" textAnchor="middle" fontSize="5" dominant-baseline="middle">
        {this.state.label}
      </text>
      <g transform="translate(10, 0)">
        <text textAnchor="middle" y="32" fontSize="26" dominant-baseline="middle">
          {this.state.value}
        </text>
        <text textAnchor="end" x="40" y="32" fontSize="8" dominant-baselie="middle">
          {this.state.unit}
        </text>
      </g>
    </svg>
  )
}

Digital.prototype.displayValue = function(value) {
  if(typeof value === 'number') {
    var v = Math.abs(value);
    if(v >= 50) {
      return value.toFixed(0);
    } else if(v >= 10) {
      return value.toFixed(1);
    } else {
      return value.toFixed(2);
    }
  }

  return value;
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

Digital.prototype.getHandledPaths = function() {
  return [this.options.path];
}

module.exports = {
  constructor: Digital,
  type: "digital",
  paths: []
}
