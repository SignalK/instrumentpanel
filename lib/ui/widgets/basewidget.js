var React = require('react');
var schema = require('signalk-schema');


for (var key in schema.metadata) {
  schema.metadata[key].regex = new RegExp(key.replace('.', '\.').replace('*', '.*').replace('$', ''));
}

function BaseWidget(id, options, streamBundle, instrumentPanel) {
  this.id = id;
  this.options = options;
  this.streamBundle = streamBundle;
  this.instrumentPanel = instrumentPanel;
}

BaseWidget.prototype.getInitialDimensions = function() {
  return {w: 2, h: 2};
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
  var i18nElement = schema.i18n.en[path];
  return i18nElement ?
    i18nElement.shortName || i18nElement.longName || "??" :
    path
}

BaseWidget.prototype.getUnitForPath = function(path) {
  for (var key in schema.metadata) {
    if (schema.metadata[key].regex.test(path)) {
      return schema.metadata[key].units === 'rad' ? 'deg' : schema.metadata[key].units;
    }
  }
  return undefined
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

module.exports = BaseWidget;
