import React from 'react';
import { render } from 'react-dom';
import util from 'util'

import BaseWidget, {defaultComponentDidMount, defaultComponentWillUnmount} from './basewidget';
import { getConversion } from '../settings/conversions'

var rad2Deg = getConversion('rad', 'deg');

function SpecificText(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options.unit = pathsOptions[this.options.path].withUnit || '';

  class SpecificTextComponent extends React.Component {
    constructor(props) {
      super(props);
      this.finalUnit = '';
      this.widgetLabel = '';
      this.specificRender = (typeof this.props.renderFunction === 'function') ?
        this.props.renderFunction.bind(this) : defaultRender.bind(this);
      this.onOptionsUpdate = this.onOptionsUpdate.bind(this);
      this.onOptionsUpdate(this.props.optionsBundle.getOptions());
      if (props.postConversion) {
        this.postConversion = props.postConversion.bind(this)
      }
      this.state = {
        value: '-'
      };
    }

    componentDidMount() {
      defaultComponentDidMount(this, undefined, this.postConversion);
    }

    componentWillUnmount() {
      defaultComponentWillUnmount(this);
    }

    onOptionsUpdate(options) {
      this.finalUnit = this.props.optionsBundle.getFinalUnit(options);
      this.widgetLabel = options.label;
    }

    render() {
      try {
        return this.specificRender();
      } catch (ex) {console.log(ex)}
      return (<div>safety mode</div>)
    }
  }

  this.widget = React.createElement(SpecificTextComponent,{
    key: id,
    instrumentPanel: this.instrumentPanel,
    valueStream: this.valueStream,
    optionsBundle: this.optionsBundle,
    renderFunction: pathsOptions[this.options.path].renderFunction,
    viewBox: pathsOptions[this.options.path].viewBox || "0 0 20 33",
    postConversion: pathsOptions[this.options.path].postConversion || BaseWidget.prototype.defaultPostConversion
  });

}

util.inherits(SpecificText, BaseWidget);

SpecificText.prototype.getReactElement = function() {
  return this.widget;
}

SpecificText.prototype.getSettingsElement = function(pushCellChange) {
  return this.getSettingsElementUnitOnly(pushCellChange);
}

SpecificText.prototype.getType = function() {
  return "specifictext";
}

SpecificText.prototype.getInitialDimensions = function() {
  return {h: pathsOptions[this.options.path].defaultHeight || 2};
}

function defaultRender() {
  return (
    <svg height="100%" width="100%" viewBox="0 0 20 33" stroke="none">
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.widgetLabel}
      </text>
      <text x="10" y="10" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        No specific rendering function
      </text>
      <text x="10" y="14" textAnchor="middle" fontSize="14" dominantBaseline="middle">
        {this.state.value.toString()}
      </text>
    </svg>
  )
}

function environmentCurrentPostConversion(value) {
  if (typeof value !== 'object' || value === null) {value = {}}
  let newValue = {
    setTrue: rad2Deg(value.setTrue),
    setMagnetic: rad2Deg(value.setMagnetic),
    drift: (this.conversion) ? this.conversion(value.drift) : value.drift
  }

  newValue.setTrue = BaseWidget.prototype.defaultPostConversion(newValue.setTrue)
  newValue.setMagnetic = BaseWidget.prototype.defaultPostConversion(newValue.setMagnetic)
  newValue.drift = BaseWidget.prototype.defaultPostConversion(newValue.drift)

  return newValue;
}

function environmentCurrent() {
  return (
    <svg height="100%" width="100%" viewBox={this.props.viewBox} stroke="none">
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.widgetLabel}
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
          {this.state.value.setTrue}
        </text>
        <text textAnchor="start" x="25" y="14" fontSize="8" dominantBaseline="baseline">
          {'°'}
        </text>
        <text textAnchor="middle" y="21" fontSize="10" dominantBaseline="middle">
          {this.state.value.setMagnetic}
        </text>
        <text textAnchor="start" x="25" y="23" fontSize="8" dominantBaseline="baseline">
          {'°'}
        </text>
        <text textAnchor="middle" y="29" fontSize="10" dominantBaseline="middle">
          {this.state.value.drift}
        </text>
        <text textAnchor="start" x="25" y="31" fontSize="8" dominantBaseline="baseline">
          {this.finalUnit}
        </text>
      </g>
    </svg>
  )
}

function navigationGnssMethodQuality() {
  return (
    <svg height="100%" width="100%" viewBox={this.props.viewBox} stroke="none">
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.widgetLabel}
      </text>
      <text textAnchor="middle" x="10" y="20" fontSize="18" dominantBaseline="middle">
        {this.state.value.toString()}
      </text>
    </svg>
  )
}

function navigationGnssIntegrity() {
  return (
    <svg height="100%" width="100%" viewBox={this.props.viewBox} stroke="none">
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.widgetLabel}
      </text>
      <text textAnchor="middle" x="10" y="18" fontSize="12" dominantBaseline="middle">
        {this.state.value.toString()}
      </text>
    </svg>
  )
}

function navigationGnssType() {
  return (
    <svg height="100%" width="100%" viewBox={this.props.viewBox} stroke="none">
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.widgetLabel}
      </text>
      <text textAnchor="middle" x="10" y="22" fontSize="24" dominantBaseline="middle">
        {this.state.value.toString()}
      </text>
    </svg>
  )
}

function navigationSpeedThroughWaterReferenceType() {
  return (
    <svg height="100%" width="100%" viewBox={this.props.viewBox} stroke="none">
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.widgetLabel}
      </text>
      <text textAnchor="middle" x="10" y="20" fontSize="16" dominantBaseline="middle">
        {this.state.value.toString()}
      </text>
    </svg>
  )
}

function designLengthPostConversion(value) {
  if (typeof value !== 'object' || value === null) {value = {}}
  let conversion = (this.conversion) ? this.conversion : (val) => {return val}
  let newValue = {
    overall: conversion(value.overall),
    hull: conversion(value.hull),
    waterline: conversion(value.waterline)
  }

  newValue.overall = BaseWidget.prototype.defaultPostConversion(newValue.overall)
  newValue.hull = BaseWidget.prototype.defaultPostConversion(newValue.hull)
  newValue.waterline = BaseWidget.prototype.defaultPostConversion(newValue.waterline)

  return newValue;
  
}

function designLength() {
  return (
    <svg height="100%" width="100%" viewBox={this.props.viewBox} stroke="none">
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.widgetLabel}
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
          {this.state.value.overall}
        </text>
        <text textAnchor="start" x="25" y="14" fontSize="8" dominantBaseline="baseline">
          {this.finalUnit}
        </text>
        <text textAnchor="middle" y="21" fontSize="10" dominantBaseline="middle">
          {this.state.value.hull}
        </text>
        <text textAnchor="start" x="25" y="23" fontSize="8" dominantBaseline="baseline">
          {this.finalUnit}
        </text>
        <text textAnchor="middle" y="29" fontSize="10" dominantBaseline="middle">
          {this.state.value.waterline}
        </text>
        <text textAnchor="start" x="25" y="31" fontSize="8" dominantBaseline="baseline">
          {this.finalUnit}
        </text>
      </g>
    </svg>
  )
}

function designAisShipType() {
  const aisShipType = this.state.value.name || '-';
  return (
    <svg height="100%" width="100%" viewBox={this.props.viewBox} stroke="none">
      <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
        {this.widgetLabel}
      </text>
      <text x="10" y="20" textAnchor="middle" fontSize="20" dominantBaseline="middle">
        {aisShipType.toString()}
      </text>
    </svg>
  )
}

/*
pathsOptions = Associative array of:
'Signal K path': {
  renderFunction: myRenderFunction, // Madatory: render function for reactComponent
  withUnit: ['m'|'m/s'|'rad'], // Optional: default unit for value (See SK Specification: Keys Reference). default none
  viewBox: ["0 0 20 33"], // Optional: viewBox size for SVG content. default "0 0 20 33"
  defaultHeight: [2] // Optional: default widget height. Value is in grid unit, default 2
  postConversion: function to translate value to display in a text value
}
*/
const pathsOptions = {
  'environment.current': {
    renderFunction: environmentCurrent,
    withUnit: 'm/s',
    postConversion: environmentCurrentPostConversion
  },
  'navigation.gnss.methodQuality': { renderFunction: navigationGnssMethodQuality },
  'navigation.gnss.integrity': { renderFunction: navigationGnssIntegrity },
  'navigation.gnss.type': { renderFunction: navigationGnssType },
  'navigation.speedThroughWaterReferenceType': { renderFunction: navigationSpeedThroughWaterReferenceType },
  'design.length': {
    renderFunction: designLength,
    withUnit: 'm',
    postConversion: designLengthPostConversion
  },
  'design.aisShipType': { renderFunction: designAisShipType }
}

export default {
  constructor: SpecificText,
  type: "specifictext",
  paths: Object.keys(pathsOptions)
}
