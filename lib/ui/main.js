


var React = require('react');
var Bacon = require('baconjs');
var BaconModel = require('bacon.model');


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
  settingsVisible: settingsVisible,
  gridSettings: instrumentPanel.gridSettingsModel
});

var App = React.createClass({
  getInitialState: function() {
    return model.get();
  },
  render: function() {
    var wrapInDiv = function(widget, i){
      return React.createElement('div', {key: widget.key}, widget);    
    };

    var width = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;

    var height = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight;

    return (
      <div>
      <IpNavBar model={model} instrumentPanel={instrumentPanel}></IpNavBar>
      {this.state.settingsVisible ? <SettingsPanel instrumentPanel={instrumentPanel}></SettingsPanel> : ""}
      <ReactGridLayout 
      className="layout" 
      layout={this.state.gridSettings.layout}
      children={this.state.gridSettings.activeWidgets.map(wrapInDiv)}
      cols={Math.round(width/320*2)}
      rowHeight={50}
      isDraggable={!this.state.isLocked}
      isResizable={!this.state.isLocked}
      onLayoutChange={instrumentPanel.onLayoutChange.bind(instrumentPanel)}
      >
      </ReactGridLayout>
      {width}px
      </div>
      );
  },
  componentDidMount: function() {
    var that = this;
    this.unsubscribe = model.onValue(function(modelValue) {
      that.setState(modelValue);
    });
  },
  componentWillUnmount: function() {
    if(this.unsubscribe) {
      this.unsubscribe();
    }
  }  
});   

var app =  React.render(
  <App/>,
  document.getElementById('content')
);

