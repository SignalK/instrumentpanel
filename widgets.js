widgets = {
  Compass: require('./widgets/compass'),
  Compass3D: require('./widgets/compass3d'),
  Digital: require('./widgets/digital'),
  WindMeter: require('./widgets/windmeter'),
  LeafletMap: require('./widgets/leafletmap')
};

L = require('leaflet');

EventEmitter = require('node-event-emitter')