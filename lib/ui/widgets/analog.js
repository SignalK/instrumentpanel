var React = require('react');
var d3 = require('d3');
var Bacon = require('baconjs');

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
    <input id="min" size="4" onChange={props.onMinChange}/>
    </td>
    </tr>
    <tr>
    <td>
    <label htmlFor="red" style={{marginLeft: 10}}>Redline</label>
    </td>
    <td>
    <input id="red" size="4" onChange={props.onRedChange}/>
    </td>
    </tr>
    <tr>
    <td>
    <label htmlFor="max" style={{marginLeft: 10}}>Maximum</label>
    </td>
    <td>
    <input id="max" size="4" onChange={props.onMaxChange}/>
    </td>
    </tr>
    </tbody>
    </table>
    </fieldset>
  )

  return (
    <div>
      {props.gaugeTypes.map((gaugeType, i) => {
        return (<span>
        <input type="radio"
               name={gaugeType}
               id={gaugeType}
               checked={props.options.selectedWidget === i}
               onChange={props.onWidgetChange.bind(this, i)} />
        <label htmlFor={gaugeType} style={{marginLeft: 10}}>{gaugeType}</label>
        <br/>
        </span>
      )
      })}
      {props.options.selectedWidget === 0 ? undefined : analogSettings}
    </div>
  )
}


var propulsionPrefix = '^propulsion\.[A-Za-z0-9-]*\.';
var pathsCovered = [
  "navigation.speedOverGround",
  propulsionPrefix + "engineTemperature$",
  propulsionPrefix + 'oilTemperature',
  propulsionPrefix + 'oilPressure',
  propulsionPrefix + 'transmissionOilPressure',
  propulsionPrefix + 'rpm'
];

var config = {
  engineTemperature : {
    redLine: 90,
    max: 110
  },
  oilTemperature : {
    redLine: 200,
    max: 250
  },
  oilPressure : {
    redLine: 90,
    max: 110
  },
  transmissionOilPressure : {
    redLine: 240,
    max: 260
  },
  rpm : {
    redLine: 2500,
    max: 3000
  }
}

var analogComponent = require('./analogcomponent');
var digitalComponent = require('./digitalcomponent');

var BaseWidget = require('./basewidget');
require('util').inherits(Widget, BaseWidget);

function Widget(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options = options;
  this.options.selectedWidget = this.options.selectedWidget || 1;
  this.maxValueStream = new Bacon.Bus();
  this.minValueStream = new Bacon.Bus();
  this.redLineStream = new Bacon.Bus();
  var pathParts = options.path.split('.');
  this.widgets = [React.createElement(digitalComponent,{
    key: id,
    unit: this.getUnitForPath(options.path) || "",
    valueStream: streamBundle.getStreamForSourcePath(options.sourceId, options.path),
    label: options.path,
    path: options.path,
    sourceId: options.sourceId,
  }),React.createElement(analogComponent,{
    key: id,
    unit: this.getUnitForPath(options.path) || "",
    valueStream: streamBundle.getStreamForSourcePath(options.sourceId, options.path),
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
  this.maxValueStream.push(options.maxValue || 2);
  this.minValueStream.push(options.minValue || 0);
  this.redLineStream.push(options.redLine || 2);
}

Widget.prototype.getReactElement = function() {
  return this.widgets[this.options.selectedWidget];
}

Widget.prototype.getSettingsElement = function() {
  var that = this;
  return SettingsPanel({
    gaugeTypes: ["Digital", "Analog"],
    options: this.options,
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
    }
  });
}

Widget.prototype.getType = function() {
  return "analog";
}

Widget.prototype.getOptions = function() {
  return this.options;
}


module.exports = {
  constructor: Widget,
  type: "analog",
  paths: pathsCovered
}
