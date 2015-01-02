widgets = {
  Compass: require('./widgets/compass'),
  Digital: require('./widgets/digital'),
  WindMeter: require('./widgets/windmeter'),
  LeafletMap: require('./widgets/leafletmap')
}

L = require('leaflet');
Bacon = require('baconjs');

EventEmitter = require('node-event-emitter')