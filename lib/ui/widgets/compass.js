var React = require('react');

import {
  getConversionsForUnit,
  getDefaultConversion
} from '../settings/conversions'


var SettingsPanel = (props) => {
  return (
    <div>
      {props.gaugeTypes.map((gaugeType, i) => {
        return (<span>
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
  "navigation.headingTrue"
];

var readingComponent = require('./compassreadingcomponent');
var roseComponent = require('./compassrosecomponent');
var digitalComponent = require('./digitalcomponent')

var BaseWidget = require('./basewidget');
require('util').inherits(Compass, BaseWidget);

function Compass(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options = options;
  this.unit = 'rad'
  this.options.initialDimensions = this.options.initialDimensions || {w: 2, h: 4};

  var valueStream = streamBundle.getStreamForSourcePath(options.sourceId, options.path);
  const targetUnit = options.convertTo || 'deg'
  if (targetUnit != 'rad') {
    var conversions = getConversionsForUnit(this.unit);
    if (conversions[targetUnit]) {
      valueStream = valueStream.map(conversions[targetUnit]);
    } else {
      console.error("No such conversion:" + this.unit + "=>" + options.convertTo)
    }
  }

  this.widgets = [React.createElement(roseComponent,{
    key: id,
    value: valueStream,
    label: this.getLabelForPath(options.path),
    sourceId: options.sourceId
  }),
  this.reading = React.createElement(readingComponent,{
    key: id,
    value: valueStream,
    label: this.getLabelForPath(options.path),
    sourceId: options.sourceId
  }), React.createElement(digitalComponent,{
    key: id,
    unit: this.unit,
    convertTo: options.convertTo || 'deg',
    valueStream: valueStream,
    label: this.getLabelForPath(options.path),
    path: options.path,
    sourceId: options.sourceId
  })];
  this.options.selectedWidget = this.options.selectedWidget || 0;
}

Compass.prototype.getReactElement = function() {
  return this.widgets[this.options.selectedWidget];
}

Compass.prototype.getSettingsElement = function() {
  var that = this;
  return SettingsPanel({
    gaugeTypes: ["Rose", "Reading", "Digital"],
    options: this.options,
    onChange: function(value) {
      that.options.selectedWidget = value;
      that.instrumentPanel.persist();
      that.instrumentPanel.pushGridChanges();
    }
  });
}


Compass.prototype.getType = function() {
  return "compass";
}

Compass.prototype.getOptions = function() {
  return this.options;
}

Compass.prototype.getInitialDimensions = function() {
  return {h:4};
}

module.exports = {
  constructor: Compass,
  type: "compass",
  paths: pathsCovered
}
