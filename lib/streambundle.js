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
import {Bus, repeatedly, combineWith} from 'baconjs';

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
  this.pathValues  = new Bus();
  this.allSources  = new Bus();
  this.navbarVisible = new Bus();
  this.checkTimeout = repeatedly(10000, true); //how often to check if data is stale
  this.metasStream.forEach();
}

StreamBundle.prototype.handleDelta = function(delta, instrumentPanel) {
  var that = this;
  delta.updates && delta.updates.forEach(function(update) {
    let timestamp = new Date(update.timestamp).getTime();
    var sourceId = getSourceId(update.source);
    update.meta && update.meta.forEach(function(pathMeta) {
      /*
      pathMeta = {
        path: "sample.path",
        value: {objectMeta}
      }
      */
      pathMeta = instrumentPanel.schemadata.mergeMetaInCache(pathMeta);
      debug("[handleDelta] receive new meta:" + JSON.stringify(pathMeta))
      that.metasStream.push(pathMeta);
    });
    update.values && update.values.forEach(function(pathValue) {
      /*
      pathValue = {
        path: "sample.path",
        value: {objectValue || string || number || null}
      }
      */
      if(pathValue.path) {
        if (sourceId === 'no_source'){
          if (update.$source) that.push(update.$source, pathValue, timestamp);
          if (instrumentPanel.legacySourcesOn) that.push(sourceId, pathValue, timestamp);
        } else {
          that.push(sourceId, pathValue, timestamp);
        }
        try {
          if ((pathValue.path === 'environment.mode') && instrumentPanel.isColorSchemeSetBySKPATH()) {
            const nightOn = pathValue.value.toString() === 'night';
            if (instrumentPanel.getDarkMode() !== nightOn) {
              instrumentPanel.setDarkMode(! instrumentPanel.getDarkMode());
            }
          }
        } catch(error) {console.log(error)}
      }
    });
  });
}

StreamBundle.prototype.push = function(sourceId, pathValue, timestamp) {
  pathValue.sourceId = sourceId;
/*
  pushed in BusForSourcePath = {
    path: "sample.path",
    value: {objectValue || string || number || null}
    timestamp: the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
  }
*/
  this.getBusForSourcePath(sourceId, pathValue.path).push({value: pathValue.value, timestamp});
  var key = keyForSourceIdPath(sourceId, pathValue.path);
  this.allSources.push({
    sourceId: sourceId,
    path: pathValue.path,
    key: key
  });

  this.pathValues.push(pathValue);
}

StreamBundle.prototype.getBusForSourcePath = function(sourceId, path) {
  var key = keyForSourceIdPath(sourceId, path);
  var result = this.buses[key];
  if(!result) {
    result = this.buses[key] = new Bus();
  }
  return result;
}

StreamBundle.prototype.getValueStreamForSourcePath = function(sourceId, path) {
  var key = keyForSourceIdPath(sourceId, path);
  var result = this.streams[key];
  if(!result) {
    var bus = this.getBusForSourcePath(sourceId, path);
    result = bus.debounceImmediate(200);
    result = this.streams[key] = result.toProperty({value: null, timestamp: 0});
    result.forEach();
  }
  return result;
}

StreamBundle.prototype.getMetaStreamForSourcePath = function(sourceId, path) {
  let metaStreamForSourcePath = this.metasStream.filter(pathMeta => {
/*
    let result = pathMeta.path === path;
    if (result) {console.log(path, result)}
*/
    return pathMeta.path === path
  }).toProperty();
//  metaStreamForSourcePath.log('meta['+path+']');
  return metaStreamForSourcePath;
}

/*
-2 never received data
-1 no timeout managed
0  timeout state
1  stream alive
*/
StreamBundle.prototype.getAliveStatusStreamForSourcePath = function(sourceId, path, getSyncMetaForVesselPath) {
  return this.checkTimeout.withLatestFrom(this.getValueStreamForSourcePath(sourceId, path),
    (checkTimeout, data) => {
      let meta = getSyncMetaForVesselPath(path);
      let timeout = meta.timeout;
      if (!timeout) {
        return -1;
      }
      let tmpNow = Date.now()
      let result = tmpNow - data.timestamp < timeout*1000
//      if (!result)
//        console.log(result, path, sourceId, (tmpNow - data.timestamp)/1000, timeout)
      return result ? 1 : 0;
    }
  )
  .skipDuplicates()
  .toProperty(-2);
}
