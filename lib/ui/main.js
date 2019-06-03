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
const notificationPageId = -1;

var model = BaconModel.Model.combine({
  isLocked: BaconModel.Model(true),
  settingsVisible: BaconModel.Model(false),
  gridSettings: instrumentPanel.gridSettingsModel,
  helpVisible: BaconModel.Model(location.hash === '#help')
});

const ReactGridLayout = WidthProvider(RGL);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props.model.get();
    this.wrapWidget = this.wrapWidget.bind(this);
    this.generateClickmeElement  = this.generateClickmeElement.bind(this);
  }

  render() {
    var width = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;

    var height = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight;

// https://github.com/STRML/react-grid-layout/issues/382#issuecomment-299734450
    let newLayout = (instrumentPanel.currentPage !== notificationPageId) ? this.state.gridSettings.layout :
      JSON.parse(JSON.stringify(this.state.gridSettings.layout));

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
            layout={newLayout}
            children={this.generateGridChildren()}
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

  generateGridChildren() {
    var isLocked = this.state.isLocked;
    var that = this;
    return this.state.gridSettings.activeWidgets.map(widget => {
      return that.wrapWidget(widget)
    });
  }

  wrapWidget(widget) {
    var wrapperStyle = {};
    if (typeof widget.reactWidget.props.notification !== 'undefined') {
      wrapperStyle.borderColor = widget.reactWidget.props.notification.value.color;
      wrapperStyle.borderWidth = (widget.reactWidget.props.notification.value.level) ? '2px' : '1px';
    } else {
      wrapperStyle.borderColor = instrumentPanel.notificationColor;
      wrapperStyle.borderWidth = (instrumentPanel.notificationLevel > 1) ? '2px' : '1px';
    }
    if (widget.toolTips()) {wrapperStyle.zIndex = 1;}
    return React.createElement(
      'div',
      {
        style: wrapperStyle,
        key: widget.reactWidget.key,
        'data-grid': widget.layout
      },
      widget.reactWidget,
      this.generateToolTipsElement(widget),
      this.generateClickmeElement(widget)
    );
  }

  generateToolTipsElement(widget) {
    class ToolTipsComponent extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          toolTipsVisible: this.props.widget.toolTips() || false
        };
        this.toolTipsHideShow = this.toolTipsHideShow.bind(this);
      }

      render() {
        if (!this.props.isLocked) { return null }
        return React.createElement(
          'div',
          {
            key: this.props.id,
            className: 'tooltips-base ' + ((this.state.toolTipsVisible) ? 'tooltips-show' : 'tooltips-hide'),
            onClick: this.toolTipsHideShow,
            dangerouslySetInnerHTML: {__html: this.toolTipsContent(widget)}
          }
        )
      }

      toolTipsContent(widget) {
        var htmlContent = '';
        if (this.state.toolTipsVisible) {
          htmlContent = '<b>sourceId:</b><br>';
          var pathArray;
          widget.handledSources.forEach( (source) => {
            pathArray = source.path.split('.');
            htmlContent += source.sourceId + ' => ' + pathArray[pathArray.length -1] + '<br>';
          });
        }
        return htmlContent;
      }

      toolTipsHideShow() {
        this.setState({
          toolTipsVisible: !this.state.toolTipsVisible
        })
        this.props.widget.toolTips(true);
        instrumentPanel.pushGridChanges();
      }
    }

    return React.createElement(ToolTipsComponent,{
      id: 't' + widget.reactWidget.key,
      widget: widget,
      isLocked: this.state.isLocked
    });
  }

  generateClickmeElement(widget) {
    if (
      !widget.reactWidget.props.withClickMe ||
      !this.state.isLocked
    ) { return null }
    return React.createElement(
      'div',
      {
        key: instrumentPanel.currentPage + 'c' + widget.reactWidget.key,
        className: 'widget-clickme'
      }
    );
  }

};

App.propTypes = {
  model: PropTypes.object.isRequired
};

const IPversion = document.getElementById('version');
IPversion.textContent = `${VERSION}`;

var app = ReactDOM.render(<App model={model}/>, document.getElementById('content'));
