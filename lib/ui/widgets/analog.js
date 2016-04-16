var React = require('react');
var d3 = require('d3');
var Bacon = require('baconjs');

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
  propulsionPrefix + 'rpm',
  propulsionPrefix + 'alternatorVoltage'
];

var stateColors = {
  "normal": "white",
  "alert": "green",
  "warn": "yellow",
  "alarm": "red",
  "emergency": "purple"
}

var componentClass = React.createClass({
  getInitialState: function() {
    var pathParts = this.props.path.split('.');
    return {
      value: 0,
      label: this.props.label,
      minValue: this.props.options.minValue  || 0,
      maxValue: this.props.options.maxValue  || 100,
      zones: this.props.options.zones || []
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


    var arcForZone = function(min, max, zone) {
      var zoneArc = d3.svg.arc()
        .startAngle(deg2rad(radianScale(zone.lower ? zone.lower : min)))
        .endAngle(deg2rad(radianScale(zone.upper ? zone.upper : max)))
        .innerRadius(half - strokeWidth - arcInset)
        .outerRadius(half - arcInset)
        .cornerRadius(strokeWidth / 4);
      var fill = "white";
      if (zone.state) {
        fill = stateColors[zone.state];
        if (!fill) {
          fill = "white";
        }
      }

      return (
        <path d={zoneArc()} stroke="black" stroke-width="5" fill={fill} />
      )
    }

    var renderZones = function(zones, min, max) {
      if (zones) {
        return zones.map(arcForZone.bind(this, min, max));
      }
    }

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

          <path d={arc()} stroke="black" strokeWidth="5" fill="white" />

          {renderZones(this.state.zones, this.state.minValue, this.state.maxValue)}

          {getHand(200 - arcInset/2, degreesScale(this.state.value)-90)}

          <path d={innerArc()} stroke="none" strokeWidth="5" fill="#efefef" opacity="0.8" />

          {this.renderTicks(degreesScale)}

          <text  y="-50" textAnchor="middle" fontSize="70" dominantBaseline="middle">
            <tspan x="0">{BaseWidget.prototype.displayValue(this.state.value)}</tspan>
            <tspan x="0" dy="30" fontSize="30">-</tspan>
            <tspan x="0" dy="30" fontSize="30">{this.props.label + " " + this.props.sourceId}</tspan>
          </text>

        </g>
      </svg>
    )
  },

  componentDidMount: function() {
    this.unsubscribes = [];
    if (this.props.value) {
      this.unsubscribes.push(this.props.value.onValue(function(value) {
        var nextState = {
          value: value
        };
        this.setState(nextState);
      }.bind(this)));
    }
    this.unsubscribes.push(this.props.optionsStream.onValue(function(options){
      this.setState(options)
    }.bind(this)));
  },

  componentWillUnmount: function() {
    this.unsubscribes.forEach(function(unsub) {
      unsub();
    })
  }
});



var BaseWidget = require('./basewidget');
require('util').inherits(Widget, BaseWidget);

function Widget(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options = options;
  this.optionsStream = new Bacon.Bus();
  var pathParts = options.path.split('.');
  this.widget = React.createElement(componentClass,{
    key: id,
    value: streamBundle.getStreamForSourcePath(options.sourceId, options.path),
    optionsStream: this.optionsStream,
    label: options.path,
    path: options.path,
    options: options,
    sourceId: options.sourceId
  });
}

Widget.prototype.getReactElement = function() {
  return this.widget;
}

Widget.prototype.getType = function() {
  return "analog";
}

Widget.prototype.getOptions = function() {
  return this.options;
}

Widget.prototype.setMeta = function(meta) {
  if (meta.zones) {
    this.options.minValue = meta.zones[0].upper;
    this.options.maxValue = meta.zones[meta.zones.length - 1].lower;
    this.options.zones = meta.zones;
    this.optionsStream.push(this.options);
  }
}




function deg2rad(deg) {
  return deg / 180 * Math.PI;
}


module.exports = {
  constructor: Widget,
  type: "analog",
  paths: pathsCovered
}
