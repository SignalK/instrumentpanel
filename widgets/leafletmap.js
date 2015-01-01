function LeafletMap(selector, context) {
  d3.select(selector).append('div')
   .attr('id', 'map')
   .attr('style','height:200px');
  this.map = new L.Map("map", {
    center: [37.8, -96.9],
    zoom: 4,
    zoomControl: false,
    attributionControl: false
  });
  this.map.setView([60.1, 24.8], 10);  

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(this.map);
/* L.tileLayer.wms("http://kartta.liikennevirasto.fi/meriliikenne//dgds/wms_ip/merikartta", {
      layers: 'cells',
      styles: 'style-id-203',
      format: 'image/png',
      transparent: true
    }).addTo(this.map); */

  var map = this.map;
  context.on('lock', function() {
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
  });
  context.on('unlock', function() {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
  });
}


LeafletMap.prototype.setValue = function(value) {
  this.map.panTo(new L.LatLng(value.latitude, value.longitude));
}

LeafletMap.prototype.setLabel = function(label) {}

LeafletMap.prototype.resize = function(width, height) {
  this.map.invalidateSize();
}


module.exports = LeafletMap;