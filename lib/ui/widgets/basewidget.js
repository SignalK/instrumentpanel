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
    "?"
}

BaseWidget.prototype.getUnitForPath = function(path) {
  var i18nElement = schema.i18n.en[path];
  return i18nElement ? i18nElement.unit : undefined;
}

module.exports = BaseWidget;
