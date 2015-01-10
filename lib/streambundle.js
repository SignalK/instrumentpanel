var Bacon = require('baconjs');

function StreamBundle() {
  this.streams = {};
}

StreamBundle.prototype.push = function(pathValue) {
  this.getStream(pathValue.path).push(pathValue.value);
}

StreamBundle.prototype.getStream = function(path) {
  var result = this.streams[path];
  if (!result) {
    result = this.streams[path] = new Bacon.Bus();
  }
  return result;
}

module.exports = StreamBundle;