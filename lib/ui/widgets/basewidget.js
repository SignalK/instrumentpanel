function BaseWidget() {
  this.active = true;
}

BaseWidget.prototype.setActive = function(value) {
  this.active = value;
  this.instrumentPanel.onWidgetChange(this);
}

module.exports = BaseWidget;
