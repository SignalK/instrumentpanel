var Digital = require('./digital').constructor;

var React = require('react');

function DigitalPosition(id, options, streamBundle, instrumentPanel) {
  Digital.call(this, id, options, streamBundle, instrumentPanel);
}

require('util').inherits(DigitalPosition, Digital);


DigitalPosition.prototype.getType = function() {
  return "digitalposition";
}

DigitalPosition.prototype.render = function() {
  return (
    <svg height="100%" width="100%" viewBox="0 0 20 40">
      <text x="10" y="19" textAnchor="middle" fontSize="16" dominant-baseline="middle">{(this.state.value.longitude ? this.state.value.longitude.toFixed(3) : '--.--')+'\u00b0'}</text>
      <text x="10" y="35" textAnchor="middle" fontSize="16" dominant-baseline="middle">{(this.state.value.latitude ? this.state.value.latitude.toFixed(3) : '--.--')+'\u00b0'}</text>
      <text x="10" y="4" textAnchor="middle" fontSize="5" dominant-baseline="middle">{this.state.label}</text>
    </svg>    
  )
}

module.exports = {
  constructor: DigitalPosition,
  type: "digitalposition",
  paths: ['navigation.position']
}
