import React from 'react';
import { render } from 'react-dom';
import util from 'util';

import {
  getConversionsForUnit,
  unitChoice
} from '../settings/conversions';
import BaseWidget from './basewidget';

var size = 400;
var half = size / 2;
var arcWidth = half * 0.15;
var largeTick = half * 0.15;
var smallTick = half * 0.075;

var pathsCovered = [
  'environment.wind.angleApparent',
  'environment.wind.angleTrueGround',
  'environment.wind.angleTrueWater',
  'environment.wind.speedApparent',
  'environment.wind.speedOverGround',
  'environment.wind.speedTrue'
]

const displayApparent = 0;
const displayTrueGround = 1;
const displayTrueWater = 2;

var getValuesForDisplayModeIndex = [
  function(values) { //displayApparent
    return {
      angle: values.angleApparent,
      speed: values.speedApparent,
      label: 'Apparent Wind'
    }
  },
  function(values) { //displayTrueGround
    return {
      angle: values.angleTrueGround,
      speed: values.speedOverGround,
      label: 'True Wind over Ground'
    }
  },
  function(values) { //displayTrueWater
    return {
      angle: values.angleTrueWater,
      speed: values.speedTrue,
      label: 'True Wind through Water'
    }
  }
]

function getNextDisplayModeIndex(displayModeIndex) {
  displayModeIndex += 1;
  const nextDisplayModeIndex = (displayModeIndex >= getValuesForDisplayModeIndex.length)? 0 : displayModeIndex;
  return nextDisplayModeIndex;
}

var subscribes = {
  'environment.wind.angleApparent': function(sourceId, stream) {
    if (!this.widget.props.activeStreams['environment.wind.angleApparent']) {
      var that = this;
      let theStream = stream
      const conversion = getConversionsForUnit('rad')['deg']
      if (conversion) {
        theStream = stream.map(conversion)
      }
      this.widget.props.activeStreams['environment.wind.angleApparent'] = theStream.onValue(function(value) {
        that.widget.props.values.angleApparent = value;
        if (that.options.displayModeIndex === displayApparent) {
          that.widget.props.holder.setState({ newValue: true});
        }
      })
    }
  },
  'environment.wind.angleTrueGround': function(sourceId, stream) {
    if (!this.widget.props.activeStreams['environment.wind.angleTrueGround']) {
      var that = this;
      let theStream = stream
      const conversion = getConversionsForUnit('rad')['deg']
      if (conversion) {
        theStream = stream.map(conversion)
      }
      this.widget.props.activeStreams['environment.wind.angleTrueGround'] = theStream.onValue(function(value) {
        that.widget.props.values.angleTrueGround = value;
        if (that.options.displayModeIndex === displayTrueGround) {
          that.widget.props.holder.setState({ newValue: true});
        }
      })
    }
  },
  'environment.wind.angleTrueWater': function(sourceId, stream) {
    if (!this.widget.props.activeStreams['environment.wind.angleTrueWater']) {
      var that = this;
      let theStream = stream
      const conversion = getConversionsForUnit('rad')['deg']
      if (conversion) {
        theStream = stream.map(conversion)
      }
      this.widget.props.activeStreams['environment.wind.angleTrueWater'] = theStream.onValue(function(value) {
        that.widget.props.values.angleTrueWater = value;
        if (that.options.displayModeIndex === displayTrueWater) {
          that.widget.props.holder.setState({ newValue: true});
        }
      })
    }
  },
  'environment.wind.speedApparent': function(sourceId, stream) {
    var that = this;
    if (!this.widget.props.activeStreams['environment.wind.speedApparent']) {
      let theStream = stream
      if (this.options.convertTo) {
        const conversion = getConversionsForUnit('m/s')[this.options.convertTo]
        if (conversion) {
          theStream = stream.map(conversion)
        }
      }
      this.widget.props.activeStreams['environment.wind.speedApparent'] = theStream.onValue(function(value) {
        that.widget.props.values.speedApparent = value;
        if (that.options.displayModeIndex === displayApparent) {
          that.widget.props.holder.setState({ newValue: true});
        }
      })
    }
  },
  'environment.wind.speedOverGround': function(sourceId, stream) {
    var that = this;
    if (!this.widget.props.activeStreams['environment.wind.speedOverGround']) {
      let theStream = stream
      if (this.options.convertTo) {
        const conversion = getConversionsForUnit('m/s')[this.options.convertTo]
        if (conversion) {
          theStream = stream.map(conversion)
        }
      }
      this.widget.props.activeStreams['environment.wind.speedOverGround'] = theStream.onValue(function(value) {
        that.widget.props.values.speedOverGround = value;
        if (that.options.displayModeIndex === displayTrueGround) {
          that.widget.props.holder.setState({ newValue: true});
        }
      })
    }
  },
  'environment.wind.speedTrue': function(sourceId, stream) {
    var that = this;
    if (!this.widget.props.activeStreams['environment.wind.speedTrue']) {
      let theStream = stream
      if (this.options.convertTo) {
        const conversion = getConversionsForUnit('m/s')[this.options.convertTo]
        if (conversion) {
          theStream = stream.map(conversion)
        }
      }
      this.widget.props.activeStreams['environment.wind.speedTrue'] = theStream.onValue(function(value) {
        that.widget.props.values.speedTrue = value;
        if (that.options.displayModeIndex === displayTrueWater) {
          that.widget.props.holder.setState({ newValue: true});
        }
      })
    }
  }
}

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
      <text x="200" y={yOffset + 10} textAnchor="middle" dominantBaseline="central" style={{"fontSize":"28px"}}
        transform={"rotate(" + (-i - 180) + " " + half + " " + yOffset + ")"}>{i}</text>
    </g>
  );
  ticks.push(
    <g key={"text--" + i} transform={centerRotate(180 - i)}>
      <text x="200" y={yOffset + 10} textAnchor="middle" dominantBaseline="central" style={{"fontSize":"28px"}}
       transform={"rotate(" + (i - 180) + " " + half + " " + yOffset + ")"}>{i}</text>
    </g>
  )
}

class ComponentClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newValue: false,
      popupRaised: 0
    };
    this.changeDisplayMode = this.changeDisplayMode.bind(this);
  }

  getShadow() {
    return ({ __html:
      '<filter id="f1">' +
      '<feGaussianBlur in="SourceAlpha" stdDeviation="2" />' +
      '<feOffset dx="2.4" dy="1.6" />' +
      '<feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>' +
      '</filter>'
    });
  }

  changeDisplayMode(event) {
    if ((event.nativeEvent.offsetX > 50) || (event.nativeEvent.offsetY > 50)) { return }
    const newDisplayModeIndex = getNextDisplayModeIndex(this.props.options.displayModeIndex);
    const bitmaskIndex = 1 << newDisplayModeIndex;
    if ((newDisplayModeIndex !== 0) && !(this.state.popupRaised & bitmaskIndex)) {
      const activeSources = this.props.options.activeSources;
      const pathFound = Object.keys(activeSources).filter(function(key) {
        return ((activeSources[key].path === pathsCovered[newDisplayModeIndex]) || // check for wind angle path
          (activeSources[key].path === pathsCovered[newDisplayModeIndex + 3]) // check for wind speed path
        )})
      if (pathFound.length != 2) {
        alert("Your system seems to be missing " + getValuesForDisplayModeIndex[newDisplayModeIndex](this.props.values).label +
          ".\nYou can try installing the Derived Data plugin,\n" +
          "and activating \"Ground Wind Angle\" & \"Speed True Wind Angle\".");
        this.setState({ popupRaised: this.state.popupRaised | bitmaskIndex}); //popup raised only once by mode
      }
    }
    this.setState({ newValue: true});
    this.props.options.displayModeIndex = newDisplayModeIndex;
    this.props.options.unit = 'm/s';
    this.props.instrumentPanel.persist();
  }

  render() {
    var sx = half;
    var sy = arcWidth / 2;
    var ar = half - sy;
    var ex = ar * Math.sin(Math.PI / 3); // 60°
    var ey = ar * Math.cos(Math.PI / 3); // 60°
    var displayValues = getValuesForDisplayModeIndex[this.props.options.displayModeIndex](this.props.values);
    return (
      <svg onClick={this.changeDisplayMode} height="100%" width="100%" viewBox="0 0 400 400">
        <svg dangerouslySetInnerHTML={this.getShadow()} />
        <g stroke="black" transform="scale(0.9) translate(20 40)">
          <path d={["M", sx, sy, "a", ar, ar, "0 0 1", ex, ey].join(" ")}
            style={{"fill":"none", "stroke":"green", "strokeWidth":arcWidth}} />
          <path d={["M", sx, sy, "a", ar, ar, "0 0 0", -ex, ey].join(" ")}
            style={{"fill":"none", "stroke":"red", "strokeWidth":arcWidth}} />
          {ticks}
          <rect width="150" height="50" x="125" y="135" rx="5" ry="5" fill="rgba(255,255,255,0.8)" />
          <text x="200" y="164" textAnchor="middle" fontSize="38" dominantBaseline="middle">
            {getDisplayWindAngle(displayValues.angle)}
          </text>
          <rect width="150" height="50" x="125" y="215" rx="5" ry="5" fill="rgba(255,255,255,0.8)" />
          <text x="200" y="244" textAnchor="middle" fontSize="38" dominantBaseline="middle">
            {safeFixed(displayValues.speed)}
          </text>
          <text x="200" y="284" textAnchor="middle" fontSize="25" dominantBaseline="middle">
            {this.props.options.convertTo ? this.props.options.convertTo : 'm/s'}
          </text>
          <polygon points="200,20 190,200 200,215 210,200"
            fill="rgba(221, 221, 221, 0.6)" stroke="#333" strokeWidth="1"
            transform={centerRotate(displayValues.angle)} style={{"filter":"url(#f1)"}} />
        </g>
        <text x="200" y="24" textAnchor="middle" fontSize="20">{displayValues.label}</text>
      </svg>
    )
  }

  componentDidMount() {
    this.props.holder.setState = this.setState.bind(this)
  }

  componentWillUnmount() {
    //disable updates when component not mounted
    this.props.holder.setState = function(d) {};
  }
};

ComponentClass.defaultProps = {
  withClickMe: true
}

function WindMeter(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options.activeSources = {};
  this.options.initialDimensions = this.options.initialDimensions || {h: 4};
  this.active = true;
  if ((typeof this.options.displayModeIndex === "undefined") ||
       (this.options.displayModeIndex < 0) ||
       (this.options.displayModeIndex > getValuesForDisplayModeIndex.length -1)) {
    this.options.displayModeIndex = 0;
  }
  var values = {
      angleApparent: 0,
      angleTrueGround: 0,
      angleTrueWater: 0,
      speedApparent: 0,
      speedOverGround: 0,
      speedTrue: 0
  };

  // no-op setState to disable updates of deserialized but currently unmounted
  //components
  this.widget = React.createElement(ComponentClass,{
    key: id,
    options: options,
    instrumentPanel: this.instrumentPanel,
    values: values,
    activeStreams: {},
    holder: {
      setState: function() {}
    }
  });
}

util.inherits(WindMeter, BaseWidget);

WindMeter.prototype.handleNewSource = function(newSource) {
  if (typeof subscribes[newSource.path] !== 'undefined') {
    if (typeof this.options.activeSources[newSource.key] === 'undefined') {
      subscribes[newSource.path].call(this, newSource.sourceId, newSource.stream)
      this.options.activeSources[newSource.key] = {
        path: newSource.path,
        sourceId: newSource.sourceId,
        key: newSource.key
      };
    }
    return true;
  }
}

function getDisplayWindAngle(value) {
  return value >= 0 && value <= 180 ? value.toFixed(0):
         value > 180 ? Math.abs(value - 360).toFixed(0) * -1:
         Math.abs(value).toFixed(0) * -1;
}

function safeFixed(value) {
  try {
    return Number(value).toFixed(1);
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

WindMeter.prototype.getHandledSources = function() {
  return Object.values(this.options.activeSources);
}

WindMeter.prototype.getOptions = function() {
  this.options.unit = 'm/s';
  return this.options;
}

WindMeter.prototype.getInitialDimensions = function() {
  return {w:2, h:4};
}

function centerRotate(deg) {
  return ["rotate(", deg, half, half, ")"].join(" ");
}

const SettingsPanel = (props) => {
  return (
    <div>
      {props.unit != '' ? unitChoice('m/s', props.onUnitChange, props.options.convertTo) : undefined}
    </div>
  )
}

WindMeter.prototype.getSettingsElement = function() {
  var that = this;
  return SettingsPanel({
    options: this.options,
    onUnitChange: function(event) {
      that.options.convertTo = event.target.value === 'm/s' ? '' : event.target.value;
      that.instrumentPanel.persist();
      that.instrumentPanel.pushGridChanges();
      that.instrumentPanel.setReloadRequired();
    }
  });
}

module.exports = {
  constructor: WindMeter,
  type: 'windmeter',
  paths: pathsCovered
}
