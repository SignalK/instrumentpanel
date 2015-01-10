module.exports = InstrumentPanel;

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

var widgetMap = {};
//Have to use explicit require's for browserify
[
  require('app/widgets/compass'),
  require('app/widgets/digital'),
  require('app/widgets/leafletmap'),
  require('app/widgets/windmeter')
].forEach(function(widget) {
  widgetMap[widget.type] = widget
});

function InstrumentPanel(dimensions, streamBundle) {
  this.dimensions = dimensions;
  this.streamBundle = streamBundle;
  this.widgetsById = {};
  this.pathsCovered = {};
}

require('util').inherits(InstrumentPanel, EventEmitter);


InstrumentPanel.prototype.dragStop = function(e, ui, $widget) {
  console.log('dragstop')
}

InstrumentPanel.prototype.yCellsToPixels = function(ySize) {
  return ySize * this.dimensions.cellHeight + (ySize <= 1 ? 0 : (ySize - 1) * this.dimensions.yMargin * 2);
}
InstrumentPanel.prototype.xCellsToPixels = function(xSize) {
  return xSize * this.dimensions.cellWidth + (xSize <= 1 ? 0 : (xSize - 1) * this.dimensions.xMargin * 2);
}

InstrumentPanel.prototype.resizeStop = function(e, ui, $widget) {
  $widget.children('div').height(this.yCellsToPixels($widget.attr('data-sizey')));
  var widget = this.widgetsById[$widget.attr('id')];
  if (widget && typeof widget.resize === 'function') {
    widget.resize(this.xCellsToPixels($widget.attr('data-sizex')), this.yCellsToPixels($widget.attr('data-sizey')))
  }
}

InstrumentPanel.prototype.setGridster = function(gridster) {
  this.gridster = gridster;
}

InstrumentPanel.prototype.lock = function() {
  this.emit('lock');
  this.gridster.disable();
  this.gridster.resize_api.disable();
}

InstrumentPanel.prototype.unlock = function() {
  this.gridster.enable();
  this.gridster.resize_api.enable();
  this.emit('unlock');
}

InstrumentPanel.prototype.pushPath = function(path) {
  if (!this.pathsCovered[path]) {
    this.setWidgetData.call(this, {
      widgetOptions: [{
        "id": "i" + new Date().getTime(),
        "type": "digital",
        "options": {
          "path": path
        },
        "col": 1,
        "row": 1,
        "size_x": 2,
        "size_y": 2
      }]
    });
  }
}

InstrumentPanel.prototype.setWidgetData = function(widgetData) {
  var panel = this;
  widgetData.widgetOptions.forEach(function(widgetOptionsData) {
    panel.gridster.add_widget('<li id="' + widgetOptionsData.id + '"></li>',
      widgetOptionsData.size_x,
      widgetOptionsData.size_y,
      widgetOptionsData.col,
      widgetOptionsData.row);
    createAndConnectWidget.call(panel, widgetOptionsData);
  });
  panel.gridster.$widgets.each(function(i, widget) {
    panel.resizeStop.call(panel, null, null, $(this))
  });
}

InstrumentPanel.prototype.gridsterSerialize = function($w, wgd) {
  return {
    id: $w.attr('id'),
    col: wgd.col,
    row: wgd.row,
    size_x: wgd.size_x,
    size_y: wgd.size_y
  }
};

InstrumentPanel.prototype.serialize = function() {
  var that = this;
  var widgets = this.gridster.serialize();
  widgets.forEach(function(item) {
    var widget = that.widgetsById[item.id];
    item.type = widget.getType();
    item.options = widget.getOptions();
  });
  return widgets;
}

function createAndConnectWidget(widgetData) {
  //  try {
  var that = this;
  var widget = new widgetMap[widgetData.type].constructor(widgetData.id, widgetData, streamBundle, this);
  this.widgetsById[widgetData.id] = widget;
  widget.pathsCovered().forEach(function(path) {
      that.pathsCovered[path] = true;
    })
    //  } catch (ex) {
    //    console.error(ex);
    //    console.error("Could not create widget with data:" + JSON.stringify(widgetData, null, 2));
    //  }
}