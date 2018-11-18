var React = require('react');

var BaseWidget = require('./basewidget');
require('util').inherits(DigitalPosition, BaseWidget);

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

var FormatsPosition = [
  function(objectPosition) {
    return {
      latitude: displayDD(objectPosition.latitude, coordTypeLatitude, true, false),
      longitude: displayDD(objectPosition.longitude, coordTypeLongitude, true, false),
      label: 'Dir D.ddddd\u00b0',
      fontSize: 16
    }
  },
  function(objectPosition) {
    return {
      latitude: displayDD(objectPosition.latitude, coordTypeLatitude, true, true),
      longitude: displayDD(objectPosition.longitude, coordTypeLongitude, true, true),
      label: 'Dir +/-D.ddddd\u00b0',
      fontSize: 15
    }
  },
  function(objectPosition) {
    return {
      latitude: displayDMS(objectPosition.latitude, coordTypeLatitude, true),
      longitude: displayDMS(objectPosition.longitude, coordTypeLongitude, true),
      label: "Dir D\u00b0M'S''ddd",
      fontSize: 14
    }
  },
  function(objectPosition) {
    return {
      latitude: displayDMS(objectPosition.latitude, coordTypeLatitude, false),
      longitude: displayDMS(objectPosition.longitude, coordTypeLongitude, false),
      label: "DDirM'S''ddd",
      fontSize: 15
    }
  }
]

function DigitalPosition(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  if ((typeof this.options.formatPositionIndex === 'undefined') ||
      (typeof this.options.formatPositionIndex < 0) ||
      (typeof this.options.formatPositionIndex > FormatsPosition.length -1)) {
    this.options.formatPositionIndex = 0;
  }
  this.widget = React.createElement(React.createClass({
    getInitialState: function() {
      return {
        formatPositionIndex: this.props.options.formatPositionIndex
      }
    },
    componentDidMount: function() {
        if (this.unsubscribe) {
          this.unsubscribe();
        }
        this.unsubscribe = streamBundle.getStreamForSourcePath(options.sourceId, options.path).onValue(function(value) {
          this.setState(value);
        }.bind(this));
    },
    componentWillUnmount: function() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    },
    changeFormatPosition: function() {
      const newFormatPositionIndex = this.state.formatPositionIndex === FormatsPosition.length -1 ? 0 : this.state.formatPositionIndex +1;
      this.setState({ formatPositionIndex: newFormatPositionIndex});
      this.props.options.formatPositionIndex = newFormatPositionIndex;
      this.props.instrumentPanel.persist();
    },
    render: function() {
      var objectPosition = FormatsPosition[this.state.formatPositionIndex]({latitude: this.state.latitude,longitude: this.state.longitude});
      return (
        <svg key={id} onClick={this.changeFormatPosition} height="100%" width="100%" viewBox="0 0 20 40">
          <text x="10" y="19" textAnchor="middle" fontSize={objectPosition.fontSize} dominantBaseline="middle">{objectPosition.latitude}</text>
          <text x="10" y="35" textAnchor="middle" fontSize={objectPosition.fontSize} dominantBaseline="middle">{objectPosition.longitude}</text>
          <text x="10" y="4" textAnchor="middle" fontSize="4" dominantBaseline="middle">{objectPosition.label + '  ' + options.sourceId}</text>
        </svg>
      )
    }
  }),{
    key: id,
    options: this.options,
    instrumentPanel: this.instrumentPanel
  });
}

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
