import React from 'react';
import {Bus} from 'baconjs';

import { unitChoice, getConversion } from '../settings/conversions'

export default function BaseWidget(id, options, streamBundle, instrumentPanel) {
  this.id = id;
  this.options = options;

  (!this.options.label) && (this.options.label = this.options.path)
  this.streamBundle = streamBundle;
  this.instrumentPanel = instrumentPanel;
  this.setInitialLayout();
  this.toolTipsVisible = false;
  this.toolTips = this.toolTips.bind(this);
  this.valueStream = this.streamBundle.getValueStreamForSourcePath(options.sourceId, options.path);
  this.busOptions = new Bus();
  this.optionsBundle = {
    getOptions: this.getOptions.bind(this),
    setOptions: this.setOptions.bind(this),
    optionsStream: this.busOptions.withLatestFrom(this.valueStream, (options, value) => {
      return [options, value]
    }).toProperty(),
    getConversionForOptions: this.getConversionForOptions.bind(this),
    getFinalUnit: (options) =>{return (options.convertTo !== "") ? options.convertTo : options.unit;},
    validateOptions: this.validateOptions
  }

  this.streamBundle.metasStream.filter(pathMeta => {
    return pathMeta.path === this.options.path;
  }).onValue( (pathMeta) => {
    this.optionsBundle.setOptions(this.metaToOptions(pathMeta))
  })
  instrumentPanel.schemadata.getMetaForVesselPath(this.options.path, instrumentPanel.isMetaUpdateInWS())
    .then(meta => {
      this.streamBundle.metasStream.push({path: this.options.path, value: meta});
  })
}

BaseWidget.prototype.getInitialDimensions = function() {
  return {h: 2};
}

BaseWidget.prototype.getInitialLayout = function() {
  if (typeof this.initialLayout === 'undefined') {
    this.setInitialLayout();
  }
  return this.initialLayout
}

BaseWidget.prototype.setInitialLayout = function(layout) {
  if (typeof layout === 'undefined') {
    if (typeof this.initialLayout === 'undefined') {
      var initialDimensions = this.getInitialDimensions();
      if (typeof initialDimensions.w === 'undefined') {
        initialDimensions.w = 2;
      }
      layout = {
        "w": initialDimensions.w,
        "h": initialDimensions.h,
        "x": this.instrumentPanel.getColumnforPath(this.options.path) * 2,
        "y": Infinity,
        "i": this.id
       };
    }
  }
  this.initialLayout = layout;
}

BaseWidget.prototype.getReactElement = function() {
  throw new Error('getReactElement not implemented');
}

BaseWidget.prototype.getSettingsElement = function() {
  return (<div/>)
}

const settingsPanelUnitOnly = (props) => {
  return (
    <div>
      {props.options.unit != '' ? unitChoice(props.options.unit, props.onUnitChange, props.options.convertTo) : undefined}
    </div>
  )
}

BaseWidget.prototype.getSettingsElementUnitOnly = function(pushCellChange) {
  var that = this;
  return settingsPanelUnitOnly({
    options: this.options,
    onUnitChange: function(event) {
      that.options.convertTo = event.target.value === that.options.unit ? '' : event.target.value;
      that.optionsBundle.setOptions(that.options);
      pushCellChange();
    }
  });
}

BaseWidget.prototype.getType = function() {
  throw new Error('getType not implemented');
}

BaseWidget.prototype.getOptions = function() {
  return this.options;
}

BaseWidget.prototype.setOptions = function(options) {
  if (options !== null) {
    this.options = {...this.options,...options};
/*
 options.convertTo === undefined <= getPreferredUnit not applied
 options.convertTo === '' <= getPreferredUnit applied and with no convert value
 options.convertTo !== '' <= getPreferredUnit or the user choice applied
*/
    if (this.options.unit && this.options.unit !== '') {
//Retained to maintain compatibility with very old versions.
//The automatic conversion'rad' => 'deg' is now done by convertTo = 'deg'
      if(this.options.unit === 'deg') this.options.unit = 'rad';
// end compatibility with previous versions.

      if(this.options.unit === 'rad') this.options.convertTo = 'deg';
      if(typeof this.options.convertTo === 'undefined') {
        this.options.convertTo = this.instrumentPanel.getPreferredUnit(this.options.unit);
      }
    }
    this.options = this.validateOptions(this.options);
    this.instrumentPanel.persist();
  }
  this.busOptions.push(this.options);
}

BaseWidget.prototype.handleNewSource = function(newSource) {
  return this.options.key === newSource.key;
}

BaseWidget.prototype.setActive = function(value) {
  this.options.active = value;
  this.instrumentPanel.onWidgetChange(this);
}

BaseWidget.prototype.setDelete = function(value) {
  this.options.delete = value;
  this.instrumentPanel.onWidgetChange(this);
}

BaseWidget.prototype.defaultPostConversion = function (value) {
  if(typeof value === 'number') {
    if (isNaN(value)) return '-';
    var v = Math.abs(value);
    if(v >= 50) {
      return value.toFixed(0);
    } else if(v >= 10) {
      return value.toFixed(1);
    } else {
      return value.toFixed(2);
    }
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  if (value === '' || typeof value === 'undefined' || value === null) {
    return '-'
  }

  return value;
}

BaseWidget.prototype.getHandledSources = function() {
  return [{
    path: this.options.path,
    key: this.options.key,
    sourceId: this.options.sourceId
  }];
}

BaseWidget.prototype.getConversionForOptions = function() {
  if (this.options.unit && this.options.unit !== '' && this.options.convertTo) {
    const conversion = getConversion(this.options.unit, this.options.convertTo);
    if(typeof conversion === 'function') {
      return conversion;
    } else {
      console.error("No such conversion for " + this.options.unit + " to " + this.options.convertTo);
    }
  }
  return null;
}

BaseWidget.prototype.toolTips = function(toggleVisible) {
  if (toggleVisible) {
    this.toolTipsVisible = !this.toolTipsVisible;
  }
  return this.toolTipsVisible;
}

BaseWidget.prototype.metaToOptions = function(pathMeta) {
  let options = {}
  pathMeta.value.units && (options.unit = pathMeta.value.units);
  let label = pathMeta.value.displayName || pathMeta.value.shortName || pathMeta.value.longName || pathMeta.path;
  label && (options.label = label);
  if (Array.isArray(pathMeta.value.zones)) {
    options.zones = pathMeta.value.zones;
  }
  if (typeof pathMeta.value.displayScale === 'object') {
    options.minValue = pathMeta.value.displayScale.lower;
    options.maxValue = pathMeta.value.displayScale.upper;
  }
  return options;
}

BaseWidget.prototype.validateOptions = function(options) {
 return options;
}

export function defaultComponentDidMount(component, preConversion, postConversion) {
  component.conversion = component.props.optionsBundle.getConversionForOptions();

  if (component.unsubscribes) {
    component.unsubscribes.forEach((unsubscribe => {
      unsubscribe()
    }));
  }

  function fullConversion(value) {
    if (typeof preConversion === 'function') {
      value = preConversion(value);
    }
    if ((typeof value === "number") && (component.conversion)) {
      value = component.conversion(value);
    }
    if (typeof postConversion === 'function') {
      value = postConversion(value);
    }
    return value;
  }

  component.unsubscribes = [];
  component.unsubscribes.push(
    component.props.valueStream.onValue(
      (value => {
        component.setState({
          value: fullConversion(value)
        });
      }).bind(component)
    )
  );

  component.props.optionsBundle.optionsStream && component.unsubscribes.push(
    component.props.optionsBundle.optionsStream.onValue(
      ( ([options,value]) => {
        component.conversion = component.props.optionsBundle.getConversionForOptions();
        (component.onOptionsUpdate) && component.onOptionsUpdate(options)
        component.setState({
          value: fullConversion(value)
        });
      }).bind(component)
    )
  );
// force refresh unit & conversion when optionsStream really listen
  setTimeout(() => {component.props.optionsBundle.setOptions(null);}, 1000);
}

export function defaultComponentWillUnmount(component) {
  component.unsubscribes.forEach((unsubscribe => {
    unsubscribe()
  }));
}
