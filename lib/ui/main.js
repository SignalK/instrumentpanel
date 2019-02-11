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
import HelpComponent from '../util/help';

var streamBundle = new StreamBundle();
var instrumentPanel = new InstrumentPanel(streamBundle);

var model = BaconModel.Model.combine({
  isLocked: BaconModel.Model(true),
  settingsVisible: BaconModel.Model(false),
  gridSettings: instrumentPanel.gridSettingsModel,
  helpVisible: BaconModel.Model(false)
});

const ReactGridLayout = WidthProvider(RGL);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props.model.get();
  }

  render() {
    var isLocked = this.state.isLocked;
    var widgetSelected = this.state.widgetSelected;
    var wrapInDiv = function(widget, i) {
      function toolTipsHideShow(event) {
        if (event.currentTarget.textContent !== '') {
          event.currentTarget.className = 'tooltips-base tooltips-hide';
          event.currentTarget.textContent = '';
        } else {
          var sourceId = '';
          if (typeof widget.reactWidget.props.options !== 'undefined') {
            if (typeof widget.reactWidget.props.options.activeSources !== 'undefined') { // windmeter
              sourceId = Object.values(widget.reactWidget.props.options.activeSources).reduce(
                (acc, source) => {
                  var pathArray = source.path.split('.');
                  return acc + pathArray[pathArray.length -1] + ':' + source.sourceId + '\r\n';
                }, '');
            } else if (typeof widget.reactWidget.props.options !== 'undefined') { // compass,attitude,digitaldatetime,digitalposition
              sourceId = widget.reactWidget.props.options.sourceId;
            }
          }  else { // universal
            sourceId = widget.reactWidget.props.sourceId;
          }
          event.currentTarget.className = 'tooltips-base tooltips-show';
          event.currentTarget.textContent = 'sourceId:\r\n' + sourceId;
        }
      };

      var divTooltips = (isLocked)? React.createElement('div', {className: 'tooltips-base', onClick: toolTipsHideShow}) : null;
      var divClickme = (isLocked && widget.reactWidget.props.withClickMe) ? React.createElement('div', {className: 'widget-clickme'}): null;
      return React.createElement('div', {key: widget.reactWidget.key, 'data-grid': widget.layout },
        widget.reactWidget,
        divTooltips,
        divClickme
      );
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
        {this.state.helpVisible ? <HelpComponent /> : null}
        {(!this.state.helpVisible && this.state.settingsVisible) ?
          <SettingsPanel instrumentPanel={instrumentPanel}></SettingsPanel> : null
        }
        {(!this.state.helpVisible && !this.state.settingsVisible) ?
          <ReactGridLayout
            className="layout"
            margin= {[5, 5]}
            layout={this.state.gridSettings.layout}
            children={this.state.gridSettings.activeWidgets.map(wrapInDiv)}
            cols={Math.round(width/320*2)}
            rowHeight={40}
            isDraggable={!this.state.isLocked}
            isResizable={!this.state.isLocked}
            onDragStart={this.disableOnTouchMove}
            onResizeStart={this.disableOnTouchMove}
            onLayoutChange={instrumentPanel.onLayoutChange.bind(instrumentPanel)} /> : null
        }
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

  disableOnTouchMove(layout: Layout, oldItem: LayoutItem, newItem: LayoutItem, placeholder: LayoutItem, e: MouseEvent, element: HTMLElement) {
    // Disable touch scrolling while dragging on mobile devices (iOS12).
    e.target.ontouchmove = function(){ return false; };
  };
};

App.propTypes = {
  model: PropTypes.object.isRequired
};

const IPversion = document.getElementById('version');
IPversion.textContent = `${VERSION}`;

var app = ReactDOM.render(<App model={model}/>, document.getElementById('content'));
