var d3 = require('d3');


var size = 400;
var half = size / 2;

function centerRotate(deg) {
  return "rotate(" + deg + " " + half + " " + half + ")"
}

function drawTicks(tickmarks) {
  for (var i = 0; i < 360; i += 30) {
    tickmarks.append("path").attr("id", "id10-" + i)
      .attr("d", "m " + half + "," + "0 L " + half + "," + (half * 0.15))
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

function WindMeter(selector) {
  var svg = d3.select(selector).append('svg')
    .attr('height', '100%')
    .attr('width', '100%')
    .attr('viewBox', '0  0 ' + size + ' ' + size);


  var arcParam = half - half * 0.15 / 2;
  svg.append('path')
    .attr('d', 'M ' + half + ',' + (half * 0.15) / 2 + ' a' + arcParam + ',' + arcParam + ' 0 0,1 ' + arcParam * Math.sin(Math.PI / 3) + ',' + arcParam * Math.cos(Math.PI / 3))
    .attr('style', 'fill:none; stroke:green; stroke-width:' + half * 0.15);
  svg.append('path')
    .attr('d', 'M ' + half + ',' + (half * 0.15) / 2 + ' a' + arcParam + ',' + arcParam + ' 0 0,0 ' + -arcParam * Math.sin(Math.PI / 3) + ',' + arcParam * Math.cos(Math.PI / 3))
    .attr('style', 'fill:none; stroke:red; stroke-width:' + half * 0.15);

  this.ticks = svg.append('g')
    .attr('stroke', 'black')
  drawTicks(this.ticks);

  var hand = svg.append('path')
    .attr('d', 'M ' + half + ',0 l 10,' + half + 'l -20,0 L ' + half + ',0')
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

  context.getStream('environment_wind_angleApparent').onValue(function(pathValue) {
    angleText.text(pathValue.value + '\u00b0');
    hand.attr('transform', centerRotate(pathValue.value));
  });    

  var speedBox = svg.append('g');
  speedBox.append('rect')
    .attr('width', boxWidth*2)
    .attr('height', boxHeight)
    .attr('x', half - (boxWidth ))
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

  context.getStream('environment_wind_speedApparent').onValue(function(pathValue) {
    var text = speedText.text(pathValue.value + " ");
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

WindMeter.prototype.setLabel = function(value) {
  this.label.text(value);
}

WindMeter.prototype.setValue = function(value) {}
module.exports = WindMeter;