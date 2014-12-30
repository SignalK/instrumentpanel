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

  this.value = svg.append('text')
    .attr('x', half)
    .attr('y', half * 0.9)
    .attr('text-anchor', 'middle')
    .attr('font-size', 38)
    .attr('dominan-baseline', 'middle')
    .text('000');

  this.label = svg.append('text')
    .attr('x', half / 2)
    .attr('y', 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('dominan-baseline', 'middle')
    .text('-');

  this.hand = svg.append('path')
    .attr('d', 'M ' + half + ',0 l 10,' + half + 'l -20,0 L ' + half + ',0')
    .attr('style', 'fill:black; stroke:black; stroke-width:1')

}

WindMeter.prototype.setLabel = function(value) {
  this.label.text(value);
}

WindMeter.prototype.setValue = function(value) {
  this.value.text(value);
  this.hand.attr('transform', centerRotate(value));
}
module.exports = WindMeter;