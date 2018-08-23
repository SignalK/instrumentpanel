var React = require('react');
var schema = require('@signalk/signalk-schema');
var signalkClient = require('@signalk/client').Client;
var signalkUnits = new signalkClient;

import {getConversionsForUnit} from '../settings/conversions'
/*
for (var key in schema.metadata) {
  schema.metadata[key].regex = new RegExp(key.replace('.', '\.').replace('*', '.*').replace('$', ''));
}
*/
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
  var i18nElement = schema.i18n.en[path];
  return i18nElement ?
    i18nElement.shortName || i18nElement.longName || "??" :
    path
}
/*
BaseWidget.prototype.getUnitForPath = function(path) {
  const schemaUnit = schema.getUnits('vessels.foo.' + path)
  if (schemaUnit === 'rad') {
    return 'deg'
  }
  return schemaUnit
}
*/
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

BaseWidget.prototype.pushProps = function(widget, valueStream) {
  throw new Error('pushProps not implemented');
}

BaseWidget.prototype.updateFromOnlineMeta = function(widget) {
  var valueStream = widget.streamBundle.getStreamForSourcePath(widget.options.sourceId, widget.options.path);
  widget.updateFromOnlineMeta = 1;
//  console.log('module type:'+this.getType());
  signalkUnits = new signalkClient(widget.instrumentPanel.host.split(':')[0], widget.instrumentPanel.host.split(':')[1], widget.instrumentPanel.useSSL);
  signalkUnits.apiGet('/vessels/self/' + widget.options.path.replace(/\./g, '/') + '/meta/')
  .then(function (response) {
//    console.log('updateFromOnlineMeta:GET => '+response.status+':'+response.req.url+':'+response.text);
    var meta = JSON.parse(response.text);
    widget.unit = meta.units || '';
    widget.label = meta.displayName || meta.shortName || meta.longName || widget.options.path;;
    var valueStream = widget.streamBundle.getStreamForSourcePath(widget.options.sourceId, widget.options.path);
//    console.log('updateFromOnlineMeta:meta => units:'+meta.units+' displayName:'+meta.displayName+' shortName:'+meta.shortName+' longName:'+meta.longName);
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
              widget.unit = '?';
            }
        }
    }
//    console.log('updateFromOnlineMeta:updateProps => unit:'+widget.unit+': label:'+widget.label+' path:'+widget.options.path);
    widget.pushProps(widget, valueStream);
    widget.updateFromOnlineMeta = 0;
  })
  .catch(function (error) {
    var message;
    if (error.status) {
      message = 'No such meta for '+widget.options.path;
    } else {
        message = 'updateFromOnlineMeta:'+error.message;
      }
    console.warn(message);
    widget.label = widget.options.path;
    widget.unit = 'X';
    widget.pushProps(widget, valueStream);
    widget.updateFromOnlineSchema = 0;
  });
}

module.exports = BaseWidget;
