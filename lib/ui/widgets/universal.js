import React from 'react';
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
      options: props.options,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSelectColor = this.handleSelectColor.bind(this);
  }

  handleSelectColor(eventKey, event) {
    var stateValue = eventKey.split('-');
    var newStatesColor = this.state.options.statesColor;
    newStatesColor[stateValue[0]] = stateValue[1];
    var options = this.state.options;
    options.statesColor = newStatesColor;
    options = this.props.onSettingsChange(
      {target: {
        id: 'statesColor',
        value: newStatesColor
      }}
    );
    this.setState({options})
  }

  handleInputChange(event) {
    var options = this.props.onSettingsChange(event);
    this.setState({options});
  }

  render() {
    var that = this;
    return (
      <React.Fragment>
        <tr><td colSpan="2"><label style={{marginLeft: 10, marginTop: 10}}>Retrieve color zones</label></td></tr>
        <tr>
          <td><label style={{marginLeft: 10}}>from:</label></td>
          <td>
            <select id="zoneMode" onChange={this.handleInputChange} value={this.state.options.zoneMode}>
              <option key="local" value="local">local</option>
              <option key="server" value="server">server</option>
            </select>
          </td>
        </tr>

      {(this.state.options.zoneMode === "local") ?
        <tr>
          <td><label htmlFor="redLine" style={{marginLeft: 10, marginTop: 10}}>Redline</label></td>
          <td><input id="redLine" size="4" onChange={this.handleInputChange} defaultValue={this.state.options.redLine}/></td>
        </tr>
        : // zone from server
          <React.Fragment>
          <tr>
            <td className="zoneLevelColor">Level:&nbsp;&nbsp;Color</td>
            <td className="zoneLowerUpperTitle"><div className="zoneValueLowerUpper">Lower</div><div className="zoneValueLowerUpper">Upper</div></td>
          </tr>
          {(this.state.options.zones.length === 0) ? <tr><td>No Zone</td></tr> :
            Array.isArray(this.state.options.zones) && this.state.options.zones.map((zone,i) => {
              var currentColor = that.state.options.statesColor[zone.state];
              return (
                <tr key={i}>
                  <td className="zoneLevelColor">
                    <div className="zoneLevel">{zone.state + ':'}</div>
                    <Dropdown id={zone.state + '-' + that.props.id} onSelect={this.handleSelectColor}>
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
    <ZoneModeSettings options={props.options} id={props.id} onSettingsChange={props.onSettingsChange} key={props.id}></ZoneModeSettings>
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
  if (!options.unit) options.unit = '';
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options.selectedWidget = this.options.selectedWidget || 0;
  this.widgets = [];
  this.widgets = [React.createElement(DigitalComponent,{
    key: id,
    instrumentPanel: this.instrumentPanel,
    valueStream: this.valueStream,
    optionsBundle: this.optionsBundle,
  }),React.createElement(AnalogComponent,{
    key: id,
    instrumentPanel: this.instrumentPanel,
    valueStream: this.valueStream,
    optionsBundle: this.optionsBundle,
  })];
}

util.inherits(Widget, BaseWidget);

Widget.prototype.getReactElement = function() {
  return this.widgets[this.options.selectedWidget];
}

Widget.prototype.getSettingsElement = function(pushCellChange) {
  var that = this;
  return SettingsPanel({
    gaugeTypes: ["Digital", "Analog"],
    options: this.options,
    id: this.id,
    onWidgetChange: function(value) {
      that.options.selectedWidget = value;
      that.options = that.validateOptions(that.options);
      that.optionsBundle.setOptions(that.options);
      pushCellChange();
      that.instrumentPanel.pushGridChanges();
    },
    onUnitChange: function(event) {
      that.options.convertTo = event.target.value === that.options.unit ? '' : event.target.value;
      that.optionsBundle.setOptions(that.options);
      pushCellChange();
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
      that.options = that.validateOptions(that.options);
      that.optionsBundle.setOptions(that.options);
      return that.options
    }
  });
}

Widget.prototype.validateOptions = function(options) {
  if(options.selectedWidget === 1) { // AnalogComponent
    if(options.zoneMode === 'server'){
      options.statesColor = ( typeof options.statesColor === 'object' &&
        options.statesColor !== null) ? options.statesColor : defaultStatesColor;
      if(!Array.isArray(options.zones)) options.zones = [];
      options.zones = options.zones.map(zone => {
        if(zone.upper && typeof zone.upper !== 'number') zone.upper = undefined;
        if(zone.lower && typeof zone.lower !== 'number') zone.lower = undefined;
        if(zone.min   && typeof zone.min   !== 'number') zone.min   = undefined;
        if(zone.max   && typeof zone.max   !== 'number') zone.max   = undefined;
        return zone;
      });
    } else {
      options.zoneMode = 'local';
      if(!options.minValue) options.minValue = 0;
      if(!options.maxValue) options.maxValue = 2;
      if(!options.redLine ) options.redLine  = 1.5;
    }
  } else { // DigitalComponent
    
  }
  return options;
}

Widget.prototype.getType = function() {
  return "universal";
}

export default {
  constructor: Widget,
  type: "universal",
  paths: []
}
