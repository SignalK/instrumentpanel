import React from 'react';
import util from 'util'

import ReadingComponent from './compassreadingcomponent';
import RoseComponent from './compassrosecomponent';
import DigitalComponent from './digitalcomponent';
import BaseWidget from './basewidget';

var SettingsPanel = (props) => {
  return (
    <div>
      {props.gaugeTypes.map((gaugeType, i) => {
        return (<span key={i}>
        <input type="radio"
               key={i}
               name={props.options.key + gaugeType}
               id={props.options.key + gaugeType}
               checked={props.options.selectedWidget === i}
               onChange={props.onChange.bind(this, i)} />
        <label htmlFor={props.options.key + gaugeType} style={{marginLeft: 10}}>{gaugeType}</label>
        <br/>
        </span>
      )
      })}
      <br/>
    </div>
  )
}

var pathsCovered = [
  "navigation.courseOverGroundTrue",
  "navigation.courseOverGroundMagnetic",
  "navigation.headingMagnetic",
  "navigation.headingTrue",
  "environment.wind.directionMagnetic",
  "environment.wind.directionTrue"
];

function Compass(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options.initialDimensions = this.options.initialDimensions || {w: 2, h: 4};
  this.options.selectedWidget = this.options.selectedWidget || 0;
  this.widgets = [React.createElement(RoseComponent,{
    key: id,
    instrumentPanel: this.instrumentPanel,
    valueStream: this.valueStream,
    optionsBundle: this.optionsBundle,
  }),
  React.createElement(ReadingComponent,{
    key: id,
    instrumentPanel: this.instrumentPanel,
    valueStream: this.valueStream,
    optionsBundle: this.optionsBundle,
  }),
  React.createElement(DigitalComponent,{
    key: id,
    instrumentPanel: this.instrumentPanel,
    valueStream: this.valueStream,
    optionsBundle: this.optionsBundle,
  })];

}

util.inherits(Compass, BaseWidget);

Compass.prototype.getReactElement = function() {
  return this.widgets[this.options.selectedWidget];
}

Compass.prototype.getSettingsElement = function(pushCellChange) {
  var that = this;
  return SettingsPanel({
    gaugeTypes: ["Rose", "Reading", "Digital"],
    options: this.options,
    onChange: function(value) {
      that.options.selectedWidget = value;
      that.optionsBundle.setOptions(that.options);
      pushCellChange();
      that.instrumentPanel.pushGridChanges();
    }
  });
}

Compass.prototype.getType = function() {
  return "compass";
}

Compass.prototype.getInitialDimensions = function() {
  return {h:4};
}

export function postConversion(value) {
  if (typeof value !== 'number' || isNaN(value) || value === null) return {
    angle: NaN,
    safeAngle: 0,
    angleText: '-'
  }
  return {
    angle: value,
    safeAngle: value,
    angleText: value.toFixed(0)
  }
}

export function onOptionsUpdate(options) {
  this.widgetLabel = options.label;
}

export default {
  constructor: Compass,
  type: "compass",
  paths: pathsCovered
}
