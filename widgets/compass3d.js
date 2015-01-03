var compass = require('signalk-compass');

function Compass3D(selector) {
  var canvas = $(selector);
  compass.init(canvas, canvas.width(), canvas.height());
}

Compass3D.prototype.setLabel = function(value) {
  // SET COMPASS LABEL
  return;
}

Compass3D.prototype.setValue = function(heading) {
  compass.update(heading);
}

Compass3D.prototype.resize = function(width, height) {
  compass.resize(width, height);
}

module.exports = Compass3D;