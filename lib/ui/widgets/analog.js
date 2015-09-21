var React = require('react');
var d3 = require('d3');

var gaugeComponents = require('./gaugecomponents');
var getShadow = gaugeComponents.getShadow;
var getHand = gaugeComponents.getHand;


var size = 400;
var half = size / 2;
var strokeWidth = 25;

var propulsionPrefix = '^propulsion\.[A-Za-z0-9-]*\.';
var pathsCovered = [
  "navigation.speedOverGround",
  propulsionPrefix + "engineTemperature$",
  propulsionPrefix + 'oilTemperature',
  propulsionPrefix + 'oilPressure',
  propulsionPrefix + 'transmissionOilPressure',
  propulsionPrefix + 'rpm'
];

var config = {
  engineTemperature : {
    redLine: 90,
    max: 110
  },
  oilTemperature : {
    redLine: 200,
    max: 250
  },
  oilPressure : {
    redLine: 90,
    max: 110
  },
  transmissionOilPressure : {
    redLine: 240,
    max: 260
  },
  rpm : {
    redLine: 2500,
    max: 3000
  }
}

var componentClass = React.createClass({
  getInitialState: function() {
    var pathParts = this.props.path.split('.');
    var pathConfig = config[pathParts[pathParts.length -1]];
    return {
      value: 0,
      label: this.props.label,
      minValue: 0,
      maxValue: pathConfig ? pathConfig.max : 1,
      redLine: pathConfig ? pathConfig.redLine : 0.9
    };
  },

  renderTicks: function(scale) {
    var yOffset = 0; 
    return scale.ticks().map(function(i) {
      return (
    <g key={"text-" + i} transform={'rotate(' + scale(i) + ' 200 0)'}>
      <text x={-half} y={yOffset + 10} textAnchor="middle" dominant-baseline="central" style={{"fontSize":"28px"}}
        transform={"rotate(" + -scale(i) + ")"}>{i}</text>
    </g>
)
    });
  },

  render: function() {
    var degreesScale = d3.scale.linear()
       .domain([this.state.minValue, this.state.maxValue])
       .range([10, 170]).clamp(true);

    var radianScale = d3.scale.linear()
       .domain([this.state.minValue, this.state.maxValue])
       .range([-80, 80]);

    var arcInset = 30;

    var arc = d3.svg.arc()
          .startAngle(deg2rad(-80))
          .endAngle(deg2rad(80))
          .innerRadius(half  - strokeWidth - arcInset)
          .outerRadius(half - arcInset)
          .cornerRadius(strokeWidth/4);

    var redArc = d3.svg.arc()
          .startAngle(deg2rad(radianScale(this.state.redLine)))
          .endAngle(deg2rad(radianScale(this.state.maxValue)))
          .innerRadius(half  - strokeWidth - arcInset)
          .outerRadius(half - arcInset)
          .cornerRadius(strokeWidth/4);

    var innerArc = d3.svg.arc()
          .startAngle(deg2rad(-80))
          .endAngle(deg2rad(80))
          .outerRadius(half  - strokeWidth - arcInset)
          .innerRadius(half / 20);



    var ticks = degreesScale.ticks([5]).slice(1,5);

    return (
      <svg height="100%" width="100%" viewBox="0 -20 400 240">
        <svg dangerouslySetInnerHTML={getShadow()} />
        <g transform={'translate(' + half + ',' + half + ' )'} stroke="black">
        
          {ticks.map(function(i){
            return (
              <path key={"tick-" + i} 
                    d={"M -180 0 L -176 0"}
                    strokeWidth={2} 
                    transform={'rotate(' + degreesScale(i) + ')'}  
                    stroke="black"/>              
            )
          })}

          <path d={arc()} stroke="black" stroke-width="5" fill="white" />
          
          <path d={redArc()} stroke="black" stroke-width="5" fill="red" />

          
          {getHand(200 - arcInset/2, degreesScale(this.state.value)-90)}

          <path d={innerArc()} stroke="none" stroke-width="5" fill="#efefef" opacity="0.8" />
          
          {this.renderTicks(degreesScale)}

          <text  y="-50" textAnchor="middle" fontSize="70" dominantBaseline="middle">
            <tspan x="0">{BaseWidget.prototype.displayValue(this.state.value)}</tspan>
            <tspan x="0" dy="30" fontSize="30">-</tspan>
            <tspan x="0" dy="30" fontSize="30">{this.props.label}</tspan>
          </text>

        </g>
      </svg>
    )
  },

  componentDidMount: function() {
    if (this.props.value) {
      this.unsubscribe = this.props.value.onValue(function(value) {
        var nextState = {
          value: value
        };
        this.setState(nextState);
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
require('util').inherits(Widget, BaseWidget);

function Widget(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options = options;
  var pathParts = options.path.split('.');
  this.widget = React.createElement(componentClass,{
    key: id,
    value: streamBundle.getStream(options.path),
    label: options.path,
    path: options.path
  });
}

Widget.prototype.getReactElement = function() {
  return this.widget;
}

Widget.prototype.getType = function() {
  return "analog";
}

Widget.prototype.getHandledPaths = function() {
  return [this.options.path];
}

Widget.prototype.getOptions = function() {
  return this.options;
}


function deg2rad(deg) {
  return deg / 180 * Math.PI;
}


module.exports = {
  constructor: Widget,
  type: "analog",
  paths: pathsCovered
}
