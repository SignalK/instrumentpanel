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
import Debug from 'debug';
const debug = Debug('instrumentpanel:streambundle')
import { Bus } from 'baconjs';

import {
  CS_BY_SKPATH
} from './ui/settings/constants'

function getSourceId(source) {
  if (!source) {
    return 'no_source';
  }
  if (source.src || source.pgn) {
    return source.label +
      (source.src ? '.' + source.src : '') +
      (source.instance ? '.' + source.instance : '');
  }
  if (typeof source === 'object') {
    return source.label + (source.talker ? '.' + source.talker : '.XX');
  }
  //source data is actually from $source, not source: {...}
  return source
}

function keyForSourceIdPath(sourceId, path) {
  return sourceId + "." + path;
}

export default function StreamBundle() {
  this.buses = {};
  this.streams = {};
  // Only one bus for all meta data. Filtering is on arrival in the widget (low bitrate on meta)
  this.metasStream = new Bus();
  this.pathValues = new Bus();
  this.allSources = new Bus();
}

StreamBundle.prototype.handleDelta = function (delta, instrumentPanel) {
  var that = this;
  delta.updates && delta.updates.forEach(function (update) {
    var sourceId = getSourceId(update.source);
    update.meta && update.meta.forEach(function (pathMeta) {
      pathMeta = instrumentPanel.schemadata.mergeMetaInCache(pathMeta);
      debug("[handleDelta] receive new meta:" + JSON.stringify(pathMeta))
      that.metasStream.push(pathMeta);
    });
    update.values && update.values.forEach(function (pathValue) {
      if (pathValue.path) {
        try {
          if (pathValue.path === 'notifications.server.newVersion') {
            pathValue.value.state = "nominal"
          }
        } catch (error) { console.log(error) }
        if (sourceId === 'no_source') {
          if (update.$source) that.push(update.$source, pathValue);
          if (instrumentPanel.legacySourcesOn) that.push(sourceId, pathValue);
        } else {
          that.push(sourceId, pathValue);
        }
        try {
          if ((pathValue.path === 'environment.mode') && instrumentPanel.colorSchemeSetBy === CS_BY_SKPATH) {
            const nightOn = pathValue.value.toString() === 'night';
            if (instrumentPanel.getDarkMode() !== nightOn) {
              instrumentPanel.setDarkMode(!instrumentPanel.getDarkMode());
            }
          }
        } catch (error) { console.log(error) }
      }
    });
  });
}

StreamBundle.prototype.push = function (sourceId, pathValue) {
  pathValue.sourceId = sourceId;
  this.getBusForSourcePath(sourceId, pathValue.path).bus.push(pathValue.value);
  var key = keyForSourceIdPath(sourceId, pathValue.path);
  this.allSources.push({
    sourceId: sourceId,
    path: pathValue.path,
    key: key
  });
  this.pathValues.push(pathValue);
}

StreamBundle.prototype.getBusForSourcePath = function (sourceId, path) {
  var key = keyForSourceIdPath(sourceId, path);
  var result = this.buses[key];
  if (!result) {
    var newBus = new Bus();
    // on the new notification path, hold the new bus and subscribe to it to keep notifications received
    // while waiting for the widget to be created.
    // The widget will reopen the bus and cancel the temporary subscription.
    if (path.startsWith("notifications")) {
      var valve = new Bus();
      var holdBus = newBus.holdWhen(valve.toProperty(true));
      var holdBusUnsub = holdBus.forEach()
    }
    result = this.buses[key] = {
      bus: newBus,
      valve: valve,
      holdBus: (typeof holdBus === 'undefined') ? newBus : holdBus,
      holdBusUnsub: holdBusUnsub
    }
  }
  return result;
}

StreamBundle.prototype.getValueStreamForSourcePath = function (sourceId, path) {
  var key = keyForSourceIdPath(sourceId, path);
  var result = this.streams[key];
  if (!result) {
    var bus = this.getBusForSourcePath(sourceId, path).holdBus;
    result = (!path.startsWith("notifications")) ? bus : bus.debounceImmediate(200);
    result = this.streams[key] = result.toProperty();
    // null subscription to allow the bus to store at least the last value received and retrieved by toProperty
    result.forEach();
  }
  return result;
}
