import React from 'react';
import Bacon from 'baconjs';
import util from 'util';

import AnalogComponent from './analogcomponent';
import DigitalComponent from './digitalcomponent';
import BaseWidget from './basewidget';
import { unitChoice } from '../settings/conversions';

var zones = [
  'zone1',
  'zone2',
  'zone3',
  'zone4'
];

var zoneColors = [
  'none',
  'green',
  'blue',
  'yellow',
  'red',
  'black'
];

class ZoneEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zone: '-',
      min: 0,
      max: 0,
      color: 'none'
    };
    this.handleZoneChange = this.handleZoneChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleZoneChange(event) {
    this.setState({
      zone: event.target.value
    });
    if (event.target.value !== '-') {
      this.setState({
        min: this.props.props.options[event.target.value].min,
        max: this.props.props.options[event.target.value].max,
        color: this.props.props.options[event.target.value].color,
      });
    }
  }

  handleInputChange(event) {
    var [zone, key] = event.target.id.split('.');
    this.setState({
      [key]: event.target.value
    });
    this.props.props.onSettingsChange(event);
  }

  render() {
    return (
      <React.Fragment>
      <tr>
        <td><label style={{marginLeft: 10}}>Zones</label></td>
        <td>
          <select onChange={this.handleZoneChange} value={this.state.zone}>
            <option key={"none"} value={"-"} disabled>{"Select"}</option>
            {zones.map((zone) => {
              return (<option key={zone} value={zone}>{zone}</option>)
            })}
          </select>
        </td>
      </tr>
      {(this.state.zone !== '-') ?
          <React.Fragment>
          <tr>
          <td><label style={{marginLeft: 10}}>Color</label></td>
          <td>
            <select id={this.state.zone + '.color'} onChange={this.handleInputChange} value={this.state.color}>
              {zoneColors.map((color) => {
                return (<option key={color} value={color}>{color}</option>)
              })}
            </select>
          </td>
          </tr>
          <tr>
          <td><label style={{marginLeft: 10}}>Mininmum</label></td>
          <td>
            <input id={this.state.zone + '.min'} size="4" onChange={this.handleInputChange} value={this.state.min}/>
          </td>
          </tr>
          <tr>
          <td><label style={{marginLeft: 10}}>Maximum</label></td>
          <td>
            <input id={this.state.zone + '.max'} size="4" onChange={this.handleInputChange} value={this.state.max}/>
          </td>
          </tr>
          <tr>
          <td colSpan="2"><label style={{marginLeft: 10}}>Set Min=Max to disable zone</label></td>
          </tr>
          </React.Fragment>
        : undefined
      }
      </React.Fragment>
    )
  }

}

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
    <input id="common.minValue" size="4" onChange={props.onSettingsChange} defaultValue={props.options.minValue || 0}/>
    </td>
    </tr>
    <tr>
    <td>
    <label htmlFor="max" style={{marginLeft: 10}}>Maximum</label>
    </td>
    <td>
    <input id="common.maxValue" size="4" onChange={props.onSettingsChange} defaultValue={props.options.maxValue || 2}/>
    </td>
    </tr>
    <ZoneEditor props={props}></ZoneEditor>
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
  /* backward compatibility with old redLine */
  if (typeof this.options.redLine !== 'undefined') {
    this.options.zone1 = {color: 'red', min: this.options.redLine, max: this.options.maxValue}
    delete this.options.redLine;
    instrumentPanel.persist();
  }

  zones.forEach((zone) => {
    this.options[zone] = (
      typeof this.options[zone] !== 'object' ||
      typeof this.options[zone].color !== 'string' ||
      typeof this.options[zone].min !== 'number' ||
      typeof this.options[zone].max !== 'number'
    ) ? {color: 'none', min: 0, max: 0} : this.options[zone];
  })
  this.settingsStream = new Bacon.Bus();
  this.widgets = [];
  this.widgets = [React.createElement(DigitalComponent,{
    key: id,
    options: this.options,
    instrumentPanel: this.instrumentPanel
  }),React.createElement(AnalogComponent,{
    key: id,
    options: this.options,
    settingsStream: this.settingsStream.toProperty(),
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
    onUnitChange: function(event) {
      that.options.convertTo = event.target.value === that.options.unit ? '' : event.target.value;
      that.instrumentPanel.pushGridChanges();
      that.instrumentPanel.persist();
      that.instrumentPanel.setReloadRequired();
    },
    onSettingsChange: function(event) {
      var [zone, key] = event.target.id.split('.')
      if (zone === 'common') {
        that.options[key] = Number(event.target.value);
        that.settingsStream.push({[key]: Number(event.target.value)});
      } else {
        that.options[zone][key] = (key === 'color') ? event.target.value : Number(event.target.value);
        that.settingsStream.push(that.options[zone]);
      }
      that.instrumentPanel.persist();
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
