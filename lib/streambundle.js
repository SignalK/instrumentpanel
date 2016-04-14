/*

StreamBundle is a "bundle of streams": Bacon.js streams, two
for each Signal K (source, path) combination. You can get a stream
for the raw data with getBusForSourcePath and a stream where data
is debounced (200 ms) and some units converted with
getStreamForSourcePath.

All incoming Signal K deltas should be passed in via handleDelta.

In addition to the individual streams StreamBundle provides a
stream that contains notifications of new (source, path)
combinations appearing in the incoming data. The data in
that stream contains {sourceId, path, key, stream} objects.
InstrumentPanel discovers new data items by listening to this
stream.

Key is a 'standard' single string representation  of source id
and path produced with signalkSchema.keyForSourceIdPath.

*/


var Bacon = require('baconjs');
var Qty = require('js-quantities');
var signalkSchema = require('signalk-schema');

var conversions = {
  "rad": Qty.swiftConverter('rad', 'deg'),
  "K": Qty.swiftConverter("tempK", "tempC")
}

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
    this.buses[path] = new Bacon.Bus();
    result = this.streams[path] = this.buses[path].debounceImmediate(200);
    if (signalkSchema.metadata[path] && conversions[signalkSchema.metadata[path].units]) {
      result = this.streams[path] = this.streams[path].map(conversions[signalkSchema.metadata[path].units]);
    }

  }
  return result;
}

module.exports = StreamBundle;
