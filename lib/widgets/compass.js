var itemNames = require('app/signalknames')

var d3 = require('d3');


var size = 400;
var half = size / 2;

function Compass(_id, data, streamBundle) {
  var svg = d3.select("#" + _id).append('svg')
    .attr('height', '100%')
    .attr('width', '100%')
    .attr('viewBox', size * 0.25 + ' 0 ' + size * 0.5 + ' ' + size * 0.25)

  this.ticks = svg.append('g')
    .attr('stroke', 'black')
    .attr("transform", centerRotate(30));
  drawTicks(this.ticks);

  this.value = svg.append('text')
    .attr('x', half)
    .attr('y', 70)
    .attr('text-anchor', 'middle')
    .attr('font-size', 38)
    .attr('dominant-baseline', 'middle')
    .text('000');

  this.label = svg.append('text')
    .attr('x', half / 2)
    .attr('y', 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('dominant-baseline', 'middle')
    .text('-');

  if (data.options && data.options.path) {
    streamBundle.getStream(data.options.path).onValue(this.setValue.bind(this));
    this.setLabel(itemNames[data.options.path] || data.options.path);
  }
}

Compass.prototype.getType = function() {
  return "compass";
}

Compass.prototype.getOptions = function() {
  return {};
}

Compass.prototype.setLabel = function(value) {
  this.label.text(value);
}

Compass.prototype.setValue = function(value) {
  this.ticks.attr('transform', centerRotate(-value));
  this.value.text(value);
}

Compass.prototype.pathsCovered = function() {
  return [
    "navigation.courseOverGroundTrue",
    "navigation.courseOverGroundMagnetic",
  ]
}

function centerRotate(deg) {
  return "rotate(" + deg + " " + half + " " + half + ")"
}

function drawTicks(tickmarks) {
  for (var i = 0; i < 360; i += 10) {
    if (i % 90 != 0) {
      tickmarks.append("path").attr("id", "id10-" + i)
        .attr("d", "m " + half + "," + "0 L " + half + "," + (half * 0.1))
        .attr("stroke-width", "1")
        .attr("transform", centerRotate(i));
    }
  }

  for (var i = 5; i < 360; i += 10) {
    if (i % 45 != 0) {
      tickmarks.append("path").attr("id", "id5-" + i)
        .attr("d", "m " + half + "," + "0 L " + half + "," + (half * 0.07))
        .attr("stroke-width", "1")
        .attr("transform", centerRotate(i));
    }
  }
  var dirs = ['N', 'E', 'S', 'W'];
  for (var i = 0; i < 360; i += 90) {
    tickmarks.append("text").attr("id", "bearing" + i)
      .attr("x", half)
      .attr("y", 0.06 * size * 0.8)
      .attr("text-anchor", "middle")
      .attr("style", "font-size:" + (0.07 * size) + "px")
      .attr("transform", centerRotate(i))
      .text(dirs[0]);
    dirs = dirs.splice(1);
  }
  var dirs = ['NE', 'SE', 'SW', 'NW'];
  for (var i = 45; i < 360; i += 90) {
    tickmarks.append("text").attr("id", "bearing" + i)
      .attr("x", half)
      .attr("y", 0.03 * size * 0.8)
      .attr("style", "font-size:" + (0.03 * size) + "px")
      .attr("text-anchor", "middle")
      .attr("transform", centerRotate(i))
      .text(dirs[0]);
    dirs = dirs.splice(1);
  }
  tickmarks.append('path')
    .attr('d', 'M ' + half + ',' + (half * 0.1 + 5) + ' l 10,10 L 210,' + (size - half * 0.1 - 5) + ' l -20,0 L ' + (half - 10) + ',' + (half * 0.1 + 15) + ' Z')
    .attr('style', 'fill:none; stroke:black; stroke-width:1');
}

module.exports = {
  constructor: Compass,
  type: "compass"
}