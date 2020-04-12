import React from 'react';
import {render} from 'react-dom';
import { Button, ButtonGroup } from 'react-bootstrap';
import onSwipe from 'on-swipe';
import Debug from 'debug';

const debug = Debug('instrumentpanel:navbar')

import ConnectionIndicator from './connectionindicator';
import SvgBuild24px from '../svg/SvgBuild24px';
import SvgVisibility24px from '../svg/SvgVisibility24px';
import SvgLock24px from '../svg/SvgLock24px';
import SvgLockOpen24px from '../svg/SvgLockOpen24px';
import SvgPowerSettingsNew24px from '../svg/SvgPowerSettingsNew24px';
import SvgHelpOutline24px from '../svg/SvgHelpOutline24px';
import SvgNotification24px from '../svg/SvgNotification24px';
import SvgDark24px from '../svg/SvgDark24px'
import SvgSunny24px from '../svg/SvgSunny24px'
import {reloadWithParams} from '../util/browser';
import {
  storeStartConnected,
  retrieveStartConnected,
  storeColorScheme,
  retrieveColorScheme,
  retrieveToken,
  isPreferredUnits,
  storePreferredUnits
} from '../util/localstorage';
import {
  retrievePreferredUnits as ssRetrievePreferredUnits
} from '../util/serverstorage';
import {
  notificationPageId
} from './settings/constants'

var buttonClass = "navbar-btn";

export default class IpNavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state =  {
      connecting: false,
      connected: false,
      visible: true
    };
    this.connectedButtons = this.connectedButtons.bind(this);
    this.toggleLocked = this.toggleLocked.bind(this);
    this.toggleSettingsVisible = this.toggleSettingsVisible.bind(this);
    this.setPage = this.setPage.bind(this);
    this.appendPage = this.appendPage.bind(this);
    this.onDeletePage = this.onDeletePage.bind(this);
    this.connectOrDisconnect = this.connectOrDisconnect.bind(this);
    this.onConnect = this.onConnect.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
    this.toggleHelpVisible = this.toggleHelpVisible.bind(this);
    this.toggleColorScheme = this.toggleColorScheme.bind(this);
    this.hideNavBarTimer = null;
    this.hideIpNavBar = this.hideIpNavBar.bind(this);
    this.showIpNavBar = this.showIpNavBar.bind(this);
    this.renderVisible = this.renderVisible.bind(this);
    this.renderHide = this.renderHide.bind(this);
    this.swipePage = this.swipePage.bind(this);
    this.handleNavClick = this.handleNavClick.bind(this);
    onSwipe({ node: document});
  }

  swipePage(evt) {
    try {
      if (!event.detail.direction.match(/left|right/) || !this.props.model.get().isLocked) {
        return;
      }
      const toNext = event.detail.direction === 'left' ? true : false;
      this.props.instrumentPanel.gotoNextPrevPage(toNext);
    } catch(ex) {
        return;
      }
  }

  hideIpNavBar() {
    if (
      this.props.model.get().settingsVisible ||
      !this.props.model.get().isLocked ||
      this.props.model.get().helpVisible ||
      !this.state.connected ||
      this.props.instrumentPanel.backupSettings) return;
    this.setState({visible: false});
  }

  showIpNavBar(evt) {
    clearTimeout(this.hideNavBarTimer);
    if (!this.state.visible) {
      if (typeof evt !== 'undefined') {
        evt.stopPropagation();
      }
      this.setState({visible: true});
    }
    if (
      this.props.model.get().settingsVisible ||
      !this.props.model.get().isLocked ||
      this.props.model.get().helpVisible ||
      !this.state.connected) {
        return;
      }
    this.hideNavBarTimer = setTimeout(() => (this.hideIpNavBar()), 15000);
  }

  render() {
    return(
      (this.state.visible) ? this.renderVisible() : this.renderHide()
    )
  }

  renderVisible() {
    var buttons = this.state.connected ? this.connectedButtons() : this.disconnectedButtons();

    var heartBeat = this.state.connected ? (
      <div className="heartbeatIcon pull-right">
        <ConnectionIndicator allUpdates={this.props.instrumentPanel.streamBundle.pathValues}/>
      </div>
    ) : undefined;

    return (
      <nav className="navbar" onClick={this.handleNavClick}>
        <a id="menu"></a>
        {buttons}
        {heartBeat}
      </nav>
    );

  }

  renderHide() {
    const borderStyle = {
      borderColor: this.props.instrumentPanel.notificationColorHidden,
      borderWidth: (this.props.instrumentPanel.notificationLevelHidden > 0) ? '1px' : '0px',
      borderStyle: "dotted"
    };
    const notificationIcon = ((this.props.instrumentPanel.notificationLevel > 1) || (this.props.instrumentPanel.notificationLevelHidden > 1)) ?
      <SvgNotification24px
        x="0"
        y="0"
        width="1em"
        height="1em"
        fill={this.props.instrumentPanel.notificationColor}
        style={borderStyle}
      /> : null;
    return(
      <div className="heartbeatIconOnTop pull-right">
        {notificationIcon}
        <ConnectionIndicator allUpdates={this.props.instrumentPanel.streamBundle.pathValues}/>
      </div>
    )
  }

  connectedButtons() {
    const disableButton = (this.props.model.get().helpVisible) ? true : false;
    const notificationIconStyle = {
      fill: this.props.instrumentPanel.notificationColor,
      borderColor: this.props.instrumentPanel.notificationColorHidden,
      borderWidth: (this.props.instrumentPanel.notificationLevelHidden > 0) ? '2px' : '0px',
      borderStyle: 'dotted'
    };
    var pageButton = function(page, i) {
      return (
        <Button key={i}
          bsClass={"navbar-btn" + (this.props.instrumentPanel.currentPage === i ? '-primary' : '')}
          className={"btn" + (this.props.instrumentPanel.currentPage === i ? ' navbar-btn' : '')}
          onClick={(event) => {this.setPage(i, event)}}
          onMouseDown={this.handleStopPropagation}
          disabled={disableButton}
        >
          {i+1}
        </Button>
      )
    };

    var notificationButton = (
      <Button key={notificationPageId}
        bsClass={"navbar-btn" + (this.props.instrumentPanel.currentPage === notificationPageId ? '-primary' : '')}
        className={"btn" + (this.props.instrumentPanel.currentPage === notificationPageId ? ' navbar-btn' : '') + " navbar-btn-icon"}
        onClick={(event) => {this.setPage(notificationPageId, event)}}
        onMouseDown={this.handleStopPropagation}
        disabled={disableButton}
      >
        <SvgNotification24px x="0" y="0" width="1em" height="1em" style={notificationIconStyle}/>
      </Button>
    );

    var addPageButton = this.props.model.get().settingsVisible ? (
      <Button bsClass="navbar-btn"
        className="btn"
        onClick={this.appendPage}
        onMouseDown={this.handleStopPropagation}
        disabled={disableButton}>+</Button>
    ) : undefined;

    var deletePageButton = this.props.model.get().settingsVisible && this.props.instrumentPanel.pages.length > 1? (
      <Button bsClass="navbar-btn"
        className="btn"
        onClick={this.onDeletePage}
        onMouseDown={this.handleStopPropagation}
        disabled={(disableButton || this.props.instrumentPanel.currentPage === notificationPageId) ? true : false}
      >Del current</Button>
    ) : undefined;

    var settingIcon = this.props.model.get().settingsVisible ? (
      <SvgVisibility24px x="0" y="0" width="1em" height="1em"/>) : (
      <SvgBuild24px x="0" y="0" width="1em" height="1em"/>);

    var lockIcon = this.props.model.get().isLocked ? (
      <SvgLock24px x="0" y="0" width="1em" height="1em"/>) : (
      <SvgLockOpen24px x="0" y="0" width="1em" height="1em"/>);

    var darkModeIcon = (this.props.instrumentPanel.getDarkMode()) ? (
      <SvgSunny24px x="0" y="0" width="1em" height="1em"/>) : (
      <SvgDark24px x="0" y="0" width="1em" height="1em"/>);


    return (
      <span>
        <Button bsClass="navbar-btn" className="btn navbar-btn-icon"
            onClick={this.toggleLocked}
            onMouseDown={this.handleStopPropagation}
            disabled={(
              disableButton ||
              this.props.instrumentPanel.currentPage === notificationPageId ||
              this.props.model.get().settingsVisible
            ) ? true : false}>
          {lockIcon}
        </Button>
        <Button bsClass="navbar-btn"
          className="btn navbar-btn-icon"
          onClick={this.toggleSettingsVisible}
          onMouseDown={this.handleStopPropagation}
          disabled={disableButton || !this.props.model.get().isLocked}
        >
          {settingIcon}
        </Button>
        {deletePageButton}
        <ButtonGroup>
          {this.props.instrumentPanel.pages.map(pageButton, this)}
          {addPageButton}
          {notificationButton}
        </ButtonGroup>
        <Button bsClass={"navbar-btn" + (disableButton ? '-warning' : '')} 
            className="btn navbar-btn  navbar-btn-icon"
            onClick={this.toggleHelpVisible}
            onMouseDown={this.handleStopPropagation}
        >
          <SvgHelpOutline24px x="0" y="0" width="1em" height="1em"/>
        </Button>
        <Button bsClass="navbar-btn" className="btn pull-right navbar-btn-icon"
            onClickCapture={this.toggleColorScheme}
            onMouseDown={this.handleStopPropagation}
            disabled={disableButton}
        >
          {darkModeIcon}
        </Button>
        <Button bsClass="navbar-btn" className="btn pull-right navbar-btn-icon"
            onClick={this.connectOrDisconnect}
            onMouseDown={this.handleStopPropagation}
            disabled={disableButton}
        >
          <SvgPowerSettingsNew24px x="0" y="0" width="1em" height="1em"/>
        </Button>
      </span>
    );
  }

  disconnectedButtons() {
    const disableButton = (this.props.model.get().helpVisible) ? true : false;

    return (
      <span>
        <Button bsClass="navbar-btn" className="btn"
          onClick={this.connectOrDisconnect}
          onMouseDown={this.handleStopPropagation}
          style={{margin:5}} 
          disabled={disableButton}>
            {this.state.connecting ? 'Connecting' : 'Connect'} to ws
            {this.props.instrumentPanel.SignalkClient.get('useTLS') ? 's://' : '://'}
            {this.props.instrumentPanel.SignalkClient.get('hostname')}:{this.props.instrumentPanel.SignalkClient.get('port')}
        </Button>

          <Button 
            bsClass={"navbar-btn" + (disableButton ? '-warning' : '')}
            className="btn navbar-btn-icon"
            onClick={this.toggleHelpVisible}
            onMouseDown={this.handleStopPropagation}
          >
              <SvgHelpOutline24px x="0" y="0" width="1em" height="1em"/>
          </Button>

      </span>
    );
  }

  componentDidMount() {
    if (retrieveStartConnected()) this.connectOrDisconnect();
    document.addEventListener('click', this.showIpNavBar, true);
    document.addEventListener('swipe', this.swipePage);
  }

  componentWillUnmount() {
    clearTimeout(this.hideNavBarTimer);
    document.removeEventListener('click', this.showIpNavBar);
    document.removeEventListener('swipe', this.swipePage);
  }

  toggleHelpVisible(event) {
    this.handleStopPropagation(event);
    this.props.model.lens("helpVisible").set(!this.props.model.get().helpVisible);
    this.showIpNavBar();
  }

  toggleColorScheme(event) {
    this.handleStopPropagation(event);
    var newColorSchemeToSave = retrieveColorScheme();
    this.props.instrumentPanel.setDarkMode(!this.props.instrumentPanel.getDarkMode());
    newColorSchemeToSave.colorSchemeCurrent = this.props.instrumentPanel.getColorSchemeCurrent();
    storeColorScheme(newColorSchemeToSave);
    this.props.instrumentPanel.setColorSchemeSetByMAINBAR();
    this.setState({"connected": this.state.connected});
  }

  toggleLocked(event) {
    this.handleStopPropagation(event);
    this.props.model.lens("isLocked").set(!this.props.model.get().isLocked);
    this.showIpNavBar();
  }

  toggleSettingsVisible(event) {
    this.handleStopPropagation(event);
    if ((this.props.model.get().settingsVisible) &&
      (this.props.instrumentPanel.isReloadRequired())) {
      reloadWithParams(this.props.instrumentPanel.getReloadParams());
    } else {
        this.props.model.lens("settingsVisible")
          .set(!this.props.model.get().settingsVisible);
        this.props.instrumentPanel.sortNotificationLayout();
      }
    this.showIpNavBar();
  }

  setPage(page, event) {
    this.handleStopPropagation(event);
    if (page === notificationPageId) {
      this.props.model.lens("isLocked").set(true);
    }
    this.props.instrumentPanel.setPage(page);
  }

  appendPage(event) {
    this.handleStopPropagation(event);
    this.props.instrumentPanel.setPage(this.props.instrumentPanel.pages.length);
  }
  
  onDeletePage(event) {
    this.handleStopPropagation(event);
    if (confirm("Are you sure you want to delete page " + (this.props.instrumentPanel.currentPage + 1))) {
      this.props.instrumentPanel.deleteCurrentPage();
    }
  }

  connectOrDisconnect(event) {
    this.handleStopPropagation(event);
    var that = this;
    const SignalkClient = this.props.instrumentPanel.SignalkClient;
    if (!(this.state.connecting || this.state.connected)) {
      SignalkClient.connect();
      this.setState({
        "connecting": true,
      });
      SignalkClient.on('connect', () => {
        // For debug only with npm start when IP running at 3001 listening port
        var token = retrieveToken();
        if (token) {
          debug("[connectOrDisconnect] connect with token authentication");
          SignalkClient.setAuthenticated(token);
        }
        // End for debug only
        debug("[connectOrDisconnect] Waiting for connectionInfo");
        SignalkClient.on('connectionInfo', (data => {
          debug("[connectOrDisconnect] connectionInfo received");
          if (!isPreferredUnits() && this.props.instrumentPanel.getSsAvailable()) {
            debug("[connectOrDisconnect] applicationData is available on server & no local preferred units");
            ssRetrievePreferredUnits(
              SignalkClient,
              false, // only from global
              (preferredUnits => {
                debug("[connectOrDisconnect] retrievePreferredUnits return:" + JSON.stringify(preferredUnits));
                if (preferredUnits !== null) {
                  storePreferredUnits(preferredUnits);
                  this.props.instrumentPanel.loadPreferredUnits();
                }
                SignalkClient.on('delta', this.props.instrumentPanel.dispatch.bind(this.props.instrumentPanel));
              })
            )
          } else {
              SignalkClient.on('delta', this.props.instrumentPanel.dispatch.bind(this.props.instrumentPanel));
            }
          SignalkClient.subscribe({context:'vessels.self',subscribe:[{ path:'*'}]});
        }));
        that.onConnect();
      });
      SignalkClient.on('error', (err) => {
        debug("[connectOrDisconnect] error:" + JSON.stringify(err));
        that.setState({
          "connecting": true,
          "connected": false
        });
      });
      SignalkClient.on('hitMaxRetries', () => {
        debug("[connectOrDisconnect] hitMaxRetries reached");
        that.setState({
          "connecting": false,
          "connected": false
        });
        alert("Cannot connect to Signal K server: ws" +
          ((SignalkClient.get('useTLS')) ? "s" : "") +
          "://" + SignalkClient.get('hostname') +
          ":" + SignalkClient.get('port'));
      });
    } else {
        storeStartConnected(false);
        if (SignalkClient !== null) {
          SignalkClient.disconnect();
        }
        this.onDisconnect();
      }
  }

  onConnect() {
    this.setState({
      "connecting": false,
      "connected": true
    });
    storeStartConnected(true);
    this.props.instrumentPanel.connected();
    this.showIpNavBar();
  }

  onDisconnect() {
    this.setState({
      "connecting": false,
      "connected": false
    });
    reloadWithParams(this.props.instrumentPanel.getReloadParams());
    this.props.instrumentPanel.loginStatus = {};
  }

  handleNavClick(event) {
    if (this.state.visible) {
      this.hideIpNavBar();
    }
  }

  handleStopPropagation(event) {
    if (event) event.stopPropagation();
  }
};
