var React = require('react');

var size = 400;
var half = size / 2;
var arcWidth = half * 0.15;
var largeTick = half * 0.15;
var smallTick = half * 0.075;

var pathsCovered = [
  'environment.wind.angleApparent',
  'environment.wind.angleTrue',
  'environment.wind.speedApparent',
  'environment.wind.speedTrue'
]

var ticks = [];

for (var i = 0; i < 180; i += 10) {
  var stroke = 1;
  var dash = smallTick;

  if(i % 30 === 0) {
    stroke = 3;
    dash = largeTick;
  }

  ticks.push(
    <path key={"tick-" + i} d={"M 200 0 L 200 " + dash + " M 200 " + (400-dash) + " L 200 400"}
      strokeWidth={stroke} transform={centerRotate(i)} />
  );
}

var yOffset = 0.85 * size;
for (var i = 0; i < 190; i += 30) {
  ticks.push(
    <g key={"text-" + i} transform={centerRotate(180 + i)}>
      <text x="200" y={yOffset + 10} textAnchor="middle" dominant-baseline="central" style={{"fontSize":"28px"}}
        transform={"rotate(" + (-i - 180) + " " + half + " " + yOffset + ")"}>{i}</text>
    </g>
  );
  ticks.push(
    <g key={"text--" + i} transform={centerRotate(180 - i)}>
      <text x="200" y={yOffset + 10} textAnchor="middle" dominant-baseline="central" style={{"fontSize":"28px"}}
       transform={"rotate(" + (i - 180) + " " + half + " " + yOffset + ")"}>{i}</text>
    </g>
  )
}

var componentClass = React.createClass({
  getInitialState: function() {
    return {
      angle: 0,
      speed: 0,
      label: this.props.label
    };
  },

  getShadow: function() {
    return ({ __html:
      '<filter id="f1">' +
      '<feGaussianBlur in="SourceAlpha" stdDeviation="2" />' +
      '<feOffset dx="2.4" dy="1.6" />' +
      '<feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>' +
      '</filter>'
    });
  },

  render: function() {
    var sx = half;
    var sy = arcWidth / 2;
    var ar = half - sy;
    var ex = ar * Math.sin(Math.PI / 3); // 60°
    var ey = ar * Math.cos(Math.PI / 3); // 60°

    return (
      <svg height="100%" width="100%" viewBox="0 0 400 400">
        <svg dangerouslySetInnerHTML={this.getShadow()} />
        <g stroke="black" transform="scale(0.9) translate(20 40)">
          <path d={["M", sx, sy, "a", ar, ar, "0 0 1", ex, ey].join(" ")}
            style={{"fill":"none", "stroke":"green", "strokeWidth":arcWidth}} />
          <path d={["M", sx, sy, "a", ar, ar, "0 0 0", -ex, ey].join(" ")}
            style={{"fill":"none", "stroke":"red", "strokeWidth":arcWidth}} />
          {ticks}
          <rect width="150" height="50" x="125" y="135" rx="5" ry="5" fill="rgba(255,255,255,0.8)" />
          <text x="200" y="172" textAnchor="middle" fontSize="38" dominantBaseline="middle">
            {getDisplayWindAngle(this.state.angle)}
          </text>
          <rect width="150" height="50" x="125" y="215" rx="5" ry="5" fill="rgba(255,255,255,0.8)" />
          <text x="200" y="252" textAnchor="middle" fontSize="38" dominantBaseline="middle">
            {safeFixed(this.state.speed)}
          </text>
          <polygon points="200,20 190,200 200,215 210,200"
            fill="rgba(221, 221, 221, 0.6)" stroke="#333" strokeWidth="1"
            transform={centerRotate(this.state.angle)} style={{"filter":"url(#f1)"}} />
        </g>
        <text x="200" y="24" textAnchor="middle" fontSize="20">{this.state.label}</text>
      </svg>
    )
  },
  componentDidMount: function() {
    if (this.props.streams) {
      this.unsubscribe = [];
      this.unsubscribe.push(this.props.streams[0].onValue(function(value) {
          this.setState({
            angle: value.toFixed(0)
          });
        }.bind(this))
      );
      this.unsubscribe.push(this.props.streams[2].onValue(function(value) {
          this.setState({
            speed: value.toFixed(2)
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
    streams: pathsCovered.map(function(path){ return streamBundle.getStream(path); }),
    label: this.getLabelForPath(options.path)
  });
}

function getDisplayWindAngle(value) {
  return value >= 0 && value <= 180 ? value:
         value > 180 ? Math.abs(value - 360) :
         Math.abs(value);
}

function safeFixed(value) {
  try {
    return Number(value).toFixed(2);
  } catch (e) {
    console.error("Could not round:" + value);
  }
  return "-";
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
  return ["rotate(", deg, half, half, ")"].join(" ");
}

module.exports = {
  constructor: WindMeter,
  type: 'windmeter',
  paths: pathsCovered
}
