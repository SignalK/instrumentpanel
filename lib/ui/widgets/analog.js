var React = require('react');
var d3 = require('d3');
var Bacon = require('baconjs');

var SettingsPanel = (props) => {
  return (
    <fieldset>
    <table>
    <tbody>
    <tr>
    <td>
    <label htmlFor="min" style={{marginLeft: 10}}>Minimum</label>
    </td>
    <td>
    <input id="min" size="4" onChange={props.onMinChange}/>
    </td>
    </tr>
    <tr>
    <td>
    <label htmlFor="red" style={{marginLeft: 10}}>Redline</label>
    </td>
    <td>
    <input id="red" size="4" onChange={props.onRedChange}/>
    </td>
    </tr>
    <tr>
    <td>
    <label htmlFor="max" style={{marginLeft: 10}}>Maximum</label>
    </td>
    <td>
    <input id="max" size="4" onChange={props.onMaxChange}/>
    </td>
    </tr>
    </tbody>
    </table>
    </fieldset>
  )
}

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
      minValue: this.props.minValue || 0,
      maxValue: this.props.maxValue || 2,
      redLine: this.props.redLine || 1.5
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

          <path d={arc()} stroke="black" strokeWidth="5" fill="white" />

          <path d={redArc()} stroke="black" strokeWidth="5" fill="red" />


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
    this.unsubscribes.push(this.props.maxValueStream.onValue(function(value) {
      this.setState({
        maxValue: value
      });
    }.bind(this)));
    this.unsubscribes.push(this.props.minValueStream.onValue(function(value) {
      this.setState({
        minValue: value
      });
    }.bind(this)));
    this.unsubscribes.push(this.props.redLineStream.onValue(function(value) {
      this.setState({
        redLine: value
      });
    }.bind(this)));
  },


  componentWillUnmount: function() {
    this.unsubscribes.forEach(function(unsubscribe) {
      unsubscribe()
    });
  }
});

var BaseWidget = require('./basewidget');
require('util').inherits(Widget, BaseWidget);

function Widget(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options = options;
  this.maxValueStream = new Bacon.Bus();
  this.minValueStream = new Bacon.Bus();
  this.redLineStream = new Bacon.Bus();
  var pathParts = options.path.split('.');
  this.widget = React.createElement(componentClass,{
    key: id,
    value: streamBundle.getStreamForSourcePath(options.sourceId, options.path),
    label: options.path,
    path: options.path,
    sourceId: options.sourceId,
    maxValue: options.maxValue,
    maxValueStream: this.maxValueStream.toProperty(),
    minValue: options.minValue,
    minValueStream: this.minValueStream.toProperty(),
    redLine: options.redLine,
    redLineStream: this.redLineStream.toProperty()
  });
  this.maxValueStream.push(options.maxValue || 2);
  this.minValueStream.push(options.minValue || 0);
  this.redLineStream.push(options.redLine || 2);
}

Widget.prototype.getReactElement = function() {
  return this.widget;
}

Widget.prototype.getSettingsElement = function() {
  var that = this;
  return SettingsPanel({
    options: this.options,
    onMaxChange: function(event) {
      that.options.maxValue = Number(event.target.value);
      that.maxValueStream.push(Number(event.target.value));
      that.instrumentPanel.persist();
    },
    onMinChange: function(event) {
      that.options.minValue = Number(event.target.value);
      that.minValueStream.push(Number(event.target.value));
      that.instrumentPanel.persist();
    },
    onRedChange: function(event) {
      that.options.redLine = Number(event.target.value);
      that.redLineStream.push(Number(event.target.value));
      that.instrumentPanel.persist();
    }
  });
}

Widget.prototype.getType = function() {
  return "analog";
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
