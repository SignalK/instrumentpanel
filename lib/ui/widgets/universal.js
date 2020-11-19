import React from 'react';
import Bacon from 'baconjs';
import util from 'util';
import { Checkbox, Dropdown, MenuItem } from 'react-bootstrap';

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
      statesColor: (
        typeof props.props.options.statesColor === 'object' &&
        props.props.options.statesColor !== null
      ) ? props.props.options.statesColor : defaultStatesColor,
      redLine: props.props.options.redLine || 1.5
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSelectColor = this.handleSelectColor.bind(this);
  }

  handleSelectColor(eventKey, event) {
    var stateValue = eventKey.split('-');
    var newStatesColor = this.state.statesColor;
    newStatesColor[stateValue[0]] = stateValue[1];
    this.setState({
      statesColor: newStatesColor
    })
    this.props.props.onSettingsChange(
      {target: {
        id: 'statesColor',
        value: newStatesColor
      }}
    );
  }

  handleInputChange(event) {
    var eventID = event.target.id;
    this.setState({
      [eventID]: event.target.value
    }, this.props.props.onSettingsChange(event));
  }

  render() {
    var that = this;
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
            <td className="zoneLevelColor">Level:&nbsp;&nbsp;Color</td>
            <td className="zoneLowerUpperTitle"><div className="zoneValueLowerUpper">Lower</div><div className="zoneValueLowerUpper">Upper</div></td>
          </tr>
          {(!Array.isArray(this.props.props.options.zones)) ? <tr><td>No Zone</td></tr> :
            this.props.props.options.zones.map((zone,i) => {
              var currentColor = that.state.statesColor[zone.state];
              return (
                <tr key={i}>
                  <td className="zoneLevelColor">
                    <div className="zoneLevel">{zone.state + ':'}</div>
                    <Dropdown id={zone.state + '-' + that.props.props.id} onSelect={this.handleSelectColor}>
                      <Dropdown.Toggle>
                        <div className="colorBox" style={{backgroundColor: colorsToHTML[currentColor]}}></div>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {Object.entries(colorsToHTML).map(([name, color]) => {
                          return (
                            <MenuItem key={name} eventKey={zone.state + '-' + name} active={(currentColor === name)}>
                              <div className="colorBox" style={{backgroundColor: color}}></div><span>{' ' + name}</span>
                            </MenuItem>
                          )
                        })}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                  <td className="zoneLowerUpper"><div className="zoneValueLowerUpper">{zone.lower||'-\u221e'}</div><div className="zoneValueLowerUpper">{zone.upper||'\u221e'}</div></td>
                </tr>
              )
            })
          }
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
    <input id={"minValue-" + props.id} size="4" onChange={props.onSettingsChange} defaultValue={props.options.minValue || 0}/>
    </td>
    </tr>
    <tr>
    <td>
    <label htmlFor="max" style={{marginLeft: 10}}>Maximum</label>
    </td>
    <td>
    <input id={"maxValue-" + props.id} size="4" onChange={props.onSettingsChange} defaultValue={props.options.maxValue || 2}/>
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
      var eventID = event.target.id.split('-', 1)[0];
      var value = '';
      if (eventID === 'zoneMode' || eventID === 'statesColor') {
        value = event.target.value;
      } else {
        value = Number(event.target.value);
      }
      that.options[eventID] = value;
      that.settingsStream.push({[eventID]: value});
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
