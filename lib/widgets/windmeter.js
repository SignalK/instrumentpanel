var d3 = require('d3');


var size = 400;
var half = size / 2;
var arcWidthFraction = 0.15;
var arcWidth = half * arcWidthFraction;
var arcParam = half - arcWidth / 2;

var pathsCovered = [
  'environment.wind.angleApparent',
  'environment.wind.angleTrue',
  'environment.wind.speedApparent',
  'environment.wind.speedTrue'
]


function WindMeter(id, data, streamBundle) {
  var svg = d3.select("#" + id).append('svg')
    .attr('height', '100%')
    .attr('width', '100%')
    .attr('viewBox', '0  0 ' + size + ' ' + size);

  svg.append('path')
    .attr('d', 'M ' + half + ',' + (arcWidth) / 2 + ' a' + arcParam + ',' + arcParam + ' 0 0,1 ' + arcParam * Math.sin(Math.PI / 3) + ',' + arcParam * Math.cos(Math.PI / 3))
    .attr('style', 'fill:none; stroke:green; stroke-width:' + arcWidth);
  svg.append('path')
    .attr('d', 'M ' + half + ',' + (arcWidth) / 2 + ' a' + arcParam + ',' + arcParam + ' 0 0,0 ' + -arcParam * Math.sin(Math.PI / 3) + ',' + arcParam * Math.cos(Math.PI / 3))
    .attr('style', 'fill:none; stroke:red; stroke-width:' + arcWidth);

  this.ticks = svg.append('g')
    .attr('stroke', 'black')
  drawTicks(this.ticks);

  var hand = svg.append('path')
    .attr('d', 'M ' + half + ',' + arcWidth + ' l 10,' + half + 'l -20,0 L ' + half + ',' + arcWidth)
    .attr('style', 'fill:black; stroke:black; stroke-width:1')


  var boxWidth = 100;
  var boxHeight = 50;
  var angleBox = svg.append('g');
  angleBox.append('rect')
    .attr('width', boxWidth)
    .attr('height', boxHeight)
    .attr('x', half - (boxWidth / 2))
    .attr('y', half * 0.8 - (boxHeight / 2))
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('style', 'fill:white; opacity:0.8');

  var angleText = angleBox.append('text')
    .attr('x', half)
    .attr('y', half * 0.8)
    .attr('text-anchor', 'middle')
    .attr('font-size', 38)
    .attr('dominant-baseline', 'middle')
    .text('000');

  streamBundle.getStream('environment.wind.angleApparent').onValue(function(value) {
    angleText.text(normalizeAngle(Number(value)) + '\u00b0');
    hand.attr('transform', centerRotate(value));
  });

  var speedBox = svg.append('g');
  speedBox.append('rect')
    .attr('width', boxWidth * 2)
    .attr('height', boxHeight)
    .attr('x', half - (boxWidth))
    .attr('y', half * 1.2 - (boxHeight / 2))
    .attr('rx', 5)
    .attr('ry', 5)
    .attr('style', 'fill:white; opacity:0.8');

  var speedText = speedBox.append('text')
    .attr('x', half)
    .attr('y', half * 1.2)
    .attr('text-anchor', 'middle')
    .attr('font-size', 38)
    .attr('dominant-baseline', 'middle')
    .text('000');

  streamBundle.getStream('environment.wind.speedApparent').onValue(function(value) {
    var text = speedText.text(value + " ");
    text.append('tspan')
      .attr('baseline-shift', 'super')
      .attr('font-size', '15')
      .text('m');
    text.append('tspan')
      .attr('dominant-baseline', 'middle')
      .text('/');
    text.append('tspan')
      .attr('baseline-shift', 'sub')
      .attr('font-size', '15')
      .text('s');
  });

  this.label = svg.append('text')
    .attr('x', half / 2)
    .attr('y', 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('dominant-baseline', 'middle')
    .text('-');
}

function normalizeAngle(value) {
  return Math.abs(value <= 180 ? value : value - 360);
}

WindMeter.prototype.getType = function() {
  return "windmeter";
}

WindMeter.prototype.getOptions = function() {
  return {}
}

WindMeter.prototype.setLabel = function(value) {
  this.label.text(value);
}

WindMeter.prototype.setValue = function(value) {}

WindMeter.prototype.pathsCovered = function(value) {
  return pathsCovered;
}

function centerRotate(deg) {
  return "rotate(" + deg + " " + half + " " + half + ")"
}

function drawTicks(tickmarks) {
  for (var i = 0; i < 360; i += 30) {
    tickmarks.append("path").attr("id", "id10-" + i)
      .attr("d", "m " + half + "," + "0 L " + half + "," + (arcWidth))
      .attr("stroke-width", "3")
      .attr("transform", centerRotate(i));
  }
  for (var i = 10; i < 360; i += 10) {
    tickmarks.append("path").attr("id", "id5-" + i)
      .attr("d", "m " + half + "," + "0 L " + half + "," + (half * 0.07))
      .attr("stroke-width", "1")
      .attr("transform", centerRotate(i));
  }
  var yOffset = 0.85;
  for (var i = 0; i < 190; i += 30) {
    var g = tickmarks.append("g");
    g.attr("transform", centerRotate(i + 180));
    g.append("text").attr("id", "bearing" + i)
      .attr("x", half)
      .attr("y", size * yOffset)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("style", "font-size:" + (0.07 * size) + "px")
      .attr("transform", "rotate(" + (-i - 180) + " " + half + " " + size * yOffset + ")")
      .text(i)

    var g = tickmarks.append("g");
    g.attr("transform", centerRotate(-i + 180));
    g.append("text").attr("id", "bearing" + i)
      .attr("x", half)
      .attr("y", size * yOffset)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("style", "font-size:" + (0.07 * size) + "px")
      .attr("transform", "rotate(" + (i + 180) + " " + half + " " + size * yOffset + ")")
      .text(i)
  }
}

module.exports = {
  constructor: WindMeter,
  type: 'windmeter',
  paths: pathsCovered
}