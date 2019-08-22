import React from 'react';
import { render } from 'react-dom';
import util from 'util'

import BaseWidget from './basewidget';
import {
  getConversionsForUnit,
  conversionsToOptions,
  unitChoice
} from '../settings/conversions'

var SettingsPanel = (props) => {
  return (
    <div>
      {props.options.unit != '' ? unitChoice(props.options.unit, props.onUnitChange, props.options.convertTo) : undefined}
    </div>
  )
}


function SpecificText(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options.label = this.options.label | this.getLabelForPath(this.options.path) || this.options.path;
  this.options.unit = pathsOptions[this.options.path].withUnit || '';

  class SpecificTextComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        value: '-',
      };
    }

    componentWillReceiveProps(nextProps) {
      if(nextProps.valueStream !== this.props.valueStream) {
        if (nextProps.valueStream) {
          if (this.unsubscribe) {
            this.unsubscribe();
          }
          this.unsubscribe = nextProps.valueStream.onValue(function(value) {
            this.setState({
              value: value,
            });
          }.bind(this));
        }
      }
    }

    componentDidMount() {
      if (this.props.valueStream) {
        if (this.unsubscribe) {
          this.unsubscribe();
        }
        this.unsubscribe = this.props.valueStream.onValue(function(value) {
          this.setState({
            value: value,
          });
        }.bind(this));
      }
    }

    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    }

    render() {
      const specificRender = this.props.renderFunction.bind(this);
      return (typeof specificRender !== 'undefined') ? specificRender() : defaultRender();
    }
  }

  this.widget = React.createElement(SpecificTextComponent,{
    key: id,
    valueStream: this.streamBundle.getStreamForSourcePath(this.options.sourceId, this.options.path),
    options: this.options,
    renderFunction: pathsOptions[this.options.path].renderFunction,
    viewBox: pathsOptions[this.options.path].viewBox || "0 0 20 33",
    instrumentPanel: this.instrumentPanel
  });
  this.updateUnitData(this, {setUnit: false, setStream: false});
}

util.inherits(SpecificText, BaseWidget);

SpecificText.prototype.updateStream = function(widget, valueStream) {
  widget.widget = React.cloneElement(widget.widget,{
    label: widget.options.label
  })
  widget.instrumentPanel.pushGridChanges();
}

SpecificText.prototype.getReactElement = function() {
  return this.widget;
}

SpecificText.prototype.getSettingsElement = function() {
  var that = this;
  return SettingsPanel({
    options: this.options,
    unit: this.options.unit,
    onUnitChange: function(event) {
      that.options.convertTo = event.target.value === that.options.unit ? '' : event.target.value;
      that.instrumentPanel.persist();
      that.instrumentPanel.pushGridChanges();
      that.instrumentPanel.setReloadRequired();
    }
  });
}

SpecificText.prototype.getType = function() {
  return "specifictext";
}

SpecificText.prototype.getInitialDimensions = function() {
  return {h: pathsOptions[this.options.path].defaultHeight || 2};
}

function defaultRender() {
  return (
    <svg height="100%" width="100%" viewBox="0 0 20 33">
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.props.options.label}
      </text>
      <text x="10" y="10" textAnchor="middle" fontSize="2" dominantBaseline="middle">
        {'No specific render function'}
      </text>
      <text x="10" y="14" textAnchor="middle" fontSize="14" dominantBaseline="middle">
        {this.state.value.toString()}
      </text>
    </svg>
  )
}

function environmentCurrent() {
  var conversions = getConversionsForUnit('rad');
  var setTrue = conversions['deg'](this.state.value.setTrue);
  var setMagnetic = conversions['deg'](this.state.value.setMagnetic);
  var drift = this.state.value.drift;
  var unit = this.props.options.unit;
  var convertTo = this.props.options.convertTo || unit;
  if (convertTo !== unit) {
    conversions = getConversionsForUnit(unit);
    if (typeof conversions[convertTo] === 'function') {
      unit = convertTo;
      drift = conversions[convertTo](drift);
    }
  }
  return (
    <svg height="100%" width="100%" viewBox={this.props.viewBox}>
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.props.options.label}
      </text>
      <text textAnchor="end" x="-5" y="12" fontSize="8" dominantBaseline="middle">
        {'True:'}
      </text>
      <text textAnchor="end" x="-5" y="20" fontSize="8" dominantBaseline="middle">
        {'Mag:'}
      </text>
      <text textAnchor="end" x="-5" y="29" fontSize="8" dominantBaseline="middle">
        {'Drift:'}
      </text>
      <g transform="translate(10, 0)">
        <text textAnchor="middle" y="12" fontSize="10" dominantBaseline="middle">
          {displayValue(setTrue)}
        </text>
        <text textAnchor="start" x="25" y="14" fontSize="8" dominantBaseline="baseline">
          {'°'}
        </text>
        <text textAnchor="middle" y="21" fontSize="10" dominantBaseline="middle">
          {displayValue(setMagnetic)}
        </text>
        <text textAnchor="start" x="25" y="23" fontSize="8" dominantBaseline="baseline">
          {'°'}
        </text>
        <text textAnchor="middle" y="29" fontSize="10" dominantBaseline="middle">
          {displayValue(drift)}
        </text>
        <text textAnchor="start" x="25" y="31" fontSize="8" dominantBaseline="baseline">
          {unit}
        </text>
      </g>
    </svg>
  )
}

function navigationGnssMethodQuality() {
  return (
    <svg height="100%" width="100%" viewBox={this.props.viewBox}>
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.props.options.label}
      </text>
      <text textAnchor="middle" x="10" y="20" fontSize="18" dominantBaseline="middle">
        {this.state.value.toString()}
      </text>
    </svg>
  )
}

function navigationGnssIntegrity() {
  return (
    <svg height="100%" width="100%" viewBox={this.props.viewBox}>
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.props.options.label}
      </text>
      <text textAnchor="middle" x="10" y="18" fontSize="12" dominantBaseline="middle">
        {this.state.value.toString()}
      </text>
    </svg>
  )
}

function navigationGnssType() {
  return (
    <svg height="100%" width="100%" viewBox={this.props.viewBox}>
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.props.options.label}
      </text>
      <text textAnchor="middle" x="10" y="22" fontSize="24" dominantBaseline="middle">
        {this.state.value.toString()}
      </text>
    </svg>
  )
}

function navigationSpeedThroughWaterReferenceType() {
  return (
    <svg height="100%" width="100%" viewBox={this.props.viewBox}>
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.props.options.label}
      </text>
      <text textAnchor="middle" x="10" y="20" fontSize="16" dominantBaseline="middle">
        {this.state.value.toString()}
      </text>
    </svg>
  )
}

function designLength() {
  var overall = this.state.value.overall;
  var hull = this.state.value.hull;
  var waterline = this.state.value.waterline;
  var unit = this.props.options.unit;
  var convertTo = this.props.options.convertTo || unit;
  if (convertTo !== unit) {
    const conversions = getConversionsForUnit(unit);
    if (typeof conversions[convertTo] === 'function') {
      unit = convertTo;
      overall = conversions[convertTo](overall);
      hull = conversions[convertTo](hull);
      waterline = conversions[convertTo](waterline);
    }
  }
  return (
    <svg height="100%" width="100%" viewBox={this.props.viewBox}>
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.props.options.label}
      </text>
      <text textAnchor="end" x="-5" y="12" fontSize="8" dominantBaseline="middle">
        {'Overall:'}
      </text>
      <text textAnchor="end" x="-5" y="20" fontSize="8" dominantBaseline="middle">
        {'Hull:'}
      </text>
      <text textAnchor="end" x="-5" y="29" fontSize="8" dominantBaseline="middle">
        {'WaterLine:'}
      </text>
      <g transform="translate(10, 0)">
        <text textAnchor="middle" y="12" fontSize="10" dominantBaseline="middle">
          {displayValue(overall)}
        </text>
        <text textAnchor="start" x="25" y="14" fontSize="8" dominantBaseline="baseline">
          {unit}
        </text>
        <text textAnchor="middle" y="21" fontSize="10" dominantBaseline="middle">
          {displayValue(hull)}
        </text>
        <text textAnchor="start" x="25" y="23" fontSize="8" dominantBaseline="baseline">
          {unit}
        </text>
        <text textAnchor="middle" y="29" fontSize="10" dominantBaseline="middle">
          {displayValue(waterline)}
        </text>
        <text textAnchor="start" x="25" y="31" fontSize="8" dominantBaseline="baseline">
          {unit}
        </text>
      </g>
    </svg>
  )
}

function designAisShipType() {
  const valueObj = (typeof this.state.value === 'object') ?
    this.state.value : {name: '-'};
  return (
    <svg height="100%" width="100%" viewBox={this.props.viewBox}>
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.props.options.label}
      </text>
      <text x="10" y="20" textAnchor="middle" fontSize="20" dominantBaseline="middle">
        {valueObj.name}
      </text>
    </svg>
  )
}

function displayValue(value) {
  if((typeof value === 'number') && (value)) {
    var v = Math.abs(value);
    if(v >= 50) {
      return value.toFixed(0);
    } else if(v >= 10) {
      return value.toFixed(1);
    } else {
      return value.toFixed(2);
    }
  }
  return '-';
}

/*
pathsOptions = Associative array of:
'Signal K path': {
  renderFunction: myRenderFunction, // Madatory: render function for reactComponent
  withUnit: ['m'|'m/s'|'rad'], // Optional: default unit for value (See SK Specification: Keys Reference). default none
  viewBox: ["0 0 20 33"], // Optional: viewBox size for SVG content. default "0 0 20 33"
  defaultHeight: [2] // Optional: default widget height. Value is in grid unit, default 2
}
*/
const pathsOptions = {
  'environment.current': {
    renderFunction: environmentCurrent,
    withUnit: 'm/s'
  },
  'navigation.gnss.methodQuality': { renderFunction: navigationGnssMethodQuality },
  'navigation.gnss.integrity': { renderFunction: navigationGnssIntegrity },
  'navigation.gnss.type': { renderFunction: navigationGnssType },
  'navigation.speedThroughWaterReferenceType': { renderFunction: navigationSpeedThroughWaterReferenceType },
  'design.length': {
    renderFunction: designLength,
    withUnit: 'm',
  },
  'design.aisShipType': { renderFunction: designAisShipType }
}

module.exports = {
  constructor: SpecificText,
  type: "specifictext",
  paths: Object.keys(pathsOptions)
}
