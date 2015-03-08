var React = require('react');

var BaseWidget = require('./basewidget');
require('util').inherits(Digital, BaseWidget);

function Digital(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options = options;
  this.widget = React.createElement(this.createClass(this.displayValue, this.render),{
    key: id,
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
      <text x="10" y="30" textAnchor="middle" fontSize="26" dominant-baseline="middle">{this.state.value}</text>
      <text x="10" y="4" textAnchor="middle" fontSize="5" dominant-baseline="middle">{this.state.label}</text>
    </svg>    
  )
}
    
Digital.prototype.displayValue = function(value) {
  return value
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