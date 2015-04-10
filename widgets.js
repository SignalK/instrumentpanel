widgets = {
  Compass: require('./lib/widgets/compass'),
  Digital: require('./lib/widgets/digital'),
  WindMeter: require('./lib/widgets/windmeter'),
  LeafletMap: require('./lib/widgets/leafletmap')
}

L = require('leaflet');
Bacon = require('baconjs');

EventEmitter = require('node-event-emitter')