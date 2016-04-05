var Bacon = require('baconjs');
var Qty = require('js-quantities');
var signalkSchema = require('signalk-schema');

var vesselSchema = require('signalk-schema/schemas/vessel');
var signalkMainPaths = {};
for (var prop in vesselSchema.properties) {
  if (typeof vesselSchema.properties[prop] === 'object') {
    signalkMainPaths[prop] = true;
  }
}

var conversions = {
  "rad": Qty.swiftConverter('rad', 'deg'),
  "K": Qty.swiftConverter("tempK", "tempC")
}

function StreamBundle() {
  this.buses = {};
  this.streams = {};
  this.pathValues = new Bacon.Bus();
  this.newSources = new Bacon.Bus();
}

StreamBundle.prototype.handleDelta = function(delta) {
  var that = this;
  if (delta.updates) {
    delta.updates.forEach(function(update) {
      var sourceId = signalkSchema.getSourceId(update.source);
      update.values.forEach(function(pathValue) {
        if (signalkMainPaths[pathValue.path.split('.')[0]]) {
          that.push(sourceId, pathValue)
        }
      });
    });
  }
}

StreamBundle.prototype.push = function(sourceId, pathValue) {
  pathValue.sourceId = sourceId;
  this.pathValues.push(pathValue);
  this.getBusForPath(pathValue.path).push(pathValue.value);
  this.getBusForSourcePath(sourceId, pathValue.path).push(pathValue.value);
}

StreamBundle.prototype.getBusForPath = function(path) {
  var result = this.buses[path];
  if (!result) {
    result = this.buses[path] = new Bacon.Bus();
  }
  return result;
}

StreamBundle.prototype.getBusForSourcePath = function(sourceId, path) {
  var key = signalkSchema.keyForSourceIdPath(sourceId, path);
  var result = this.buses[key];
  if (!result) {
    result = this.buses[key] = new Bacon.Bus();
    this.newSources.push({
      sourceId: sourceId,
      path: path,
      key: key,
      stream: this.getStreamForSourcePath(sourceId, path)
    });
  }
  return result;
}

StreamBundle.prototype.getStream = function(path) {
  var result = this.streams[path];
  if (!result) {
    var bus = this.getBusForPath(path);
    result = this.streams[path] = bus.debounceImmediate(200);
    if (signalkSchema.metadata[path] && conversions[signalkSchema.metadata[path].units]) {
      result = this.streams[path] = this.streams[path].map(conversions[signalkSchema.metadata[path].units]);
    }

  }
  return result;
}

StreamBundle.prototype.getStreamForSourcePath = function(sourceId, path) {
  var key = signalkSchema.keyForSourceIdPath(sourceId, path);
  var result = this.streams[key];
  if (!result) {
    var bus = this.getBusForSourcePath(sourceId, path);
    result = this.streams[key] = bus.debounceImmediate(200);
    if (signalkSchema.metadata[path] && conversions[signalkSchema.metadata[path].units]) {
      result = this.streams[key] = this.streams[key].map(conversions[signalkSchema.metadata[path].units]);
    }

  }
  return result;
}


module.exports = StreamBundle;
