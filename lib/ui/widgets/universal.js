var React = require('react');
var d3 = require('d3');
var Bacon = require('baconjs');
var _ = require('lodash');

import {
  getConversionsForUnit,
  conversionsToOptions,
  unitChoice
} from '../settings/conversions'


var SettingsPanel = (props) => {
  var analogSettings = (
    <fieldset>
    <table>
    <tbody>
    <tr>
    <td>
    <label htmlFor="min" style={{marginLeft: 10}}>Minimum</label>
    </td>
    <td>
    <input id="min" size="4" onChange={props.onMinChange} defaultValue={props.options.minValue || 0}/>
    </td>
    </tr>
    <tr>
    <td>
    <label htmlFor="red" style={{marginLeft: 10}}>Redline</label>
    </td>
    <td>
    <input id="red" size="4" onChange={props.onRedChange} defaultValue={props.options.redLine || 1.5}/>
    </td>
    </tr>
    <tr>
    <td>
    <label htmlFor="max" style={{marginLeft: 10}}>Maximum</label>
    </td>
    <td>
    <input id="max" size="4" onChange={props.onMaxChange} defaultValue={props.options.maxValue || 2}/>
    </td>
    </tr>
    </tbody>
    </table>
    </fieldset>
  )

  return (
    <div>
      {props.unit != '' ? unitChoice(props.unit, props.onUnitChange, props.options.convertTo) : undefined}
      {props.gaugeTypes.map((gaugeType, i) => {
        return (<span>
        <input type="radio"
               name={props.options.key + gaugeType}
               id={props.options.key + gaugeType}
               checked={props.options.selectedWidget === i}
               onChange={props.onWidgetChange.bind(this, i)} />
        <label htmlFor={props.options.key + gaugeType} style={{marginLeft: 10}}>{gaugeType}</label>
        <br/>
        </span>
      )
      })}
      {props.options.selectedWidget === 0 ? undefined : analogSettings}
    </div>
  )
}


var analogComponent = require('./analogcomponent');
var digitalComponent = require('./digitalcomponent');

var BaseWidget = require('./basewidget');
require('util').inherits(Widget, BaseWidget);

function Widget(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options = options;
  this.options.selectedWidget = this.options.selectedWidget || 0;
  this.maxValueStream = new Bacon.Bus();
  this.minValueStream = new Bacon.Bus();
  this.redLineStream = new Bacon.Bus();
  var pathParts = options.path.split('.');
  this.unit = this.getUnitForPath(options.path) || "";
  var valueStream = streamBundle.getStreamForSourcePath(options.sourceId, options.path);
  if (options.convertTo) {
    var conversions = getConversionsForUnit(this.unit);
    if (conversions[options.convertTo]) {
      valueStream = valueStream.map(conversions[options.convertTo]);
    } else {
      console.error("No such conversion:" + this.unit + "=>" + options.convertTo)
    }
  }
  this.widgets = [React.createElement(digitalComponent,{
    key: id,
    unit: this.unit,
    convertTo: options.convertTo,
    valueStream: valueStream,
    label: options.path,
    path: options.path,
    sourceId: options.sourceId,
  }),React.createElement(analogComponent,{
    key: id,
    unit: this.unit,
    valueStream: valueStream,
    label: options.path,
    path: options.path,
    sourceId: options.sourceId,

    maxValue: options.maxValue,
    maxValueStream: this.maxValueStream.toProperty(),
    minValue: options.minValue,
    minValueStream: this.minValueStream.toProperty(),
    redLine: options.redLine,
    redLineStream: this.redLineStream.toProperty()
  })];
}

Widget.prototype.getReactElement = function() {
  return this.widgets[this.options.selectedWidget];
}

Widget.prototype.getSettingsElement = function() {
  var that = this;
  return SettingsPanel({
    gaugeTypes: ["Digital", "Analog"],
    options: this.options,
    unit: this.unit,
    onWidgetChange: function(value) {
      that.options.selectedWidget = value;
      that.instrumentPanel.persist();
      that.instrumentPanel.pushGridChanges();
    },
    onMaxChange: function(event) {
      that.options.maxValue = Number(event.target.value);
      that.maxValueStream.push(Number(event.target.value));
      that.instrumentPanel.persist();
    },
    onMinChange: function(event) {
      that.options.minValue = Number(event.target.value);
      that.minValueStream.push(Number(event.target.value));
      that.instrumentPanel.persist();
    },
    onRedChange: function(event) {
      that.options.redLine = Number(event.target.value);
      that.redLineStream.push(Number(event.target.value));
      that.instrumentPanel.persist();
    },
    onUnitChange: function(event) {
      that.options.convertTo = event.target.value === that.unit ? undefined : event.target.value;
      that.instrumentPanel.persist();
      that.instrumentPanel.pushGridChanges();
    }
  });
}

Widget.prototype.getType = function() {
  return "universal";
}

Widget.prototype.getOptions = function() {
  return this.options;
}


module.exports = {
  constructor: Widget,
  type: "universal",
  paths: []
}
