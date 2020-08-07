import Bacon from 'baconjs';
import BaconModel from 'bacon.model';
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import RGL from "react-grid-layout";
import prefersColorScheme from 'css-prefers-color-scheme';
import {Alert, Button} from 'react-bootstrap';

import InstrumentPanel from './instrumentpanel';
import IpNavBar from './navbar';
import SettingsPanel from './settings/settingspanel';
import StreamBundle from '../streambundle';
import HelpComponent from '../util/help';
import {getUrlParameter, reloadWithParams} from '../util/browser';
import {ResetComponent} from './settings/resetsettings';
import {TouchAppComponent} from '../svg/SvgTouchApp24px';
import {
  retrieveColorScheme,
  checkIfBackupSettings,
  restoreBackupSettings,
  storeStartConnected,
  removeKeysByName
} from '../util/localstorage';
import {
  CS_BY_OS,
  notificationPageId,
  backupSettingsKeyName
} from './settings/constants';
import WidthProvider from '../util/WidthProvider';

var streamBundle = new StreamBundle();
var instrumentPanel = new InstrumentPanel(streamBundle);

instrumentPanel.colorSchemeTool = prefersColorScheme();

var model = BaconModel.Model.combine({
  isLocked: BaconModel.Model(true),
  settingsVisible: BaconModel.Model(false),
  gridSettings: instrumentPanel.gridSettingsModel,
  helpVisible: BaconModel.Model(window.location.hash === '#help'),
  reloadRequired: instrumentPanel.reloadRequired
});

const ReactGridLayout = WidthProvider(RGL);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props.model.get();
    this.wrapWidget = this.wrapWidget.bind(this);
    this.generateClickmeElement  = this.generateClickmeElement.bind(this);
    this.onGridLayoutChange = this.onGridLayoutChange.bind(this);
    const initialColorScheme = retrieveColorScheme();
    if (initialColorScheme.colorSchemeSetBy !== CS_BY_OS) {
      instrumentPanel.colorSchemeTool.removeListener();
    } else {
        initialColorScheme.colorSchemeCurrent = instrumentPanel.colorSchemeTool.scheme;
      }
    instrumentPanel.colorSchemeTool.scheme = initialColorScheme.colorSchemeCurrent;
    instrumentPanel.colorScheme = initialColorScheme;
  }

  onGridLayoutChange(layout) {
    if (!this.state.isLocked) {
      instrumentPanel.getCurrentPage().layout = layout;
      instrumentPanel.persist();
    }
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

    var ratioShownPath = function() {
      const shownPaths = instrumentPanel.getEnabledWidgets().length;
      const hiddenPaths  = instrumentPanel.getDisabledWidgets().length;
      if (hiddenPaths > 0) {
        return (
          <div style={{textAlign:'center'}}>{shownPaths}/{shownPaths + hiddenPaths} shown path{(shownPaths>1)?'s':''} on grid</div>
        )
      }
    }

    return (
      <div>
        <ImportedSettingsAlert instrumentPanel={instrumentPanel}></ImportedSettingsAlert>
        <IpNavBar model={this.props.model} instrumentPanel={instrumentPanel}></IpNavBar>
        {this.state.helpVisible ? <HelpComponent /> : null}
        {(!this.state.helpVisible && this.state.settingsVisible) ?
          <SettingsPanel instrumentPanel={instrumentPanel}></SettingsPanel> : null
        }
        {(!this.state.helpVisible && !this.state.settingsVisible) ?
          <ReactGridLayout
            reduceWidth={(this.state.isLocked) ? 0 : 20}
            margin= {[5, 5]}
            layout={newLayout}
            children={this.generateGridChildren()}
            cols={Math.round(width/320*2)}
            rowHeight={40}
            isDraggable={!this.state.isLocked}
            isResizable={!this.state.isLocked}
            onDragStart={this.disableOnTouchMove}
            onResizeStart={this.disableOnTouchMove}
            onLayoutChange={this.onGridLayoutChange} /> : null
        }
        {(!this.state.settingsVisible)?ratioShownPath():null}
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

  disableOnTouchMove(layout, oldItem, newItem, placeholder, e, element) {
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
      TouchAppComponent,
      {widget: widget}
    );
  }

};

App.propTypes = {
  model: PropTypes.object.isRequired
};

class ImportedSettingsAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.props.instrumentPanel.backupSettings = checkIfBackupSettings();
    this.handleValidateSettings = this.handleValidateSettings.bind(this);
    this.handleRestoreSettings  = this.handleRestoreSettings.bind(this);
    this.handleResetSettings    = this.handleResetSettings.bind(this);
  }

  handleValidateSettings() {
    removeKeysByName([backupSettingsKeyName]);
    reloadWithParams(this.props.instrumentPanel.getReloadParams());
  }

  handleRestoreSettings() {
    restoreBackupSettings();
    reloadWithParams(this.props.instrumentPanel.getReloadParams());
  }

  handleResetSettings() {
    reloadWithParams({'reset': 'true'});
  }

  render() {
    const message = this.props.instrumentPanel.backupSettings ?
      (
        <Alert bsStyle="warning">
          You are running with imported settings.<br/>
          <div>
          <Button bsStyle="success" onClick={this.handleValidateSettings}>ENABLE</Button>
          &nbsp;new settings if everything works.
          </div>
          <div>
          <Button bsStyle="warning" onClick={this.handleRestoreSettings}>RESTORE</Button>
          &nbsp;previous settings.
          </div>
          <div>
          <Button bsStyle="danger" onClick={this.handleResetSettings}>RESET</Button>
          &nbsp;settings in case of problem.
          </div>
        </Alert>
      ) : null;
    return message;
  }
};

ImportedSettingsAlert.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};

const IPversion = document.getElementById('version');
IPversion.textContent = `${VERSION}`;

if (getUrlParameter('reset')) {
  var resetSettings = ReactDOM.render(<ResetComponent/>, document.getElementById('content'));
} else {
    var app = ReactDOM.render(<App model={model}/>, document.getElementById('content'));
  }
