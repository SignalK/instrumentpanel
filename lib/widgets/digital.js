var itemNames = require('app/signalknames')

function Digital(id, data, streamBundle) {
  var svg = d3.select("#" + id).append('svg')
    .attr('height', '100%')
    .attr('width', '100%')
    .attr('viewBox', "0 0 20 40")

  this.value = svg.append('text')
    .attr('x', 10)
    .attr('y', 30)
    .attr('text-anchor', 'middle')
    .attr('font-size', 26)
    .attr('dominan-baseline', 'middle')
    .text('000');

  this.label = svg.append('text')
    .attr('x', 10)
    .attr('y', 4)
    .attr('text-anchor', 'middle')
    .attr('font-size', 5)
    .attr('dominan-baseline', 'middle');

  if (data.options && data.options.path) {
    this.paths = [data.options.path];
    streamBundle.getStream(data.options.path).onValue(this.setValue.bind(this));
    this.setLabel(itemNames[data.options.path] || data.options.path);
  }
}

Digital.prototype.getType = function() {
  return "digital";
}

Digital.prototype.getOptions = function() {
  return {
    path: this.paths[0]
  }
}

Digital.prototype.setValue = function(value) {
  this.value.text(value);
}

Digital.prototype.setLabel = function(label) {
  this.label.text(label);
}

Digital.prototype.pathsCovered = function() {
  return this.paths;
}

module.exports = {
  constructor: Digital,
  type: "digital"
}