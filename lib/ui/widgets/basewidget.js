var schema = require('signalk-schema');

function BaseWidget(id, options, streamBundle, instrumentPanel) {
  this.instrumentPanel = instrumentPanel;
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
  var i18nElement = schema.i18n.en[path];
  return i18nElement ? i18nElement.unit : undefined;
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

module.exports = BaseWidget;
