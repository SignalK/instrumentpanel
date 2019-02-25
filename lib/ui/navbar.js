import React from 'react';
import {render} from 'react-dom';
import { Button, FormControl } from 'react-bootstrap';
import { Client } from '@signalk/client';

import ConnectionIndicator from './connectionindicator';
import SvgBuild24px from '../svg/SvgBuild24px';
import SvgVisibility24px from '../svg/SvgVisibility24px';
import SvgLock24px from '../svg/SvgLock24px';
import SvgLockOpen24px from '../svg/SvgLockOpen24px';
import SvgPowerSettingsNew24px from '../svg/SvgPowerSettingsNew24px';
import SvgHelpOutline24px from '../svg/SvgHelpOutline24px';

var SignalkClient = new Client;

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
    try {
      var storedHosts = JSON.parse(window.localStorage['signalKHosts']);
    } catch (ex) {
      console.log("error:" + ex);
    }

    this.state =  {
      hosts: storedHosts || [],
      host: window.localStorage['signalKLastHost'] || location.host,
      connecting: false,
      connected: false
    };
    this.addressChanged = this.addressChanged.bind(this);
    this.connectedButtons = this.connectedButtons.bind(this);
    this.toggleLocked = this.toggleLocked.bind(this);
    this.toggleSettingsVisible = this.toggleSettingsVisible.bind(this);
    this.setPage = this.setPage.bind(this);
    this.appendPage = this.appendPage.bind(this);
    this.onDeletePage = this.onDeletePage.bind(this);
    this.connectOrDisconnect = this.connectOrDisconnect.bind(this);
    this.doConnectOrDisconnect = this.doConnectOrDisconnect.bind(this);
    this.onConnect = this.onConnect.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
    this.addToHosts = this.addToHosts.bind(this);
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
    var pageButton = function(page, i) {
      return (
        <Button key={i} className={buttonClass + (this.props.instrumentPanel.currentPage === i ? ' btn-primary' : '')}
          onClick={this.setPage.bind(this, i)} disabled={disableButton}>
          {i+1}
        </Button>
      )
    };

    var addPageButton = this.props.model.get().settingsVisible ? (
      <Button className={buttonClass} onClick={this.appendPage} disabled={disableButton}>+</Button>
    ) : undefined;

    var deletePageButton = this.props.model.get().settingsVisible && this.props.instrumentPanel.pages.length > 1? (
      <Button className={buttonClass} onClick={this.onDeletePage} disabled={disableButton}>Del current</Button>
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
            onClick={this.toggleLocked} disabled={disableButton}>
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
        <FormControl type="text"
          placeholder="Signal K Server"
          value={this.state.host}
          onChange={this.addressChanged}
          onKeyPress={this.onKeyPress}
          disabled={disableButton}
        />
        <Button onClick={this.connectOrDisconnect} style={{margin:5}} disabled={disableButton}>
          {this.state.connecting ? 'Connecting' : 'Connect'}
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
    if (window.localStorage['signalKHostConnected'] === 'true' &&
        this.state.host) {
      this.connectOrDisconnect();
    }
  }

  onKeyPress(event) {
    if(event.charCode === 13) {// Enter key, prevent form submission & page reload
      event.preventDefault();
    }
  }

  addressChanged(event) {
    this.setState({
      host: event.target.value
    });
  }

  toggleHelpVisible() {
    this.props.model.lens("helpVisible").set(!this.props.model.get().helpVisible);
  }

  toggleLocked() {
    this.props.model.lens("isLocked").set(!this.props.model.get().isLocked);
  }

  toggleSettingsVisible() {
    this.props.model.lens("settingsVisible")
      .set(!this.props.model.get().settingsVisible);
  }

  setPage(page) {
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
    this.doConnectOrDisconnect(this.state.host);
  }

  doConnectOrDisconnect(host) {
    if (host) {
      if (!(this.state.connecting || this.state.connected)) {
        const useSSL = host.startsWith('https://') || window.location.protocol === 'https:'
        const theHost = host.startsWith('https:')  || host.startsWith('http:') ? host.split(':').slice(1).join(':').replace(/\//g, '') : host
        SignalkClient = new Client(host, 3000, useSSL) //only useSSL is relevant, host & port overridden below
        this.props.instrumentPanel.useSSL = useSSL;
        var thisOnConnect = this.onConnect;
        this.setState({
          "connecting": true,
          "host": host,
          "connection": SignalkClient.connectDelta(theHost,
            this.props.instrumentPanel.dispatch.bind(this.props.instrumentPanel),
            function(skConnection) {
              skConnection.subscribeAll();
              thisOnConnect(host);
            },
            this.onDisconnect,
            function(error) {
              console.log(error)
            },
            'self'
          ),
          "hosts": this.addToHosts(host, this.state.hosts)
        });
        try {
          window.localStorage['signalKLastHost'] = host;
          window.localStorage['signalKHostConnected'] = true;
        } catch (ex) {
          console.error(ex)
        }
      } else {
        try {
          window.localStorage['signalKHostConnected'] = false;
        } catch (ex) {
          console.error(ex)
        };
        this.state.connection.disconnect()
        this.onDisconnect();
      }
    }
  }


  onConnect(host) {
    this.setState({
      "connecting": false,
      "connected": true
    });

    this.props.instrumentPanel.connected.call(this.props.instrumentPanel, host);
  }

  onDisconnect() {
    this.setState({
      "connecting": false,
      "connected": false
    });
    location.reload();
  }

  addToHosts(host, hostList) {
    if (hostList.indexOf(host) === -1) {
      hostList.push(host);
      try {
        window.localStorage['signalKHosts'] = JSON.stringify(hostList);
      } catch (ex) {
        console.error(ex)
      }
    }
    return hostList;
  }
};
