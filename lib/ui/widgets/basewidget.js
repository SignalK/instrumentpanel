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
  var newWidgets  = [];
  widget.widgets.forEach(function(item, index) {
    newWidgets.push( React.cloneElement(item,{
      unit: widget.unit,
      label: widget.label,
      valueStream: valueStream
    }));
  })
  widget.widgets = newWidgets;
  widget.instrumentPanel.pushGridChanges();
}

BaseWidget.prototype.updateFromOnlineMeta = function(widget) {
  widget.updateFromOnlineMeta = 1;
  signalkUnits = new signalkClient(widget.instrumentPanel.host.split(':')[0], widget.instrumentPanel.host.split(':')[1], widget.instrumentPanel.useSSL);
  signalkUnits.apiGet('/vessels/self/' + widget.options.path.replace(/\./g, '/') + '/meta/')
  .then(function (response) {
//    console.log('updateFromOnlineMeta:GET => '+response.status+':'+response.req.url+':'+response.text);
    var meta = JSON.parse(response.text);
    var newUnit = meta.units || '';
    var newLabel = meta.displayName || meta.shortName || meta.longName || '';
    var valueStream = widget.streamBundle.getStreamForSourcePath(widget.options.sourceId, widget.options.path);
    console.log('updateFromOnlineMeta:meta => units:'+newUnit+' label:'+newLabel);
    widget.unit = newUnit;
    if (newUnit !== '') {
      var conversions = getConversionsForUnit(newUnit);
      if (widget.options.convertTo) {
        newUnit = widget.options.convertTo;
      } else if (newUnit === 'rad') {
          widget.unit = newUnit = 'deg';
        }
      if (meta.units !== newUnit) {
        if ((conversions !== undefined) && (conversions[newUnit])) {
            valueStream = valueStream.map(conversions[newUnit]);
        } else {
            console.error("No such conversion:" + meta.units + " => " + newUnit)
            widget.unit = '?';
          }
      }
    } else {
        console.warn('No such units for '+widget.options.path);
        widget.unit = '?';
      }
    widget.label = newLabel || widget.options.path;
    console.log('updateFromOnlineMeta:updateProps => unit:'+widget.unit+':label:'+widget.label+':path:'+widget.options.path);
//    BaseWidget.pushProps(widget, valueStream);


  var newWidgets  = [];
  widget.widgets.forEach(function(item, index) {
    newWidgets.push( React.cloneElement(item,{
      unit: widget.unit,
      label: widget.label,
      valueStream: valueStream
    }));
  })
  widget.widgets = newWidgets;
  widget.instrumentPanel.pushGridChanges();




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
    widget.unit = '?';
//    BaseWidget.pushProps(widget, widget.streamBundle.getStreamForSourcePath(widget.options.sourceId, widget.options.path));


  var newWidgets  = [];
  widget.widgets.forEach(function(item, index) {
    newWidgets.push( React.cloneElement(item,{
      unit: widget.unit,
      label: widget.label,
//      valueStream: valueStream
    }));
  })
  widget.widgets = newWidgets;
  widget.instrumentPanel.pushGridChanges();



    widget.updateFromOnlineSchema = 0;
  });
}

module.exports = BaseWidget;
