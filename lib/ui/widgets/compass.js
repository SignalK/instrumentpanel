var React = require('react');

var size = 400;
var half = size / 2;

var pathsCovered = [
  "navigation.courseOverGroundTrue",
  "navigation.courseOverGroundMagnetic",
]


var componentClass = React.createClass({
  getInitialState: function() {
    return {
      value: 10,
      label: this.props.label
    };
  },
  render: function() {
    return (
        <svg height="100%" width="100%" viewBox="100 0 200 100">
          <g stroke="black" transform={centerRotate(-this.state.value)}>
            {tenTicks}
            {fiveTicks}
            {mainDirs}
            {minorDirs}
            <path d="M 200,25 l 10,10 L 210,375 l -20,0 L 190,35 Z" style={{fill:'none',stroke:'black', strokeWidth:1}}></path>
          </g>
          <text x="200" y="70" textAnchor="middle" fontSize="38" dominant-baseline="middle">{this.state.value}</text>
          <text x="100" y="10" textAnchor="middle" fontSize="12" dominant-baseline="middle">{this.state.label}</text>
        </svg>
    )
  },
  componentDidMount: function() {
    if (this.props.value) {
      this.unsubscribe = this.props.value.onValue(function(value) {
        this.setState({
          value: value,
          label: this.state.label
        });
      }.bind(this));
    }
  },
  componentWillUnmount: function() {
    if(this.unsubscribe) {
      this.unsubscribe();
    }
  }   
});

var BaseWidget = require('./basewidget');
require('util').inherits(Compass, BaseWidget);

function Compass(id, options, streamBundle) {
  BaseWidget.call(this, id, options, streamBundle);
  this.options = options;
  this.widget = React.createElement(componentClass,{
    key: id,
    value: streamBundle.getStream(options.path),
    label: options.path
  })
}



Compass.prototype.getReactElement = function() {
  return this.widget;
}

Compass.prototype.setActive = function(value) {
  this.active = value;
  this.instrumentPanel.onWidgetChange(this);
}

Compass.prototype.getType = function() {
  return "compass";
}

Compass.prototype.getHandledPaths = function() {
  return [this.options.path];
}

Compass.prototype.getOptions = function() {
  return this.options;
}


function centerRotate(deg) {
  return "rotate(" + deg + " " + half + " " + half + ")"
}

function create10Ticks() {
  var result = []
    for (var i = 0; i < 360; i += 10) {
    if (i % 90 != 0) {
      result.push(
        <path id={"id10-" + i} d={"m " + half + "," + "0 L " + half + "," + (half * 0.1)} strokeWidth="1" transform={centerRotate(i)}/>
      )
    }
  }
  return result;
}

function create5Ticks() {
  var result = []
  for (var i = 5; i < 360; i += 10) {
    if (i % 45 != 0) {
      result.push(
        <path id={"id5-" + i} d={"m " + half + "," + "0 L " + half + "," + (half * 0.07)} stokeWidth="1"  transform={centerRotate(i)}/>
      )
    }
  }
  return result;
}

function toMainDirText(dir, i) {
  return (
    <text id={'bearing' + i*90} 
       x={half} 
       y={0.06 * size * 0.8} 
       textAnchor="middle" 
       fontSize={(0.07 * size) + "px"} 
       transform={centerRotate(i*90)}>{dir}</text>
  )
}

function toMinorDirText(dir, i) {
  return (
    <text id={'bearing' + i*90+45} 
       x={half} 
       y={0.03 * size * 0.8} 
       textAnchor="middle" 
       fontSize={(0.03 * size) + "px"} 
       transform={centerRotate(i*90+45)}>{dir}</text>
  )
}

var tenTicks = create10Ticks();
var fiveTicks = create5Ticks();
var mainDirs = ['N', 'E', 'S', 'W'].map(toMainDirText);
var minorDirs = ['NE', 'SE', 'SW', 'NW'].map(toMinorDirText);
var mainDirs = ['N', 'E', 'S', 'W'].map(toMainDirText);
var minorDirs = ['NE', 'SE', 'SW', 'NW'].map(toMinorDirText);





module.exports = {
  constructor: Compass,
  type: "compass",
  paths: pathsCovered
}