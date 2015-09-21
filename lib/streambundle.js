var Bacon = require('baconjs');

function StreamBundle() {
  this.buses = {};
  this.streams = {};
  this.pathValues = new Bacon.Bus();
}

StreamBundle.prototype.push = function(pathValue) {
  this.pathValues.push(pathValue);
  this.getBus(pathValue.path).push(pathValue.value);
}

StreamBundle.prototype.getBus = function(path) {
  var result = this.buses[path];
  if (!result) {
    result = this.buses[path] = new Bacon.Bus();
    this.streams[path] = result.debounceImmediate(200);
  }
  return result;
}

StreamBundle.prototype.getStream = function(path) {
  var result = this.streams[path];
  if (!result) {
    var tmp = this.buses[path] = new Bacon.Bus();
    result = this.streams[path] = tmp.debounceImmediate(200);
  }
  return result;
}

module.exports = StreamBundle;