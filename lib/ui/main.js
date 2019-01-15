import Bacon from 'baconjs';
import BaconModel from 'bacon.model';
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import RGL, { WidthProvider } from "react-grid-layout";

import InstrumentPanel from './instrumentpanel';
import IpNavBar from './navbar';
import SettingsPanel from './settings/settingspanel';
import StreamBundle from '../streambundle';

var streamBundle = new StreamBundle();
var instrumentPanel = new InstrumentPanel(streamBundle);

var model = BaconModel.Model.combine({
  isLocked: BaconModel.Model(true),
  settingsVisible: BaconModel.Model(false),
  gridSettings: instrumentPanel.gridSettingsModel
});

const ReactGridLayout = WidthProvider(RGL);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props.model.get();
  }

  render() {
    var wrapInDiv = function(widget, i) {
      return React.createElement('div', {key: widget.reactWidget.key, 'data-grid': widget.layout}, widget.reactWidget);
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

  componentDidMount() {
    var that = this;
    this.unsubscribe = this.props.model.onValue( (newState) => {
      that.setState(newState)
    });
  }

  componentWillUnmount() {
    if(this.unsubscribe) {
      this.unsubscribe();
    }
  }
};

App.propTypes = {
  model: PropTypes.object.isRequired
};

const IPversion = document.getElementById('version');
IPversion.textContent = `${VERSION}`;

var app = ReactDOM.render(<App model={model}/>, document.getElementById('content'));
