import React from 'react';
import FontAwesome from 'react-fontawesome';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';

import ConnectionIndicator from './connectionindicator';

var debug = require('debug')('signalk:instrumentPanel'),
    signalkClient = require('signalk-client').Client;

var signalk = new signalkClient;

var IpNavBar = React.createClass({
  getInitialState: function() {
    try {
      var storedHosts = JSON.parse(window.localStorage['signalKHosts']);
    } catch (ex) {
      debug("error:" + ex);
    }

    var result =  {
      hosts: storedHosts || [],
      host: window.localStorage['signalKLastHost'] || location.host,
      connecting: false,
      connected: false
    };
    return result;
  },

  render: function() {
    var navBarStyles = {
      width: '100%',
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      borderBottom: 'none',
      borderTop: 'none'
    };

    var connectionLabel = this.state.connected ? "Disconnect" : "Connect";
    var themeLabel = this.props.model.lens('themeChooser').get().label;
    return (
      <AppBar
        title={
          <div>
            <span style={{display:'inline-block', width:'100%'}}>Instrument Panel</span>
            <ConnectionIndicator allUpdates={this.props.instrumentPanel.streamBundle.pathValues} style={{paddingTop:19}}/></div>
        }
        onLeftIconButtonTouchTap={this.toggleDrawer}
        iconElementRight={
          <IconMenu
            iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
            targetOrigin={{horizontal:'right', vertical:'top'}}
            anchorOrigin={{horizontal:'right', vertical:'top'}}
          >
            <MenuItem primaryText={connectionLabel} onTouchTap={this.toggleConnection} />
            <MenuItem primaryText={themeLabel} onTouchTap={this.toggleTheme} />
            <MenuItem primaryText="Configure" />
            <MenuItem primaryText="Full Screen" />
          </IconMenu>
      } />
    );
  },

  connectedButtons: function() {
    var buttonStyle = {
      fontSize: 20,
      margin: '4px 2.5px'
    };

    var buttonClass = "btn btn-md btn-default navbar-btn";

    return (
      <span>
        <Button className={buttonClass} style={buttonStyle}
          onClick={this.toggleLocked}>
          <FontAwesome name={this.props.model.get().isLocked ? "lock" : "unlock"} />
        </Button>
        <Button className={buttonClass} style={buttonStyle}
          onClick={this.toggleSettingsVisible}>
          <FontAwesome name={this.props.model.get().settingsVisible ? "tachometer" : "cogs"} />
        </Button>
        <Button className={buttonClass + ' pull-right'} style={buttonStyle}
          onClick={this.connectOrDisconnect}>
          <FontAwesome name="power-off"/>
        </Button>
      </span>
    );
  },

  disconnectedButtons: function() {
    return (
      <span>
        <Input type="text"
          placeholder="Signal K Server"
          value={this.state.host}
          onChange={this.addressChanged}
          onKeyPress={this.onKeyPress}
        />
        <Button onClick={this.connectOrDisconnect} style={{margin:5}}>
          {this.state.connecting ? 'Connecting' : 'Connect'}
        </Button>
      </span>
    );
  },

  componentDidMount: function() {
    if (window.localStorage['signalKHostConnected'] === 'true' &&
        this.state.host) {
      this.connectOrDisconnect();
    }
  },

  onKeyPress: function(event) {
    if(event.charCode === 13) {// Enter key, prevent form submission & page reload
      event.preventDefault();
    }
  },

  addressChanged: function(event) {
    this.setState({
      host: event.target.value
    });
  },

  toggleLocked: function() {
    this.props.model.lens("isLocked").set(!this.props.model.get().isLocked);
  },

  toggleSettingsVisible: function() {
    this.props.model.lens("settingsVisible")
      .set(!this.props.model.get().settingsVisible);
  },

  toggleDrawer: function() {
    this.props.model.lens("drawerOpen")
      .set(!this.props.model.get().drawerOpen);
  },

  toggleTheme: function() {
    this.props.onThemeToggle();
  },

  connectOrDisconnect: function() {
    this.doConnectOrDisconnect(this.state.host);
  },

  doConnectOrDisconnect: function(host) {
    if (host) {
      if (!(this.state.connecting || this.state.connected)) {
        var thisOnConnect = this.onConnect;
        this.setState({
          "connecting": true,
          "host": host,
          "connection": signalk.connectDelta(host,
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
  },


  onConnect: function(host) {
    this.setState({
      "connecting": false,
      "connected": true
    });

    this.props.instrumentPanel.connected.call(this.props.instrumentPanel, host);
  },

  onDisconnect: function() {
    this.setState({
      "connecting": false,
      "connected": false
    });
  },

  addToHosts: function(host, hostList) {
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
});

module.exports = IpNavBar;
