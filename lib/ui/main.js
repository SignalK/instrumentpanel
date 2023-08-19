import BaconModel from 'bacon.model';
import React, { StrictMode } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Responsive } from "react-grid-layout";
import prefersColorScheme from 'css-prefers-color-scheme';
import { Alert, Button } from 'react-bootstrap';
import Debug from 'debug';
import isEqual from 'lodash/isEqual';

import InstrumentPanel from './instrumentpanel';
import IpNavBar from './navbar';
import SettingsPanel from './settings/settingspanel';
import StreamBundle from '../streambundle';
import HelpComponent from '../util/help';
import ChangelogComponent from '../util/changelog';
import { getUrlParameter, reloadWithParams } from '../util/browser';
import { ResetComponent } from './settings/resetsettings';
import { TouchAppComponent } from '../svg/SvgTouchApp24px';
import {
  retrieveColorScheme,
  isBackupSettingsMode,
  restoreBackupSettings,
  removeKeysByName,
  retrieveVersion,
  storeVersion,
  retrieveEnPathSubscription
} from '../util/localstorage';
import {
  CS_BY_OS,
  CS_DARK,
  backupSettingsKeyName,
  gridBreakpoints,
  gridCols,
  notificationPageId
} from './settings/constants';
import WidthProvider from '../util/WidthProvider';

const debug = Debug('instrumentpanel:main')

var streamBundle = new StreamBundle();
var instrumentPanel = new InstrumentPanel(streamBundle);

instrumentPanel.colorSchemeTool = prefersColorScheme();

var model = BaconModel.Model.combine({
  isLocked: BaconModel.Model(true),
  settingsVisible: BaconModel.Model(false),
  gridSettings: instrumentPanel.gridSettingsModel,
  helpVisible: BaconModel.Model(window.location.hash === '#help'),
  changelogVisible: BaconModel.Model(false),
  connected: BaconModel.Model(false),
  reloadRequired: instrumentPanel.reloadRequired,
  widgetFullScreen: BaconModel.Model(false)
});

const ReactGridLayout = WidthProvider(Responsive);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props.model.get();
    this.wrapWidget = this.wrapWidget.bind(this);
    this.generateClickmeElement = this.generateClickmeElement.bind(this);
    this.onGridLayoutChange = this.onGridLayoutChange.bind(this);
    this.toggleWidgetFullScreen = this.toggleWidgetFullScreen.bind(this);
    this.getLayoutForWidgetId = this.getLayoutForWidgetId.bind(this);
    this.onBreakpointChange = this.onBreakpointChange.bind(this);
    this.onWidthChange = this.onWidthChange.bind(this);
    instrumentPanel.model = this.props.model;
    const initialColorScheme = retrieveColorScheme();
    if (initialColorScheme.colorSchemeSetBy !== CS_BY_OS) {
      instrumentPanel.colorSchemeTool.removeListener();
    } else {
      initialColorScheme.colorSchemeCurrent = instrumentPanel.colorSchemeTool.scheme;
    }
    instrumentPanel.colorSchemeTool.scheme = initialColorScheme.colorSchemeCurrent;
    instrumentPanel.colorScheme = initialColorScheme;
    instrumentPanel.colorSchemeTool.onChange = () => {
      instrumentPanel.getActiveWidgets().forEach((widget) => {
        if (widget.reactWidget.props.functions && typeof widget.reactWidget.props.functions.setDarkMode === 'function') {
          widget.reactWidget.props.functions.setDarkMode(instrumentPanel.colorSchemeTool.scheme === CS_DARK)
        }
      });
    }
    instrumentPanel.version = this.props.version;
    this.lastUsedVersion = retrieveVersion();
    if (this.lastUsedVersion !== instrumentPanel.version) {
      this.props.model.lens("changelogVisible").set(true);
      storeVersion(instrumentPanel.version);
    }
    instrumentPanel.enPathSubscription = retrieveEnPathSubscription();
  }

  onGridLayoutChange(newLlayout, layouts) {
    debug("[onGridLayoutChange] layouts changed" + JSON.stringify(Object.keys(layouts)));
    // only one layout, even we are in breakpoint transition
    // and real change in newLlayout
    if ((Object.keys(layouts).length === 1) &&
      ((!isEqual(instrumentPanel.getCurrentPage().layout = newLlayout)) || (instrumentPanel.currentPage === notificationPageId))
    ) {
      debug("[onGridLayoutChange] updating layout and send pushGridChanges")
      instrumentPanel.getCurrentPage().layouts[instrumentPanel.breakpoint] = newLlayout;
      instrumentPanel.getCurrentPage().layout = newLlayout;
      instrumentPanel.pushGridChanges();
      instrumentPanel.persist();
    }
  }

  onGridLayoutMonted(gridWidth, breakpoint, nbCols) {
    instrumentPanel.breakpoint = breakpoint;
    instrumentPanel.gridCols = nbCols;
    debug("[onGridLayoutMonted] gridWidth:" + gridWidth + " breakpoint:" + breakpoint + " nbCols:" + nbCols)
  }

  onBreakpointChange(newBreakpoint, newCol) {
    for (var index = 0; index < instrumentPanel.pages.length; index++) {
      var layouts = instrumentPanel.pages[index].layouts;
      instrumentPanel.pages[index].layout = (layouts[newBreakpoint]) ? layouts[newBreakpoint] : []
    }
    instrumentPanel.breakpoint = newBreakpoint;
    instrumentPanel.gridCols = newCol;
    instrumentPanel.pushGridChanges();
    instrumentPanel.persist();
    debug("[onBreakpointChange]newBreakpoint:" + newBreakpoint + " nbCol:" + newCol + " " + index + " layout page updated");
  }

  onWidthChange(containerWidth, margin, cols, containerPadding) {
    instrumentPanel.gridCols = cols;
    debug("[onWidthChange] containerWidth/cols: ", containerWidth, cols);
  }

  render() {
    var ratioShownPath = function () {
      const shownPaths = instrumentPanel.getEnabledWidgets().length;
      const hiddenPaths = instrumentPanel.getDisabledWidgets().length;
      if (hiddenPaths > 0) {
        return (
          <React.Fragment>
            <div style={{ textAlign: 'center' }}>{shownPaths}/{shownPaths + hiddenPaths} shown path{(shownPaths > 1) ? 's' : ''} on grid</div>
            <div style={{ textAlign: 'center' }}>Path Subscription: {instrumentPanel.enPathSubscription ? 'enable' : 'disable'} </div>
          </React.Fragment>
        )
      }
    }

    if (this.state.widgetFullScreen !== false) {
      var widgetFullScreenStyle = { margin: '5px' };
      var width = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

      var height = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
      var cols = Math.round(width / 320 * 2)
      var rowHeight = 40;
      var colsWidth = width / cols;
      widgetFullScreenStyle.width = this.state.widgetFullScreen.layout.w * colsWidth;
      widgetFullScreenStyle.height = this.state.widgetFullScreen.layout.h * rowHeight;
      var ratioW = width / widgetFullScreenStyle.width;
      var ratioH = height / widgetFullScreenStyle.height;
      if (ratioW < ratioH) {
        widgetFullScreenStyle.width *= ratioW;
        widgetFullScreenStyle.height *= ratioW;
      } else {
        widgetFullScreenStyle.width *= ratioH;
        widgetFullScreenStyle.height *= ratioH;
      }
      widgetFullScreenStyle.left = (width - widgetFullScreenStyle.width) / 2;
      if (widgetFullScreenStyle.width === width) widgetFullScreenStyle.width -= 10;
      if (widgetFullScreenStyle.height === height) widgetFullScreenStyle.height -= 10;
    }
    var doRenderReactGridLayout = (
      !this.state.helpVisible &&
      !this.state.settingsVisible &&
      this.state.connected &&
      this.state.widgetFullScreen === false
    )
    //doRenderReactGridLayout && (debug("[render] layout:", this.state.gridSettings.layout))
    return (
      <div>
        {instrumentPanel.backupSettings ? <ImportedSettingsAlert instrumentPanel={instrumentPanel}></ImportedSettingsAlert> : null}
        <IpNavBar model={this.props.model} instrumentPanel={instrumentPanel}></IpNavBar>
        {this.state.helpVisible ? <HelpComponent /> : null}
        {(!this.state.helpVisible && this.state.settingsVisible) ?
          <SettingsPanel instrumentPanel={instrumentPanel}></SettingsPanel> : null
        }
        {this.state.changelogVisible ? <ChangelogComponent model={this.props.model} lastUsedVersion={this.lastUsedVersion} /> : null}
        {doRenderReactGridLayout ?
          <ReactGridLayout
            reduceWidth={(this.state.isLocked) ? 0 : 20}
            margin={[2, 2]}
            containerPadding={[2, 2]}
            children={this.generateGridChildren()}
            breakpoints={gridBreakpoints}
            cols={gridCols}
            rowHeight={40}
            isDraggable={!this.state.isLocked}
            isResizable={!this.state.isLocked}
            isBounded={true}
            allowOverlap={false}
            measureBeforeMount={true}
            onDragStart={this.disableOnTouchMove}
            onResizeStart={this.disableOnTouchMove}
            onLayoutChange={this.onGridLayoutChange}
            onWidthChange={this.onWidthChange}
            onBreakpointChange={this.onBreakpointChange}
            onComponentDidMount={this.onGridLayoutMonted}
          /> : null
        }
        {(this.state.widgetFullScreen !== false) ?
          <div className="widget-full-screen" style={widgetFullScreenStyle}>
            {this.wrapWidget(this.state.widgetFullScreen)}
          </div> : null
        }
        {(this.state.connected) ? ratioShownPath() : <div id="gifloading" />}
      </div>
    );
  }

  componentDidMount() {
    var that = this;
    this.unsubscribe = this.props.model.onValue((newState) => {
      //debug("[componentDidMount] onValue(newState.gridSettings.layout)", JSON.stringify(newState.gridSettings.layout))
      that.setState(newState)
    });
    window.addEventListener('beforeunload', (e) => {
      //e.preventDefault();
      //e.returnValue = '';
      if (instrumentPanel.saveOnClose) instrumentPanel.persist(true);
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  disableOnTouchMove(layout, oldItem, newItem, placeholder, e, element) {
    // Disable touch scrolling while dragging on mobile devices (iOS12).
    e.target.ontouchmove = function () { return false; };
  };

  generateGridChildren() {
    var that = this;
    return this.state.gridSettings.activeWidgets.map(widget => {
      return that.wrapWidget(widget)
    });
  }

  getLayoutForWidgetId(widgetId, widget) {
    var suffixBreakpoint = (instrumentPanel.currentPage !== notificationPageId) ?
      "_" + instrumentPanel.breakpoint : ""
    var idWithBreakpoint = widgetId + suffixBreakpoint
    var widgetLayout = this.state.gridSettings.layout.find((widgetLayout) => {
      return widgetLayout.i === idWithBreakpoint
    })
    if (typeof widgetLayout === "undefined") {
      debug("[getLayoutForWidgetId] layout for widgetId:" + widgetId + " not found, use widget layout instead");
      widgetLayout = widget.layout
      widgetLayout.i = widgetLayout.i.split("_")[0] + suffixBreakpoint
      debug("[getLayoutForWidgetId] new widgetLayout:" + JSON.stringify(widgetLayout))
    }
    if ((instrumentPanel.currentPage !== notificationPageId) &&
      (widgetLayout.i.split("_").length !== 2)) {
      console.error("[getLayoutForWidgetId] ERROR: bad _ in widgetId:" + widgetLayout.i)
      widgetLayout.i = widgetLayout.i.split("_")[0] + suffixBreakpoint
    }
    (widgetLayout.y === null) && (widgetLayout.y = Infinity);
    if (instrumentPanel.currentPage === notificationPageId) widgetLayout.w = instrumentPanel.gridCols
    widgetLayout.moved = undefined;
    widgetLayout.static = undefined;
    return widgetLayout
  }

  wrapWidget(widget) {
    var wrapperClassName = (this.state.widgetFullScreen !== false) ? 'react-grid-item cssTransforms' : '';
    var wrapperStyle = {};
    var suffixBreakpoint = (instrumentPanel.currentPage !== notificationPageId) ?
      "_" + instrumentPanel.breakpoint : ""
    if (typeof widget.reactWidget.props.notification !== 'undefined') {
      wrapperStyle.borderColor = widget.reactWidget.props.notification.value.color;
      wrapperStyle.borderWidth = (widget.reactWidget.props.notification.value.level) ? '2px' : '1px';
    } else {
      wrapperStyle.borderColor = instrumentPanel.notificationColor;
      wrapperStyle.borderWidth = (instrumentPanel.notificationLevel > 1) ? '2px' : '1px';
    }
    if (widget.toolTips()) { wrapperStyle.zIndex = 1; }
    var widgetLayout = this.getLayoutForWidgetId(widget.reactWidget.key, widget)
    //debug("[wrapWidget] data-grid: ", JSON.stringify(widgetLayout));
    return React.createElement(
      'div',
      {
        style: wrapperStyle,
        className: wrapperClassName,
        key: widget.reactWidget.key + suffixBreakpoint,
        'data-grid': widgetLayout,
        onClick: (event) => this.toggleWidgetFullScreen(widget, event)
      },
      widget.reactWidget,
      this.generateToolTipsElement(widget),
      this.generateClickmeElement(widget)
    );
  }

  generateToolTipsElement(widget) {
    if (this.state.widgetFullScreen !== false) return null;
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
            dangerouslySetInnerHTML: { __html: this.toolTipsContent(widget) }
          }
        )
      }

      toolTipsContent(widget) {
        var htmlContent = '';
        if (this.state.toolTipsVisible) {
          htmlContent = '<b>sourceId:</b><br>';
          var pathArray;
          widget.handledSources.forEach((source) => {
            pathArray = source.path.split('.');
            htmlContent += source.sourceId + ' => ' + pathArray[pathArray.length - 1] + '<br>';
          });
        }
        return htmlContent;
      }

      toolTipsHideShow(event) {
        event.stopPropagation();
        this.setState({
          toolTipsVisible: !this.state.toolTipsVisible
        })
        this.props.widget.toolTips(true);
        instrumentPanel.pushGridChanges();
      }

    }

    return React.createElement(ToolTipsComponent, {
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
      { widget: widget }
    );
  }

  toggleWidgetFullScreen(widget, event) {
    if (this.state.isLocked && typeof event !== 'undefined' && !widget.toolTips()) {
      var footer = document.getElementsByTagName('footer');
      var halfZoneSize = 50;
      var rect = event.currentTarget.getBoundingClientRect();
      var eventOffsetX = event.clientX - rect.left;
      var eventOffsetY = event.clientY - rect.top;
      if (widget.reactWidget.props.withClickMe && eventOffsetX < 40 && eventOffsetY < 40) return; // exclude changeDisplayMode zone
      eventOffsetX -= rect.width / 2;
      eventOffsetY -= rect.height / 2;
      if (this.state.widgetFullScreen !== false) {
        this.props.model.lens("widgetFullScreen").set(false);
        event.stopPropagation();
        for (let e of footer) { e.style.display = ""; }
      } else {
        if ((eventOffsetX > -halfZoneSize) && (eventOffsetX < halfZoneSize) &&
          (eventOffsetY > -halfZoneSize) && (eventOffsetY < halfZoneSize)) {
          this.props.model.lens("widgetFullScreen").set(widget);
          event.stopPropagation();
          for (let e of footer) { e.style.display = "none"; }
        }
      }
    }
  }

};

App.propTypes = {
  model: PropTypes.object.isRequired
};

class ImportedSettingsAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.props.instrumentPanel.backupSettings = isBackupSettingsMode();
    this.handleValidateSettings = this.handleValidateSettings.bind(this);
    this.handleRestoreSettings = this.handleRestoreSettings.bind(this);
    this.handleResetSettings = this.handleResetSettings.bind(this);
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
    reloadWithParams({ 'reset': 'true' });
  }

  render() {
    const message = this.props.instrumentPanel.backupSettings ?
      (
        <Alert bsStyle="warning">
          You are running with imported settings.<br />
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
  var resetSettings = ReactDOM.render(<ResetComponent />, document.getElementById('content'));
} else {
  var app = ReactDOM.render(<StrictMode><App model={model} version={IPversion.textContent} /></StrictMode>, document.getElementById('content'));
}
