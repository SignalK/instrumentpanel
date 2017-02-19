var React = require('react');


var SettingsPanel = (props) => {
  return (
    <div>
      <input type="radio"
             name={props.options.key + "rose"}
             id="rose"
             checked={props.options.selectedWidget === 0}
             onChange={props.onChange.bind(this, 0)} />
      <label htmlFor="rose" style={{marginLeft: 10}}>Rose</label>
      <br/>
      <input type="radio"
             name={props.options.key + "reading"}
             id="reading"
             checked={props.options.selectedWidget === 1}
             onChange={props.onChange.bind(this, 1)} />
      <label htmlFor="reading" style={{marginLeft: 10}}>Reading</label>
      <br/>
    </div>
  )
}

var pathsCovered = [
  "navigation.courseOverGroundTrue",
  "navigation.courseOverGroundMagnetic",
];

var readingComponent = require('./compassreadingcomponent');
var roseComponent = require('./compassrosecomponent');

var BaseWidget = require('./basewidget');
require('util').inherits(Compass, BaseWidget);

function Compass(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options = options;
  this.options.initialDimensions = this.options.initialDimensions || {w: 2, h: 4};
  this.widgets = [React.createElement(roseComponent,{
    key: id,
    value: streamBundle.getStreamForSourcePath(options.sourceId, options.path),
    label: this.getLabelForPath(options.path),
    sourceId: options.sourceId
  }),
  this.reading = React.createElement(readingComponent,{
    key: id,
    value: streamBundle.getStreamForSourcePath(options.sourceId, options.path),
    label: this.getLabelForPath(options.path),
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
