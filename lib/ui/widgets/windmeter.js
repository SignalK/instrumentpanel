var React = require('react');

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

var ticks = [];

for (var i = 0; i < 360; i += 30) {
  ticks.push(
    <path id={"id10-" + i} d={"m " + half + "," + "0 L " + half + "," + (arcWidth)} strokeWidth="3" transform={"rotate(" + i + " 200 200)"}></path>      
  )
}
for (var i = 10; i < 360; i += 10) {
  ticks.push(
    <path id={"id5" + i} d={"m " + half + "," + "0 L " + half + "," + (half * 0.07)} strokeWidth="1" transform={"rotate(" + i + " 200 200)"}></path>
  )
}
var yOffset = 0.85;
for (var i = 0; i < 190; i += 30) {
  ticks.push(
    <g transform={centerRotate(i + 180)}>
      <text id={"bearing" + i} x="200" y="340" textAnchor="middle" dominant-baseline="central" style={{"fontSize":"28px"}} 
        transform={"rotate(" + (-i - 180) + " " + half + " " + size * yOffset + ")"}>{i}</text>
    </g>
  );
  ticks.push(
    <g transform={centerRotate(-i + 180)}>
      <text id={"bearing-" + i} x="200" y="340" textAnchor="middle" dominant-baseline="central" style={{"fontSize":"28px"}}
       transform={"rotate(" + (i - 180) + " " + half + " " + size * yOffset + ")"}>{i}</text>
    </g>
  )
}


var componentClass = React.createClass({
  getInitialState: function() {
    return {
      angle: 122,
      speed: 3.5,
      label: this.props.label
    };
  },
  render: function() {
    return (
      <svg height="100%" width="100%" viewBox="0  0 400 400">
        <path d="M 200,15 a185,185 0 0,1 160.21469970012114,92.50000000000001" style={{"fill":"none", "stroke":"green", "strokeWidth":"30"}}></path>
        <path d="M 200,15 a185,185 0 0,0 -160.21469970012114,92.50000000000001" style={{"fill":"none", "stroke":"red", "strokeWidth":"30"}}></path>
        <g stroke="black">
          {ticks}
          <path d="M 200,30 l 10,200l -20,0 L 200,30" 
            style={{"fill":"black", "stroke":"black", "strokeWidth":"1"}} 
            transform={centerRotate(this.state.angle)}></path>
          <g stroke="black">
            <rect width="100" height="50" x="150" y="135" rx="5" ry="5" style={{"fill":"white", "opacity":"0.8"}}></rect>
            <text x="200" y="172" textAnchor="middle" fontSize="38" dominantBaseline="middle">{this.state.angle}</text>
          </g>
          <g>
            <rect width="200" height="50" x="100" y="215" rx="5" ry="5" style={{"fill":"white", "opacity":"0.8"}}></rect>
            <text x="200" y="252" textAnchor="middle" fontSize="38" dominantBaseline="middle">{this.state.speed}</text>
          </g>
          <text x="100" y="10" textAnchor="middle" fontSize="12" dominantBaseline="middle">-</text>
        </g>
      </svg>    
    )
  },
  componentDidMount: function() {
    if (this.props.streams) {
      this.unsubscribe = [];
      this.unsubscribe.push(this.props.streams[0].onValue(function(value) {
          this.setState({
            angle: value,
            speed: this.state.speed,
            label: this.state.label
          });
        }.bind(this))
      );
      this.unsubscribe.push(this.props.streams[2].onValue(function(value) {
          this.setState({
            angle: this.state.angle,
            speed: value,
            label: this.state.label
          });
        }.bind(this))
      );
    }
  },
  componentWillUnmount: function() {
    if(this.unsubscribe) {
      this.unsubscribe.forEach(function(unsub){unsub()});
    }
  }   
});

var BaseWidget = require('./basewidget');
require('util').inherits(WindMeter, BaseWidget);

function WindMeter(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options = options;
  this.active = true;
  this.widget = React.createElement(componentClass,{
    key: id,
    streams: pathsCovered.map(function(path){ return streamBundle.getStream(path)}),
    label: options.path
  })
}


WindMeter.prototype.getReactElement = function() {
  return this.widget;
}

WindMeter.prototype.getType = function() {
  return "windmeter";
}

WindMeter.prototype.getHandledPaths = function() {
  return pathsCovered;
}

WindMeter.prototype.getOptions = function() {
  return this.options;
}


function centerRotate(deg) {
  return "rotate(" + deg + " " + half + " " + half + ")"
}






module.exports = {
  constructor: WindMeter,
  type: 'windmeter',
  paths: pathsCovered
}