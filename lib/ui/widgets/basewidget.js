import React from 'react';

import { getConversion } from '../settings/conversions'

var labelForPath = {
  'navigation.courseOverGroundTrue' : 'COG(t)',
  'navigation.courseOverGroundMagnetic' : 'COG(m)',
  'navigation.headingMagnetic' : 'Heading Magnetic',
  'navigation.headingTrue' : 'Heading True',
  'environment.wind.angleApparent' : 'Angle Apparent',
  'environment.wind.angleTrue' : 'Angle True',
  'environment.wind.speedApparent' : 'AWS',
  'environment.wind.speedTrue' : 'Speed True',
  'environment.wind.directionMagnetic' : 'Wind Dir Mag',
  'environment.wind.directionTrue' : 'TWD'
};

export default function BaseWidget(id, options, streamBundle, instrumentPanel) {
  this.id = id;
  this.options = options;
  if (typeof this.options.unit === 'undefined') this.options.unit = '';
/*
 As a reminder:
 options.convertTo = undefined <= getPreferredUnit not applied
 options.convertTo = '' <= getPreferredUnit applied and with no convert value
 options.convertTo != '' <= getPreferredUnit or the user choice applied
*/
  this.streamBundle = streamBundle;
  this.instrumentPanel = instrumentPanel;
  this.setInitialLayout();
  this.toolTipsVisible = false;
  this.toolTips = this.toolTips.bind(this);
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

BaseWidget.prototype.getType = function() {
  throw new Error('getType not implemented');
}

BaseWidget.prototype.getOptions = function() {
  return this.options;
}

BaseWidget.prototype.handleNewSource = function(newSource) {
  return this.options.key === newSource.key;
}

BaseWidget.prototype.setActive = function(value) {
  this.options.active = value;
  this.instrumentPanel.onWidgetChange(this);
}

BaseWidget.prototype.getLabelForPath = function(path) {
  var i18nElement = labelForPath[path];
  return i18nElement || path;
}

BaseWidget.prototype.displayValue = function(value) {
  if(typeof value === 'number') {
    var v = Math.abs(value);
    if(v >= 50) {
      return value.toFixed(0);
    } else if(v >= 10) {
      return value.toFixed(1);
    } else {
      return value.toFixed(2);
    }
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

BaseWidget.prototype.updateStream = function(widget, valueStream) {
  throw new Error('updateStream not implemented');
}

BaseWidget.prototype.updateUnitData = function(widget, updateOptions = {setUnit: true, setStream: true, setLabel: true}) {
  const orgOptions = JSON.stringify(widget.options);
  if (typeof updateOptions.setUnit === 'undefined') {updateOptions.setUnit = true}
  if (typeof updateOptions.setStream === 'undefined') {updateOptions.setStream = true}
  if (typeof updateOptions.setLabel === 'undefined') {updateOptions.setLabel = true}

  if (!widget.instrumentPanel.flushCache) {
    if ((typeof widget.options.label !== 'undefined')&&(typeof widget.options.unit !== 'undefined')) {
      widget.instrumentPanel.schemadata.addMetaInCache(widget.options.path, {'displayName': widget.options.label, 'units': widget.options.unit})
    }
  }
  widget.instrumentPanel.schemadata.getMetaForVesselPath(widget.options.path, widget.options.metaReload)
  .then(meta => {
/*
Retained to maintain compatibility with previous versions.
The automatic conversion'rad' => 'deg' is now done by convertTo = 'deg'
*/
    meta.units = (meta.units === 'deg')?'rad':meta.units || '';
// end compatibility with previous versions.

    if (updateOptions.setLabel !== false) {
      widget.options.label = meta.displayName || meta.shortName || meta.longName || widget.getLabelForPath(widget.options.path);
    }

    if (updateOptions.setUnit !== false) {
      widget.options.unit = meta.units || '';
    }

    var valueStream = widget.streamBundle.getStreamForSourcePath(widget.options.sourceId, widget.options.path);

    if ((widget.options.unit !== '') && (updateOptions.setUnit !== false) && (updateOptions.setStream !== false) ) {
      if (widget.options.unit === 'rad') {
        widget.options.convertTo = 'deg';
      } else if (typeof widget.options.convertTo === 'undefined') {
          widget.options.convertTo = widget.instrumentPanel.getPreferredUnit(widget.options.unit);
        }
      if (widget.options.convertTo) {
        const conversion = getConversion(widget.options.unit, widget.options.convertTo);
        if (typeof conversion === 'function') {
          valueStream = valueStream.map(conversion);
        } else {
            console.error("No such conversion:" + widget.options.unit + " => " + widget.options.convertTo);
            widget.options.convertTo = '';
          }
      }
    }

    if (Array.isArray(meta.zones)) {
      widget.options.zones = meta.zones;
    }

    if (typeof meta.displayScale === 'object') {
      widget.options.minValue = meta.displayScale.lower;
      widget.options.maxValue = meta.displayScale.upper;
    }

    if (widget.options.metaReload === true) {
      widget.options.metaReload = false;
    }

    if (orgOptions !== JSON.stringify(widget.options)) {
      widget.instrumentPanel.persist();
    }
    widget.updateStream(widget, valueStream);
    const widgetPageId = parseInt(widget.id.split('-', 1)[0], 10);
    if ((widget.instrumentPanel.currentPage === widgetPageId) && (widget.options.active)) {
      widget.instrumentPanel.pushGridChanges();
    }
  }, err => {
    console.log(err);
    widget.options.label = 'ERROR in unit retrieval';
    var valueStream = widget.streamBundle.getStreamForSourcePath(widget.options.sourceId, widget.options.path);
    widget.updateStream(widget, valueStream);
  })
}

BaseWidget.prototype.toolTips = function(toggleVisible) {
  if (toggleVisible) {
    this.toolTipsVisible = !this.toolTipsVisible;
  }
  return this.toolTipsVisible;
}
