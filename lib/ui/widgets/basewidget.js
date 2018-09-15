var React = require('react');

import {getConversionsForUnit} from '../settings/conversions'

var labelForPath = {
  'navigation.courseOverGroundTrue' : 'COG(t)',
  'navigation.courseOverGroundMagnetic' : 'COG(m)',
  'navigation.headingMagnetic' : 'Heading Magnetic',
  'navigation.headingTrue' : 'Heading True',
  'environment.wind.angleApparent' : 'Angle Apparent',
  'environment.wind.angleTrue' : 'Angle True',
  'environment.wind.speedApparent' : 'AWS',
  'environment.wind.speedTrue' : 'Speed True'
};

function BaseWidget(id, options, streamBundle, instrumentPanel) {
  this.id = id;
  this.options = options;
  this.streamBundle = streamBundle;
  this.instrumentPanel = instrumentPanel;
}

BaseWidget.prototype.getInitialDimensions = function() {
  return {h: 2};
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
  throw new Error('getOptions not implemented');
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

BaseWidget.prototype.updateUnitData = function(widget) {
  if (!widget.instrumentPanel.flushCache) {
    if ((widget.options.label !== undefined)&&(widget.options.unit !== undefined)) {
      widget.instrumentPanel.schemadata.addMetaInCache(widget.options.path, {'displayName': widget.options.label, 'units': widget.options.unit})
    }
  }
  widget.instrumentPanel.schemadata.getMetaForVesselPath(widget.options.path)
  .then(meta => {
    widget.unit = meta.units || '';
    widget.label = meta.displayName || meta.shortName || meta.longName || widget.getLabelForPath(widget.options.path);
    var valueStream = widget.streamBundle.getStreamForSourcePath(widget.options.sourceId, widget.options.path);
    if (widget.unit !== '') {
      var conversions = getConversionsForUnit(widget.unit);
      if (widget.unit === 'rad') {
        widget.unit = 'deg';
        valueStream = valueStream.map(conversions[widget.unit]);
      } else if (widget.options.convertTo) {
          if ((conversions !== undefined) && (conversions[widget.options.convertTo])) {
            valueStream = valueStream.map(conversions[widget.options.convertTo]);
          } else {
              console.error("No such conversion:" + widget.unit + " => " + widget.options.convertTo)
              widget.unit = '';
            }
        }
    }
    widget.options.unit = (widget.unit === 'deg')?'rad':widget.unit;
    widget.options.label = widget.label;
    widget.instrumentPanel.persist();
    widget.updateStream(widget, valueStream);
  })
}

module.exports = BaseWidget;
