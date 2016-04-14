var Bacon = require('baconjs');
var BaconModel = require('bacon.model');
var React = require('react');
var ReactDOM = require('react-dom');
var ReactGridLayout = require('react-grid-layout');
var WidthProvider = require('react-grid-layout').WidthProvider;

var InstrumentPanel = require('./instrumentpanel');
var IpNavBar = require('./navbar');
var SettingsPanel = require('./settings/settingspanel');
var StreamBundle = require('../streambundle');

var streamBundle = new StreamBundle();
var instrumentPanel = new InstrumentPanel(streamBundle);

var model = Bacon.Model.combine({
  isLocked: Bacon.Model(true),
  settingsVisible: Bacon.Model(false),
  gridSettings: instrumentPanel.gridSettingsModel
});

ReactGridLayout = WidthProvider(ReactGridLayout);

var App = React.createClass({
  mixins: [require('../util/baconmodelmixin')],

  getInitialState: function() {
    return this.props.model.get();
  },

  render: function() {
    var wrapInDiv = function(widget, i) {
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
        <IpNavBar model={this.props.model} instrumentPanel={instrumentPanel}></IpNavBar>
        {this.state.settingsVisible ?
          <SettingsPanel instrumentPanel={instrumentPanel}></SettingsPanel> :
          <ReactGridLayout
            className="layout"
            layout={this.state.gridSettings.layout}
            children={this.state.gridSettings.activeWidgets.map(wrapInDiv)}
            cols={Math.round(width/320*2)}
            rowHeight={50}
            isDraggable={!this.state.isLocked}
            isResizable={!this.state.isLocked}
            onLayoutChange={instrumentPanel.onLayoutChange.bind(instrumentPanel)} />}
      </div>
    );
  }
});

var app = ReactDOM.render(<App model={model}/>, document.getElementById('content'));
