import React from 'react';
import {render} from 'react-dom';
import { Button } from 'react-bootstrap';

import ConnectionIndicator from './connectionindicator';
import SvgBuild24px from '../svg/SvgBuild24px';
import SvgVisibility24px from '../svg/SvgVisibility24px';
import SvgLock24px from '../svg/SvgLock24px';
import SvgLockOpen24px from '../svg/SvgLockOpen24px';
import SvgPowerSettingsNew24px from '../svg/SvgPowerSettingsNew24px';
import SvgHelpOutline24px from '../svg/SvgHelpOutline24px';
import SvgNotification24px from '../svg/SvgNotification24px';
import {reloadWithLayout} from '../util/browser';
import {
  saveStartConnected as localstorageSaveStartConnected,
  retrieveStartConnected as localstorageRetrieveStartConnected
} from '../util/localstorage';

const notificationPageId = -1;

var buttonStyle = {
  fontSize: '20px'
};

var btnGroupStyle = {
  marginLeft: '2px',
  marginRight: '2px'
}

var buttonClass = "btn btn-md btn-default navbar-btn";

export default class IpNavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state =  {
      connecting: false,
      connected: false
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
  }

  render() {
    var buttons = this.state.connected ? this.connectedButtons() : this.disconnectedButtons();
    var navBarStyles = {
      width: '100%',
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      borderBottom: 'none',
      borderTop: 'none'
    };

    var heartBeat = this.state.connected ? (
      <ConnectionIndicator allUpdates={this.props.instrumentPanel.streamBundle.pathValues} />
    ) : undefined;

    return (
      <nav className="navbar navbar-default" style={{marginBottom: '0px'}}>
        <a id="menu"></a>
        <form className="navbar-form navbar-left" style={navBarStyles}>
          {buttons}
          <div className="btn-group btn navbar-btn pull-right" style={Object.assign({}, buttonStyle, {cursor: 'default'})}>
            {heartBeat}
          </div>
        </form>
      </nav>
    );

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
        <Button key={i} className={buttonClass + (this.props.instrumentPanel.currentPage === i ? ' btn-primary' : '')}
          onClick={this.setPage.bind(this, i)} disabled={disableButton}>
          {i+1}
        </Button>
      )
    };

    var notificationButton = (
      <Button key={notificationPageId} className={buttonClass + ' navbar-btn-icon' + (this.props.instrumentPanel.currentPage === notificationPageId ? ' btn-primary' : '')}
        onClick={this.setPage.bind(this, notificationPageId)}
        disabled={disableButton}>
        <SvgNotification24px x="0" y="0" width="2em" height="2em" style={notificationIconStyle}/>
      </Button>
    );

    var addPageButton = this.props.model.get().settingsVisible ? (
      <Button className={buttonClass} onClick={this.appendPage} disabled={disableButton}>+</Button>
    ) : undefined;

    var deletePageButton = this.props.model.get().settingsVisible && this.props.instrumentPanel.pages.length > 1? (
      <Button className={buttonClass} onClick={this.onDeletePage}
        disabled={(disableButton | this.props.instrumentPanel.currentPage === notificationPageId) ? true : false}
      >Del current</Button>
    ) : undefined;

    var settingIcon = this.props.model.get().settingsVisible ? (
      <SvgVisibility24px x="0" y="0" width="1em" height="1em"/>) : (
      <SvgBuild24px x="0" y="0" width="1em" height="1em"/>);

    var lockIcon = this.props.model.get().isLocked ? (
      <SvgLock24px x="0" y="0" width="1em" height="1em"/>) : (
      <SvgLockOpen24px x="0" y="0" width="1em" height="1em"/>);

    return (
      <span>
        <div className="btn-group" role="group" style={btnGroupStyle}>
          <Button className={buttonClass} style={buttonStyle}
            onClick={this.toggleLocked}
            disabled={(disableButton | this.props.instrumentPanel.currentPage === notificationPageId) ? true : false}
          >
              {lockIcon}
          </Button>
        </div>
        <div className="btn-group" role="group" style={btnGroupStyle}>
          <Button className={buttonClass} style={buttonStyle}
            onClick={this.toggleSettingsVisible} disabled={disableButton}>
              {settingIcon}
          </Button>
        </div>
        <div className="btn-group" role="group" style={btnGroupStyle}>
          {deletePageButton}
        </div>
        <div className="btn-group" role="group" style={btnGroupStyle}>
          {this.props.instrumentPanel.pages.map(pageButton, this)}
          {addPageButton}
          {notificationButton}
        </div>
        <div className="btn-group" role="group" style={btnGroupStyle}>
          <Button className={buttonClass + (disableButton ? ' btn-warning' : '')} style={buttonStyle}
            onClick={this.toggleHelpVisible}>
            <SvgHelpOutline24px x="0" y="0" width="1em" height="1em"/>
          </Button>
        </div>
        <div className="btn-group pull-right" role="group" style={btnGroupStyle}>
          <Button className={buttonClass} style={buttonStyle}
            onClick={this.connectOrDisconnect} disabled={disableButton}>
            <SvgPowerSettingsNew24px x="0" y="0" width="1em" height="1em"/>
          </Button>
        </div>
      </span>
    );

  }

  disconnectedButtons() {
    const disableButton = (this.props.model.get().helpVisible) ? true : false;

    return (
      <span>
        <Button onClick={this.connectOrDisconnect} style={{margin:5}} disabled={disableButton}>
          {this.state.connecting ? 'Connecting' : 'Connect'} to ws
          {this.props.instrumentPanel.SignalkClient.get('useTLS') ? 's://' : '://'}
          {this.props.instrumentPanel.SignalkClient.get('hostname')}:{this.props.instrumentPanel.SignalkClient.get('port')}
        </Button>
        <div className="btn-group" role="group" style={btnGroupStyle}>
          <Button className={buttonClass + (disableButton ? ' btn-warning' : '')} style={buttonStyle}
            onClick={this.toggleHelpVisible}>
            <SvgHelpOutline24px x="0" y="0" width="1em" height="1em"/>
          </Button>
        </div>
      </span>
    );
  }

  componentDidMount() {
    if (localstorageRetrieveStartConnected()) this.connectOrDisconnect();
  }

  toggleHelpVisible() {
    this.props.model.lens("helpVisible").set(!this.props.model.get().helpVisible);
  }

  toggleLocked() {
    this.props.model.lens("isLocked").set(!this.props.model.get().isLocked);
  }

  toggleSettingsVisible() {
    if ((this.props.model.get().settingsVisible) &&
      (this.props.instrumentPanel.isReloadRequired())) {
      reloadWithLayout(this.props.instrumentPanel.layoutName);
    } else {
        this.props.model.lens("settingsVisible")
          .set(!this.props.model.get().settingsVisible);
        this.props.instrumentPanel.sortNotificationLayout();
      }
  }

  setPage(page) {
    if (page === notificationPageId) {
      this.props.model.lens("isLocked").set(true);
    }
    this.props.instrumentPanel.setPage(page);
  }

  appendPage() {
    this.props.instrumentPanel.setPage(this.props.instrumentPanel.pages.length);
  }
  
  onDeletePage() {
    if (confirm("Are you sure you want to delete page " + (this.props.instrumentPanel.currentPage + 1))) {
      this.props.instrumentPanel.deleteCurrentPage();
    }
  }

  connectOrDisconnect() {
    var that = this;
    const SignalkClient = this.props.instrumentPanel.SignalkClient;
    if (!(this.state.connecting || this.state.connected)) {
      SignalkClient.connect();
      this.setState({
        "connecting": true,
      });
      SignalkClient.on('connect', () => {
        SignalkClient.subscribe({context:'vessels.self',subscribe:[{ path:'*'}]});
        SignalkClient.on('delta', this.props.instrumentPanel.dispatch.bind(this.props.instrumentPanel));
        that.onConnect();
      });
      SignalkClient.on('error', (err) => {
        console.log(err);
        that.setState({
          "connecting": true,
          "connected": false
        });
      });
      SignalkClient.on('hitMaxRetries', () => {
        console.log('hitMaxRetries');
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
        localstorageSaveStartConnected(false);
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
    localstorageSaveStartConnected(true);
    this.props.instrumentPanel.connected();
  }

  onDisconnect() {
    this.setState({
      "connecting": false,
      "connected": false
    });
    reloadWithLayout(this.props.instrumentPanel.layoutName);
  }
};
