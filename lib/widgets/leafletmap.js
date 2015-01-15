var pathsCovered = ['navigation.position'];

function LeafletMap(_id, data, streamBundle, instrumentPanel) {
  d3.select("#" + _id).append('div')
    .attr('id', 'map')
    .attr('style', 'height:200px');
  this.map = new L.Map("map", {
    center: [37.8, -96.9],
    zoom: 4,
    zoomControl: false,
    attributionControl: false
  });
  this.map.setView([60.1, 24.8], 10);
  var map = this.map;


  var finNautic = L.tileLayer.wms("http://kartta.liikennevirasto.fi/meriliikenne//dgds/wms_ip/merikartta", {
    layers: 'cells',
    styles: 'style-id-203',
    format: 'image/png',
    transparent: true
  });
  var baseMaps = {
    "Fin Nautic": finNautic,
    "OpenStreepMap": L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')
  };
  finNautic.addTo(map);

  var OpenWeatherMap_Clouds = L.tileLayer('http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    opacity: 0.5
  });
  var OpenWeatherMap_Precipitation = L.tileLayer('http://{s}.tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    opacity: 0.5
  });
  var OpenWeatherMap_Rain = L.tileLayer('http://{s}.tile.openweathermap.org/map/rain/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    opacity: 0.5
  });
  var OpenWeatherMap_Pressure = L.tileLayer('http://{s}.tile.openweathermap.org/map/pressure/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    opacity: 0.5
  });
  var OpenWeatherMap_PressureContour = L.tileLayer('http://{s}.tile.openweathermap.org/map/pressure_cntr/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    opacity: 0.5
  });
  var OpenWeatherMap_Wind = L.tileLayer('http://{s}.tile.openweathermap.org/map/wind/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    opacity: 0.5
  });
  var OpenWeatherMap_Temperature = L.tileLayer('http://{s}.tile.openweathermap.org/map/temp/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    opacity: 0.5
  });

  var overlayMaps = {
    "Clouds": OpenWeatherMap_Clouds,
    "Precipitation": OpenWeatherMap_Precipitation,
    "Rain": OpenWeatherMap_Rain,
    "Pressure": OpenWeatherMap_Pressure,
    "Pressure Countours": OpenWeatherMap_PressureContour,
    "Wind": OpenWeatherMap_Wind,
    "Temperature": OpenWeatherMap_Temperature
  };

  L.control.layers(baseMaps, overlayMaps).addTo(map);


  instrumentPanel.on('unlock', function() {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
  });
  instrumentPanel.on('lock', function() {
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
  });

  streamBundle.getStream('navigation.position').onValue(this.setValue.bind(this));
}

LeafletMap.prototype.getType = function() {
  return "leafletmap";
}

LeafletMap.prototype.getOptions = function() {
  return {}
}


LeafletMap.prototype.setValue = function(value) {
  this.map.panTo(new L.LatLng(value.latitude, value.longitude));
}

LeafletMap.prototype.setLabel = function(label) {}

LeafletMap.prototype.resize = function(width, height) {
  this.map.invalidateSize();
}

LeafletMap.prototype.pathsCovered = function(width, height) {
  return pathsCovered;
}


module.exports = {
  constructor: LeafletMap,
  type: "leafletmap",
  paths: pathsCovered
}