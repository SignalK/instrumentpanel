import React from 'react';
import { render } from 'react-dom';
import util from 'util';
import {Bus, combineWith, once} from 'baconjs';

import { getConversion } from '../settings/conversions';
import BaseWidget from './basewidget';

var size = 400;
var half = size / 2;
var arcWidth = half * 0.15;
var largeTick = half * 0.15;
var smallTick = half * 0.075;
var sx = half;
var sy = arcWidth / 2;
var ar = half - sy;
var ex = ar * Math.sin(Math.PI / 3); // 60°
var ey = ar * Math.cos(Math.PI / 3); // 60°

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
const displayModeLength = 3;
const radToDeg = getConversion('rad', 'deg');
const defaultStateValue = {
  angle: NaN,
  angleText: '-',
  speed: '-',
};

var ticks = [];

for (var i = 0; i < 180; i += 10) {
  var stroke = 1;
  var dash = smallTick;

  if(i % 30 === 0) {
    stroke = 3;
    dash = largeTick;
  }
  var strokeColorRight = (i < 60)? "black" : null;
  var strokeColorLeft = (i > 120)? "black" : null;
  if ((i < 60) | (i > 120)) {
    ticks.push(
      <path key={"tick-" + i} d={"M 200 0 L 200 " + dash}
        strokeWidth={stroke} stroke={strokeColorRight} transform={centerRotate(i)} />
    );
    ticks.push(
      <path key={"tick--" + i} d={"M 200 " + (400-dash) + " L 200 400"}
        strokeWidth={stroke} stroke={strokeColorLeft} transform={centerRotate(i)} />
    );
  } else {
      ticks.push(
        <path key={"tick-" + i} d={"M 200 0 L 200 " + dash + " M 200 " + (400-dash) + " L 200 400"}
          strokeWidth={stroke} transform={centerRotate(i)} />
      );
    }
}

var yOffsetBase = 0;
var yOffset = 0;
for (var i = 0; i < 190; i += 30) {
  if (i < 91) {
    yOffset = 0;
    yOffsetBase = 0.87 * size;
  } else {
      yOffset = 8;
      yOffsetBase = 0.85 * size;
    }
  ticks.push(
    <g key={"text-" + i} transform={centerRotate(180 + i)}>
      <text x="200" y={yOffsetBase + yOffset} textAnchor="middle" dominantBaseline="central" style={{"fontSize":"28px"}}
        transform={"rotate(" + (-i - 180) + " " + half + " " + yOffsetBase + ")"} stroke="none">{i}</text>
    </g>
  );
  if ((i != 0) & (i != 180)) {
    ticks.push(
      <g key={"text--" + i} transform={centerRotate(180 - i)}>
        <text x="200" y={yOffsetBase + yOffset} textAnchor="middle" dominantBaseline="central" style={{"fontSize":"28px"}}
         transform={"rotate(" + (i - 180) + " " + half + " " + yOffsetBase + ")"} stroke="none">{i}</text>
      </g>
    )
  }
}

class ComponentClass extends React.Component {
  constructor(props) {
    super(props);
    this.unsubscribes = [];
    this.widgetLabel = '';
    this.finalUnit = '';
    this.popupRaised = 0;
    this.onOptionsUpdate = this.onOptionsUpdate.bind(this);
    this.changeDisplayMode = this.changeDisplayMode.bind(this);
    this.valuesToDisplay = this.valuesToDisplay.bind(this);

    this.state = defaultStateValue;

    this.onOptionsUpdate(this.props.optionsBundle.getOptions());
  }

  valuesToDisplay(values) {
    let newState = this.state;
    let newAngle = newState.angle;

    if(values) {
      if(typeof values.speed !== 'undefined') {
        if (isNaN(values.speed) || values.speed === null) {
          newState.speed = '-';
        } else {
          newState.speed = (this.conversion) ? this.conversion(values.speed) : values.speed;
          newState.speed = Number(newState.speed).toFixed(1);
        }
      }
      if(typeof values.angle != 'undefined') {
        newAngle = (isNaN(values.angle) || values.angle === null) ? NaN : radToDeg(values.angle);
        newState.angle = newAngle;
        newState.angleText = safeTextAngle(newAngle);
      }
      this.setState(newState);
    }
  }

  onOptionsUpdate(options) {
    this.finalUnit = this.props.optionsBundle.getFinalUnit(options);
    this.widgetLabel = options.label;
  }

  changeDisplayMode() {
    let newDisplayModeIndex = this.props.optionsBundle.getOptions().displayModeIndex;
    newDisplayModeIndex = (newDisplayModeIndex +1) % displayModeLength;
    let availableStreams = this.props.reCombineValueStream(newDisplayModeIndex);
    let bitmaskIndex = 1 << newDisplayModeIndex;
    if ((newDisplayModeIndex !== 0) &&
      !(this.popupRaised & bitmaskIndex) &&
      availableStreams && (!availableStreams.angleStream || !availableStreams.speedStream)) {

      alert("Your system seems to be missing " + this.props.optionsBundle.getOptions().label +
        ".\nYou can try installing the Derived Data plugin,\n" +
        "and activating \"Ground Wind Angle\" & \"True Wind Angle\".");

      this.popupRaised = this.popupRaised | bitmaskIndex; //popup raised only once by mode
    }
    this.props.optionsBundle.setOptions({displayModeIndex: newDisplayModeIndex});
  }

  getHandClear(length, angle) {
    const yLength = -length +210;
    return (
      <React.Fragment>
        <path d={'M 200 ' + yLength + ' l -12 ' + length / 1.055 + ' a 1 1 0 0 0 24 0 z'} fill="rgba(221, 221, 221, 0.6)" strokeWidth="1" transform={'rotate(' + angle + ' 200 200)'}/>
        <path d={'M 200 ' + yLength + ' l -4 ' + length / 3 + ' l 8 0 z'} transform={'rotate(' + angle + ' 200 200)'}/>
      </React.Fragment>
    )
  }

  render() {
    try {
      return (
        <svg height="100%" width="100%" viewBox="0 0 400 400">
          <g transform="scale(0.9) translate(20 40)">
            <path d={["M", sx, sy, "a", ar, ar, "0 0 1", ex, ey].join(" ")}
              style={{"fill":"none", "stroke":"green", "strokeWidth":arcWidth}} />
            <path d={["M", sx, sy, "a", ar, ar, "0 0 0", -ex, ey].join(" ")}
              style={{"fill":"none", "stroke":"red", "strokeWidth":arcWidth}} />
            {ticks}
            <rect width="150" height="50" x="125" y="135" rx="5" ry="5" fill="none"/>
            <text x="200" y="164" textAnchor="middle" fontSize="38" dominantBaseline="middle" stroke="none">
              {this.state.angleText}
            </text>
            <rect width="150" height="50" x="125" y="215" rx="5" ry="5" fill="none" />
            <text x="200" y="244" textAnchor="middle" fontSize="38" dominantBaseline="middle" stroke="none">
              {this.state.speed}
            </text>
            <text x="200" y="284" textAnchor="middle" fontSize="25" dominantBaseline="middle" stroke="none">
              {this.finalUnit}
            </text>
            {isNaN(this.state.angle) ? undefined : this.getHandClear(210, this.state.angle)}
          </g>
          <text x="200" y="24" textAnchor="middle" fontSize="20" stroke="none">{this.widgetLabel}</text>
        </svg>
      )
    } catch (ex) {console.log(ex)}
    return (<div>safety mode</div>)
  }

  componentDidMount() {
    if (this.unsubscribes) {
      this.unsubscribes.forEach((unsubscribe => {
        unsubscribe()
      }));
    }
    this.unsubscribes = [];
    this.conversion = this.props.optionsBundle.getConversionForOptions();
    this.props.functions['changeDisplayMode'] = this.changeDisplayMode;
    this.onOptionsUpdate(this.props.optionsBundle.getOptions());
    if(this.props.valueStream) {
      this.unsubscribes.push(this.props.valueStream.onValue(this.valuesToDisplay));
    }
    this.unsubscribes.push(
      this.props.optionsBundle.busNewOptions.onValue(
        ( ([options,value]) => {
          this.conversion = this.props.optionsBundle.getConversionForOptions();
          this.onOptionsUpdate(options)
          this.valuesToDisplay(value);
        }).bind(this)
      )
    );
    setTimeout(() => {this.props.optionsBundle.setOptions(null);}, 1000);
  }

  componentWillUnmount() {
    if (this.unsubscribes) {
      this.unsubscribes.forEach((unsubscribe => {
        unsubscribe()
      }));
    }
    this.unsubscribes = [];
    this.props.functions['changeDisplayMode'] = undefined;
  }
};

ComponentClass.defaultProps = {
  withClickMe: true,
  functions: {}
}

function WindMeter(id, options, streamBundle, instrumentPanel) {
  options.unit = 'm/s';
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options.initialDimensions = this.options.initialDimensions || {h: 4};
  this.availableSources = [];
  this.unplugs = [];
  if (typeof this.options.displayModeIndex === "undefined") {
    this.options.displayModeIndex = 0;
  }
  this.options.displayModeIndex = this.options.displayModeIndex % displayModeLength;
  this.valueStreamBus = new Bus();
  this.optionsStreamBus  = new Bus();
//  this.optionsBundle.optionsStream = this.optionsStreamBus.toProperty();
  this.combineValueStream(this.options.displayModeIndex);

  this.widget = React.createElement(ComponentClass,{
    key: id,
    valueStream: this.valueStreamBus.toProperty({}),
    instrumentPanel: this.instrumentPanel,
    optionsBundle: this.optionsBundle,
    reCombineValueStream: (displayModeIndex) => {return this.combineValueStream(displayModeIndex)}
  });
}

util.inherits(WindMeter, BaseWidget);

WindMeter.prototype.handleNewSource = function(newSource) {
  if(pathsCovered.includes(newSource.path)) {
    if (!this.availableSources.includes(newSource.key)) {
      this.availableSources.push(newSource);
      this.combineValueStream(this.options.displayModeIndex);
    }
    return true;
  }
}

WindMeter.prototype.findSourceForPath= function(path) {
  return this.availableSources.find((source) => {
    return source.path === path;
  }) || {};
}

WindMeter.prototype.combineValueStream = function(displayModeIndex) {
  let angleStream = undefined;
  let speedStream = undefined;
  let angleSource = undefined;
  let speedSource = undefined;
  let paths = [];
  let combinedStreams = undefined;
  let options = {};

  if (this.unplugs) {
    this.unplugs.forEach((unplug => {
      unplug()
    }));
  }
  this.unplugs = [];
  options.activeSources = {};

  if(displayModeIndex === displayApparent) {
    paths = [
      'environment.wind.angleApparent',
      'environment.wind.speedApparent'
    ];
    options.label = 'Apparent Wind';
  } else if(displayModeIndex === displayTrueGround) {
    paths = [
      'environment.wind.angleTrueGround',
      'environment.wind.speedOverGround'
    ];
    options.label = 'True Wind over Ground';
  } else if(displayModeIndex === displayTrueWater) {
    paths = [
      'environment.wind.angleTrueWater',
      'environment.wind.speedTrue'
    ];
    options.label = 'True Wind through Water';
  } else {
    options.label = '???';
  }

  if (paths.length == 2) {
    angleSource = this.findSourceForPath(paths[0]);
    if(angleSource.stream) {
      angleStream = angleSource.stream.map((timestampedValue) => {return timestampedValue.value});
      options.activeSources[angleSource.key] = {
        path:     angleSource.path,
        key:      angleSource.key,
        sourceId: angleSource.sourceId
      };
    }
    speedSource = this.findSourceForPath(paths[1]);
    if(speedSource.stream) {
      speedStream = speedSource.stream.map((timestampedValue) => {return timestampedValue.value});
      options.activeSources[speedSource.key] = {
        path:     speedSource.path,
        key:      speedSource.key,
        sourceId: speedSource.sourceId
      };
    }
  }

  if(angleStream && speedStream) {
    combinedStreams = combineWith(
      (angle, speed) => {
        return {angle, speed} },
      angleStream,
      speedStream
    );
  } else if(angleStream) {
    combinedStreams = combineWith(
      (angle) => {
        return {angle, speed: NaN} },
      angleStream
    );
  } else if(speedStream) {
    combinedStreams = combineWith(
      (speed) => {
        return {speed, angle: NaN} },
      speedStream
    );
  }
  if (combinedStreams) {
    this.unplugs.push(this.valueStreamBus.plug(combinedStreams));
  }

  options = this.optionsBundle.setOptions(options);

  return {
    'angleStream': angleStream,
    'speedStream': speedStream
  };
}

WindMeter.prototype.validateOptions = function(options) {
  options.unit = 'm/s';
  return options;
}

WindMeter.prototype.metaToOptions = function(pathMeta) {
// ToDo !!!!!!
  return {};
}

function safeTextAngle(value) {
  if(isNaN(value)) return "-";
  return value >= 0 && value <= 180 ? value.toFixed(0):
    value > 180 ? Math.abs(value - 360).toFixed(0) * -1:
      Math.abs(value).toFixed(0) * -1;
}

WindMeter.prototype.getReactElement = function() {
  return this.widget;
}

WindMeter.prototype.getType = function() {
  return "windmeter";
}

WindMeter.prototype.getHandledSources = function() {
  return Object.values(this.options.activeSources || {});
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

WindMeter.prototype.getSettingsElement = function(pushCellChange) {
  return this.getSettingsElementUnitOnly(pushCellChange);
}

export default {
  constructor: WindMeter,
  type: 'windmeter',
  paths: pathsCovered
}
