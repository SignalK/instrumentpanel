import React from 'react';
import { render } from 'react-dom';
import util from 'util';

import BaseWidget from './basewidget';

const coordTypeLatitude = 1
const coordTypeLongitude = 2

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
  if ((typeof this.options.formatPositionIndex === 'undefined') ||
      (typeof this.options.formatPositionIndex < 0) ||
      (typeof this.options.formatPositionIndex > positionFormats.length -1)) {
    this.options.formatPositionIndex = 0;
  }
  class ReactComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        formatPositionIndex: this.props.options.formatPositionIndex
      };
      this.changePositionFormat = this.changePositionFormat.bind(this);
    }

    componentDidMount() {
        if (this.unsubscribe) {
          this.unsubscribe();
        }
        this.unsubscribe = streamBundle.getStreamForSourcePath(options.sourceId, options.path).onValue(function(value) {
          this.setState(value);
        }.bind(this));
    }

    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    }

    changePositionFormat(event) {
      if ((event.nativeEvent.offsetX > 50) || (event.nativeEvent.offsetY > 50)) { return }
      const newFormatPositionIndex = this.state.formatPositionIndex === positionFormats.length -1 ? 0 : this.state.formatPositionIndex +1;
      this.setState({ formatPositionIndex: newFormatPositionIndex});
      this.props.options.formatPositionIndex = newFormatPositionIndex;
      this.props.instrumentPanel.persist();
    }

    render() {
      var positionObject = positionFormats[this.state.formatPositionIndex]({latitude: this.state.latitude,longitude: this.state.longitude});
      return (
        <svg key={id} onClick={this.changePositionFormat} height="100%" width="100%" viewBox="0 0 20 40" >
          <text x="10" y="17" textAnchor="middle" fontSize={positionObject.fontSize} dominantBaseline="middle">{positionObject.latitude}</text>
          <text x="10" y="33" textAnchor="middle" fontSize={positionObject.fontSize} dominantBaseline="middle">{positionObject.longitude}</text>
          <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">{positionObject.label}</text>
        </svg>
      )
    }
  }

  ReactComponent.defaultProps = {
    withClickMe: true
  }

  this.widget = React.createElement(ReactComponent,{
    key: id,
    options: this.options,
    instrumentPanel: this.instrumentPanel
  });
}

util.inherits(DigitalPosition, BaseWidget);

function getPrefixedValue(value, positivePrefix, negativePrefix) {
  if (value) {
    return (value >= 0 ? positivePrefix : negativePrefix) + " " + Number(Math.abs(value)).toFixed(4)
  } else {
    return '--.--'
  }
}

DigitalPosition.prototype.getReactElement = function() {
  return this.widget;
}

DigitalPosition.prototype.getType = function() {
  return "digitalposition";
}

DigitalPosition.prototype.getOptions = function() {
  return this.options;
}

DigitalPosition.prototype.getInitialDimensions = function() {
  return {h:2};
}


module.exports = {
  constructor: DigitalPosition,
  type: "digitalposition",
  paths: ['navigation.position']
}
