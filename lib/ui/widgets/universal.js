import React from 'react';
import Bacon from 'baconjs';
import util from 'util';

import AnalogComponent from './analogcomponent';
import DigitalComponent from './digitalcomponent';
import BaseWidget from './basewidget';
import { unitChoice } from '../settings/conversions';

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
      {(props.options.unit != '')&&(props.options.unit != 'rad') ? unitChoice(props.options.unit, props.onUnitChange, props.options.convertTo) : undefined}
      {props.gaugeTypes.map((gaugeType, i) => {
        return (<span key={i}>
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

function Widget(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options.selectedWidget = this.options.selectedWidget || 0;
  this.maxValueStream = new Bacon.Bus();
  this.minValueStream = new Bacon.Bus();
  this.redLineStream = new Bacon.Bus();
  var pathParts = options.path.split('.');
  this.widgets = [];
  this.widgets = [React.createElement(DigitalComponent,{
    key: id,
    options: this.options,
    instrumentPanel: this.instrumentPanel
  }),React.createElement(AnalogComponent,{
    key: id,
    options: this.options,
    maxValueStream: this.maxValueStream.toProperty(),
    minValueStream: this.minValueStream.toProperty(),
    redLineStream: this.redLineStream.toProperty(),
    instrumentPanel: this.instrumentPanel
  })];

  this.updateUnitData(this);
}

util.inherits(Widget, BaseWidget);

Widget.prototype.updateStream = function(widget, valueStream) {
  var newWidgets  = [];
  widget.widgets.forEach(function(item, index) {
    newWidgets.push( React.cloneElement(item,{
      valueStream: valueStream
    }));
  })
  widget.widgets = newWidgets;
}

Widget.prototype.getReactElement = function() {
  return this.widgets[this.options.selectedWidget];
}

Widget.prototype.getSettingsElement = function() {
  var that = this;
  return SettingsPanel({
    gaugeTypes: ["Digital", "Analog"],
    options: this.options,
    unit: this.options.unit,
    onWidgetChange: function(value) {
      that.options.selectedWidget = value;
      that.instrumentPanel.pushGridChanges();
      that.instrumentPanel.persist();
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
      that.options.convertTo = event.target.value === that.options.unit ? '' : event.target.value;
      that.instrumentPanel.pushGridChanges();
      that.instrumentPanel.persist();
      that.instrumentPanel.setReloadRequired();
    }
  });
}

Widget.prototype.getType = function() {
  return "universal";
}

export default {
  constructor: Widget,
  type: "universal",
  paths: []
}
