import BaconModel from 'bacon.model';
import browser from '../util/browser';
import SignalKSchemaData from '../util/signalkschemadata';

var widgetModulesByType = {};
var widgetModulesByPath = {};

//Have to use explicit require's for browserify
var widgetModules = [
  require('./widgets/universal'),
  require('./widgets/compass'),
  require('./widgets/windmeter'),
  require('./widgets/digitalposition'),
  require('./widgets/digitaldatetime'),
  require('./widgets/attitude')
];

widgetModules.forEach(function(widget) {
  widgetModulesByType[widget.type] = widget;
});

function widgetModuleFor(path) {
  return widgetModules.find(function(widgetModule) {
    return widgetModule.paths.some(function(widgetPath) {
      return new RegExp('^' + widgetPath + '$').test(path);
    })
  });
}

function newPage() {
  return {
    layout: [],
    widgets: [],
    knownKeys: {}
  }
}

export default function InstrumentPanel(streamBundle) {
  this.flushCache = false;
  this.streamBundle = streamBundle;
  this.currentPage = 0;
  this.pages = [newPage()]
  this.gridSettingsModel = new BaconModel.Model("");
  this.pushGridChanges();
  var isUnkownKey = function(key) {
    return typeof this.getCurrentPage().knownKeys[key] === 'undefined';
  }.bind(this)
  this.streamBundle.allSources.filter(isUnkownKey).onValue(this.handlePossiblyNewSource.bind(this));
}

InstrumentPanel.prototype.setPage = function(page) {
  if (page > this.pages.length || page < 0) {
    console.error("No such page:" + page);
  }
  if (page === this.pages.length && page < 10) {
    this.pages[page] = newPage();
    this.populateNewPage(page);
  }
  this.currentPage = page;
  this.pushGridChanges();
}

InstrumentPanel.prototype.populateNewPage = function(page) {
  var that = this;
  const newPage = page;
  this.pages.forEach(function(page) { // scan all pages to find existing widget
    page.widgets.forEach(function(existingWidget) {
      const foundKey = that.pages[newPage].widgets.find( widgetOnNewPage =>
        existingWidget.options.key === widgetOnNewPage.options.key
      );
      if (! foundKey) {
        var module = widgetModuleFor(existingWidget.options.path) || widgetModules[0];
        var newOptions = Object.assign({}, existingWidget.options);
        newOptions.active = true;
        var newWidget = new module.constructor(that.pages[newPage].widgets.length,
          newOptions, that.streamBundle, that);
        that.pages[newPage].widgets.push(newWidget);
      }
    });
  });
}

InstrumentPanel.prototype.deleteCurrentPage = function() {
  //TODO implement unsubscribe
  this.pages.splice(this.currentPage, 1);
  this.currentPage = Math.min(this.currentPage, this.pages.length-1);
  this.persist();
  this.pushGridChanges();
}

InstrumentPanel.prototype.getCurrentPage = function() {
  return this.pages[this.currentPage];
}

InstrumentPanel.prototype.getLayout = function() {
  return this.pages[this.currentPage].layout;
}

InstrumentPanel.prototype.getWidgets = function() {
  return this.pages[this.currentPage].widgets;
}

InstrumentPanel.prototype.pushGridChanges = function() {
  this.gridSettingsModel.set({
    layout: this.getLayout(),
    activeWidgets: this.getActiveWidgets(),
    serializable: this.serializableSettings()
  });
}

InstrumentPanel.prototype.dispatch = function(delta) {
  this.streamBundle.handleDelta(delta);
}

InstrumentPanel.prototype.handlePossiblyNewSource = function(newSource) {
  var handled = this.getWidgets().reduce(function(previous, widget) {
    return widget.handleNewSource.call(widget, newSource) || previous
  }, false);
  if (!handled) {
    var module = widgetModuleFor(newSource.path) || widgetModules[0];
    var widget = new module.constructor(this.getWidgets().length, {
      sourceId: newSource.sourceId,
      key: newSource.key,
      path: newSource.path,
      active: true
    }, this.streamBundle, this);
    this.getWidgets().push(widget);
    this.pushGridChanges();
  }
}

InstrumentPanel.prototype.serializableSettings = function() {
  return {
    pages: this.pages.map(function(page) {
      return {
        layout: page.layout,
        widgets: page.widgets.map(function(widget) {
          return {
            type: widget.getType(),
            options: widget.getOptions()
          }
        }),
        knownKeys: page.knownKeys
      }
    })
  }
}

InstrumentPanel.prototype.setWidgetData = function(widgetData) {
  var that = this;
  if (widgetData && widgetData.pages) {
    this.pages = widgetData.pages.map(function(page) {
      return {
        layout: page.layout,
        widgets: page.widgets.map(that.deserializeWidget.bind(that)),
        knownKeys: page.knownKeys
      }
    });
    this.currentPage = 0;
    this.pushGridChanges();
  }
}

InstrumentPanel.prototype.deserializeWidget = function(oneWidgetData, i) {
  var module = widgetModulesByType[oneWidgetData.type];
  var updatedModule = widgetModuleFor(oneWidgetData.options.path) || widgetModules[0];
  if (oneWidgetData.type !== updatedModule.type) {
    console.warn("Module type:'" + oneWidgetData.type + "' is outdated, module type :'" +
      updatedModule.type + "' will be used instead");
    console.warn("widget details:" + JSON.stringify(oneWidgetData));
    module = updatedModule;
  }
  if (typeof oneWidgetData.options === 'undefined') {
    oneWidgetData.options = {};
  }
  if (typeof oneWidgetData.options.active === 'undefined') {
    oneWidgetData.options.active = true;
  }
  if (typeof oneWidgetData.options.path === 'undefined') {
    oneWidgetData.options.path = 'error';
  }
  var widget = new module.constructor(i, oneWidgetData.options, this.streamBundle, this);
  return widget;
}


InstrumentPanel.prototype.onLayoutChange = function(layout) {
  this.getCurrentPage().layout = layout;
  this.persist();
}

InstrumentPanel.prototype.onWidgetChange = function(widget) {
  this.pushGridChanges();
}


InstrumentPanel.prototype.persist = function() {
  browser.saveGrid(this.host, this.serializableSettings());
}

InstrumentPanel.prototype.getActiveWidgets = function() {
  var result = this.pages[this.currentPage].widgets.filter(function(widget) {
    return widget.options.active
  }).
  map(function(widget) {
    const widgetId = widget.id.toString();
    var layout = widget.instrumentPanel.getLayout().find(layout => layout.i === widgetId);
    if (typeof layout === 'undefined') {
      layout = widget.getInitialLayout();
    }
    return {layout: layout, reactWidget: widget.getReactElement()};
  });
  return result;
}

InstrumentPanel.prototype.connected = function(host) {
  var that = this;
  this.host = host;
  this.schemadata = new SignalKSchemaData({host: host.split(':')[0], port: host.split(':')[1], ssl: this.useSSL});
  if (browser.getUrlParameter("flushCache")) {
    this.flushCache = true;
  }
  if (browser.getUrlParameter("useGridFromServer")) {
    browser.ajax("layouts/" + host.split(':')[0] + ".json",
      this.setWidgetData.bind(this),
      function(error) {
        console.log(error)
      });
  } else {
    this.setWidgetData(browser.retrieveGrid(host));
  }
}


const columnsForPaths = {
  navigation: 0,
  environment: 1
}

InstrumentPanel.prototype.getColumnforPath = function getColumnforPath(path) {
  const group = path.split('.')[0]
  let column = columnsForPaths[group]
  if (typeof column === "undefined") {
    column = Object.keys(columnsForPaths).length
    columnsForPaths[group] = column
  }
  return column
}
