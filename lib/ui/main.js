
debug = require('debug')


var React = require('react');
var Bacon = require('baconjs');
var BaconModel = require('bacon.model');
var d3 = require('d3');
var signalk = require('../signalk');


var ReactGridLayout = require('react-grid-layout');


var StreamBundle = require('../streambundle');
var InstrumentPanel = require('./instrumentpanel');

var streamBundle = new StreamBundle();
var instrumentPanel = new InstrumentPanel(streamBundle);

var IpNavBar = require('./navbar');
var SettingsPanel = require('./settingspanel');

var isLocked = Bacon.Model(true);
var settingsVisible = Bacon.Model(false);

var model = Bacon.Model.combine({
  isLocked: isLocked,
  settingsVisible: settingsVisible
});

var App = React.createClass({
  getInitialState: function() {
    return model.get();
  },
  render: function() {
    var wrapInDiv = function(widget, i){
      return React.createElement('div', {key: widget.key}, widget);    
    };
    return (
      <div>
      <IpNavBar model={model}></IpNavBar>
      {this.state.settingsVisible ? <SettingsPanel instrumentPanel={instrumentPanel}></SettingsPanel> : ""}
      <ReactGridLayout 
      className="layout" 
      layout={this.props.widgetlayout}  
      children={this.props.widgets.map(wrapInDiv)}
      cols={12}
      rowHeight={50}
      isDraggable={!this.state.isLocked}
      isResizable={!this.state.isLocked}
      is={!this.state.isLocked}
      onLayoutChange={onLayoutChange}
      >
      </ReactGridLayout>
      </div>
      );
  },
  componentDidMount: function() {
    this.unsubscribe = model.onValue(this.setState.bind(this));
  },
  componentWillUnmount: function() {
    if(this.unsubscribe) {
      this.unsubscribe();
    }
  }  
});   




if (window.localStorage['signalkGrid2']) {
  try {
    widgetData = JSON.parse(window.localStorage['signalkGrid2'])
    instrumentPanel.setWidgetData(widgetData);
  } catch (ex) {
    console.error("Could not deserialize grid from localstorage:" + ex)
  }
}

var app =  React.render(
  <App widgetlayout={instrumentPanel.getWidgetLayout()} 
    widgets={instrumentPanel.getWidgets()} 
    isLocked={isLocked}/>,
  document.getElementById('content')
);

instrumentPanel.onWidgetListChanged(function() {
  app.setProps({
    widgetlayout: instrumentPanel.getWidgetLayout(),
    widgets: instrumentPanel.getWidgets()
  });
});

signalk.connectDelta('localhost:3000', dispatch);
function dispatch(delta) {
  delta.updates.forEach(function(update) {
    update.values.forEach(function(pathValue) {
      instrumentPanel.push.call(instrumentPanel, pathValue);
    });
  });
}

function onLayoutChange(layout) {
  instrumentPanel.onLayoutChange(layout);
  window.localStorage.setItem('signalkGrid2', instrumentPanel.serialize());
}

