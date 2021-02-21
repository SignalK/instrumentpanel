import React from 'react';
import { render } from 'react-dom';
import util from 'util';

import BaseWidget, {defaultComponentDidMount, defaultComponentWillUnmount} from './basewidget';

const coordTypeLatitude = 1
const coordTypeLongitude = 2
const defaultPositionValue = {longitude: '--', latitude: '--', label: '--', fontSize: 15}

function getCoordDir(value, coordType) {
  if (!value) {
    return ''
  }

  if (coordType === coordTypeLongitude) {
    return (value >= 0 ? 'E' : 'W')
  } else if (coordType == coordTypeLatitude) {
    return (value >= 0 ? 'N' : 'S')
  }

  return ''
}

function displayDMS(value, coordType, displayUnit) {
  var valDeg, degPadSize, valMin, valSec, result, coordDir

  if (!value) {
    return '--.--'
  }

  coordDir = getCoordDir(value, coordType)
  degPadSize = (coordType === coordTypeLongitude) ? 3 : 2

  value = parseFloat(value);
  value = Math.abs(value);
  valDeg = String(Math.floor(value)).padStart(degPadSize,'0')
  result = valDeg + ((displayUnit === true) ? '\u00b0' : coordDir)
  valMin = String(Math.floor((value - valDeg) * 60)).padStart(2,'0')
  result += valMin + "'"
  valSec = String(Number(Math.round((value - valDeg - valMin / 60) * 3600 * 1000) / 1000).toFixed(3)).padStart(6,'0')
  valSec = valSec.replace('.','"')
  result += valSec
  result = (displayUnit === true) ? coordDir + ' ' + result : result
  return result;
}

function displayDD(value, coordType, displayUnit, displaySign) {
  var degPadSize, result, coordDir;
  
  if (!value) {
    return '--.--'
  }

  coordDir = getCoordDir(value, coordType)
  degPadSize = (coordType === coordTypeLongitude) ? 9 : 8

  value = parseFloat(value)
  result = Number(Math.abs(value)).toFixed(5)
  result = String(result).padStart(degPadSize,'0')
  if (displaySign === true) {
    result = ((value < 0) ? '-' : '+' ) + result
  }
  result = (displayUnit === true) ? coordDir + ' ' + result + '\u00b0': coordDir + ' ' + result
  return result;
}

var positionFormats = [
  function(positionObject) {
    return {
      latitude: displayDD(positionObject.latitude, coordTypeLatitude, true, false),
      longitude: displayDD(positionObject.longitude, coordTypeLongitude, true, false),
      label: 'Dir D.ddddd\u00b0',
      fontSize: 16
    }
  },
  function(positionObject) {
    return {
      latitude: displayDD(positionObject.latitude, coordTypeLatitude, true, true),
      longitude: displayDD(positionObject.longitude, coordTypeLongitude, true, true),
      label: 'Dir +/-D.ddddd\u00b0',
      fontSize: 15
    }
  },
  function(positionObject) {
    return {
      latitude: displayDMS(positionObject.latitude, coordTypeLatitude, true),
      longitude: displayDMS(positionObject.longitude, coordTypeLongitude, true),
      label: "Dir D\u00b0M'S''ddd",
      fontSize: 14
    }
  },
  function(positionObject) {
    return {
      latitude: displayDMS(positionObject.latitude, coordTypeLatitude, false),
      longitude: displayDMS(positionObject.longitude, coordTypeLongitude, false),
      label: "DDirM'S''ddd",
      fontSize: 15
    }
  }
]

function DigitalPosition(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  if (typeof this.options.formatPositionIndex === 'undefined') {
    this.options.formatPositionIndex = 0;
  }
  this.options.formatPositionIndex = this.options.formatPositionIndex % positionFormats.length;

  class ReactComponent extends React.Component {
    constructor(props) {
      super(props);
      this.changeDisplayMode = this.changeDisplayMode.bind(this);
      this.postConversion = this.postConversion.bind(this);
      this.onOptionsUpdate = this.onOptionsUpdate.bind(this);
      this.handleTimeoutLabel = null;
      this.widgetLabel = '';
      this.formatPositionIndex = 0;
      this.onOptionsUpdate(this.props.optionsBundle.getOptions());
      this.state = {
        value: defaultPositionValue
      };
    }

    componentDidMount() {
      defaultComponentDidMount(this,undefined,this.postConversion);
      this.props.functions['changeDisplayMode'] = this.changeDisplayMode;
    }
  
    componentWillUnmount() {
      clearTimeout(this.handleTimeoutLabel);
      this.props.functions['changeDisplayMode'] = undefined;
      defaultComponentWillUnmount(this);
    }

    postConversion(value) {
      let positionValue = {}
      try {
        positionValue = positionFormats[this.formatPositionIndex](value);
      } catch (ex) {
          positionValue = defaultPositionValue;
        }
      return positionValue;
    }

    onOptionsUpdate(options) {
      if(this.handleTimeoutLabel !== null) {
        this.widgetLabel = positionFormats[options.formatPositionIndex](this.state.value).label;
      } else {
        this.widgetLabel = options.label;
      }
      this.formatPositionIndex =  options.formatPositionIndex;
    }

    changeDisplayMode() {
      const firstClic = (this.handleTimeoutLabel === null) ? true : false;
      clearTimeout(this.handleTimeoutLabel);
      this.handleTimeoutLabel = setTimeout(() => {
        this.handleTimeoutLabel = null;
        this.props.optionsBundle.setOptions(null);
      }, 5000);
      if (!firstClic) {
        let newFormatPositionIndex = this.props.optionsBundle.getOptions().formatPositionIndex;
        newFormatPositionIndex = (newFormatPositionIndex + 1) % positionFormats.length;
        this.props.optionsBundle.setOptions({formatPositionIndex: newFormatPositionIndex});
      } else {
        this.props.optionsBundle.setOptions(null);
      }
    }

    render() {
      try {
        return (
          <svg key={id} height="100%" width="100%" viewBox="0 0 20 40" stroke="none">
            <text x="10" y="17" textAnchor="middle" fontSize={this.state.value.fontSize} dominantBaseline="middle">{this.state.value.latitude}</text>
            <text x="10" y="33" textAnchor="middle" fontSize={this.state.value.fontSize} dominantBaseline="middle">{this.state.value.longitude}</text>
            <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">{this.widgetLabel}</text>
          </svg>
        )
      } catch (ex) {console.log(ex)}
      return (<div>safety mode</div>)
    }
  }

  ReactComponent.defaultProps = {
    withClickMe: true,
    functions: {}
  }

  this.widget = React.createElement(ReactComponent,{
    key: id,
    instrumentPanel: this.instrumentPanel,
    valueStream: this.valueStream,
    optionsBundle: this.optionsBundle,
  });
}

util.inherits(DigitalPosition, BaseWidget);

DigitalPosition.prototype.getReactElement = function() {
  return this.widget;
}

DigitalPosition.prototype.getType = function() {
  return "digitalposition";
}

DigitalPosition.prototype.getInitialDimensions = function() {
  return {h:2};
}

export default {
  constructor: DigitalPosition,
  type: "digitalposition",
  paths: [
    'navigation.position',
    'navigation.courseGreatCircle.nextPoint.position',
    'navigation.courseGreatCircle.previousPoint.position',
    'navigation.anchor.position'
  ]
}
