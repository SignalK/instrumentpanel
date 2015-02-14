function BaseWidget(id, options, streamBundle, instrumentPanel) {
  this.instrumentPanel = instrumentPanel;
}

BaseWidget.prototype.setActive = function(value) {
  this.options.active = value;
  this.instrumentPanel.onWidgetChange(this);
}

module.exports = BaseWidget;
