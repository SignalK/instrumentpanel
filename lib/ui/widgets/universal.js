import React from 'react';
import Bacon from 'baconjs';
import util from 'util';
import { Checkbox } from 'react-bootstrap';

import AnalogComponent from './analogcomponent';
import DigitalComponent from './digitalcomponent';
import BaseWidget from './basewidget';
import { unitChoice } from '../settings/conversions';
import {
  colorsToHTML,
  defaultStatesColor
} from '../settings/constants';

class ZoneModeSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zoneMode: props.props.options.zoneMode || 'local',
      metaReload: props.props.options.metaReload || false,
      stateValue: 'nominal',
      stateColor: props.props.options.statesColor && props.props.options.statesColor.nominal || defaultStatesColor.nominal,
      redLine: props.props.options.redLine || 1.5
    };
    this.statesColor = (typeof props.props.options.statesColor === 'object') ? props.props.options.statesColor : defaultStatesColor;
    this.handleInputChange = this.handleInputChange.bind(this);
    this.zonesToText = this.zonesToText.bind(this);
    this.zonesText = [];
    this.zonesToText();
  }

  zonesToText() {
    if (!Array.isArray(this.props.props.options.zones)) return;
    this.props.props.options.zones.forEach(zone => {
      var zoneText = '';
      if (typeof zone.upper === 'undefined' && typeof zone.lower !== 'undefined') {
        zoneText = 'value>' + zone.lower;
      } else if (typeof zone.upper !== 'undefined' && typeof zone.lower === 'undefined') {
        zoneText = 'value<' + zone.upper;
      } else if (typeof zone.upper !== 'undefined' && typeof zone.lower !== 'undefined') {
        zoneText = zone.lower + '<value<' + zone.upper;
      } else { // something wrong ????
        zoneText = 'error';
      }
      zoneText = zone.state + '=> ' + zoneText;
      this.zonesText.push(zoneText);
    });
  }

  handleInputChange(event) {
    var eventID = event.target.id;
    if (eventID === 'stateValue') {
      this.setState({
        stateValue: event.target.value,
        stateColor: this.statesColor[event.target.value]
      });
      return;
    } else if (eventID === 'stateColor') {
      this.setState({
        stateColor: event.target.value
      });
      this.statesColor[this.state.stateValue] = event.target.value;
      this.props.props.onSettingsChange(
        {target: {
          id: 'statesColor',
          value: this.statesColor
        }}
      );
    } else if (eventID === 'metaReload') {
      this.setState({
        metaReload: event.target.checked
      }, this.props.props.onSettingsChange(event));
    } else {
      this.setState({
        [eventID]: event.target.value
      }, this.props.props.onSettingsChange(event));
    }
  }

  render() {
    return (
      <React.Fragment>
        <tr><td colSpan="2"><label style={{marginLeft: 10, marginTop: 10}}>Retrieve color zones</label></td></tr>
        <tr>
          <td><label style={{marginLeft: 10}}>from:</label></td>
          <td>
            <select id="zoneMode" onChange={this.handleInputChange} value={this.state.zoneMode}>
              <option key="local" value="local">local</option>
              <option key="server" value="server">server</option>
            </select>
          </td>
        </tr>

      {(this.state.zoneMode === "local") ?
        <tr>
          <td><label htmlFor="redLine" style={{marginLeft: 10, marginTop: 10}}>Redline</label></td>
          <td><input id="redLine" size="4" onChange={this.handleInputChange} defaultValue={this.state.redLine}/></td>
        </tr>
        : // zone from server
          <React.Fragment>
          <tr>
            <td><label style={{marginLeft: 10, marginTop: 10}}>Zone state=></label></td>
            <td><label style={{marginTop: 10}}>Level</label></td>
          </tr>
          {this.zonesText.map((zoneText, index) => {
            return(
              <React.Fragment key={index}>
                <tr>
                  <td colSpan="2"><label style={{marginLeft: 10}}>{zoneText}</label></td>
                </tr>
              </React.Fragment>
            )

          })}
          <tr><td colSpan="2"><label style={{marginLeft: 10, marginTop: 10}}>Map zone state to color</label></td></tr>
          <tr>
            <td>
              <select style={{marginLeft: 10}} id='stateValue' onChange={this.handleInputChange} value={this.state.stateValue}>
                {Object.entries(defaultStatesColor).map(([state, color]) => {
                  return (<option key={state} value={state}>{state}</option>)
                })}
              </select>
            </td>
            <td>
              <select id='stateColor' onChange={this.handleInputChange} value={this.state.stateColor}>
                {Object.entries(colorsToHTML).map(([name, color]) => {
                  return (<option key={name} value={name}>{name}</option>)
                })}
              </select>
            </td>
          </tr>
          <tr>
            <td colSpan="2">
              <Checkbox key={this.props.props.id + "metaReload"} id="metaReload" style={{marginLeft: 10, marginTop: 10}} checked={this.state.metaReload} onChange={this.handleInputChange} >
                Zone reload
              </Checkbox>
            </td>
          </tr>
          </React.Fragment>
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
    <input id="minValue" size="4" onChange={props.onSettingsChange} defaultValue={props.options.minValue || 0}/>
    </td>
    </tr>
    <tr>
    <td>
    <label htmlFor="max" style={{marginLeft: 10}}>Maximum</label>
    </td>
    <td>
    <input id="maxValue" size="4" onChange={props.onSettingsChange} defaultValue={props.options.maxValue || 2}/>
    </td>
    </tr>
    <ZoneModeSettings props={props} key={props.id}></ZoneModeSettings>
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
    id: this.id,
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
      var eventID = event.target.id;
      var value = '';
      if (eventID === 'zoneMode' || eventID === 'statesColor') {
        value = event.target.value;
      } else if (eventID === 'metaReload') {
        value = event.target.checked;
      } else {
        value = Number(event.target.value);
      }
      that.options[eventID] = value;
      that.settingsStream.push({[eventID]: value});
      that.instrumentPanel.persist();
      if (eventID === 'metaReload') {
        that.instrumentPanel.setReloadRequired();
      }
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
