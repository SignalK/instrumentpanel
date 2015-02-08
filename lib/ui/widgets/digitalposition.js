var Digital = require('./digital').constructor;


function DigitalPosition(id, options, streamBundle) {
  Digital.call(this, id, options, streamBundle);
}

require('util').inherits(DigitalPosition, Digital);

DigitalPosition.prototype.displayValue = function(value) {
  return Number(value.latitude).toFixed(3) + '\u00b0 ' + Number(value.longitude).toFixed(3) + '\u00b0';
}

DigitalPosition.prototype.getType = function() {
  return "digitalposition";
}

module.exports = {
  constructor: DigitalPosition,
  type: "digitalposition",
  paths: ['navigation.position']
}
