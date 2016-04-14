var debug = require('debug')('signalk:instrumentPanel'),
    rb = require('react-bootstrap'),
    signalkClient = require('signalk-client').Client,
    ConnectionIndicator = require('./connectionindicator'),
    FontAwesome = require('react-fontawesome'),
    React = require('react');

var Button = rb.Button,
    Input = rb.Input;

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
    if(this.state.connected) {
      return this.connectedButtons();
    }

    return this.disconnectedButtons();
  },

  connectedButtons: function() {
    var buttonStyle = {
      fontSize: 20,
      margin: '4px 2.5px'
    };

    var buttonClass = "btn btn-md btn-default navbar-btn";

    return (
      <nav className="navbar navbar-default" style={{padding: 8}}>
        <Button className={buttonClass} style={buttonStyle}
          onClick={this.toggleLocked}>
          <FontAwesome name={this.state.isLocked ? "lock" : "unlock"} />
        </Button>
        <Button className={buttonClass} style={buttonStyle}
          onClick={this.toggleSettingsVisible}>
          <FontAwesome name={this.state.settingsVisible ? "cog" : "cogs"} />
        </Button>
        <Button className={buttonClass} style={{margin:5}}
          onClick={this.connectOrDisconnect}>
          Disconnect
        </Button>
      </nav>
    );
  },

  disconnectedButtons: function() {
    return (
      <nav className="navbar navbar-default">
        <form className="navbar-form navbar-left">
          <Input type="text"
            placeholder="Signal K Server"
            value={this.state.host}
            onChange={this.addressChanged}
            onKeyPress={this.onKeyPress}
          />
          <Button onClick={this.connectOrDisconnect} style={{margin:5}}>
            {this.state.connecting ? 'Connecting' : 'Connect'}
          </Button>
        </form>
      </nav>
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

  connectOrDisconnect: function() {
    this.doConnectOrDisconnect(this.state.host);
  },

  doConnectOrDisconnect: function(host) {
    if (host) {
      if(!(this.state.connecting || this.state.connected)) {
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
            this.onDisconnect),
          "hosts": this.addToHosts(host, this.state.hosts)
        });
        window.localStorage['signalKLastHost'] = host;
        window.localStorage['signalKHostConnected'] = true;
      } else {
        window.localStorage['signalKHostConnected'] = false;
        this.state.connection.disconnect();
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
      window.localStorage['signalKHosts'] = JSON.stringify(hostList);
    }
    return hostList;
  }
});

module.exports = IpNavBar;
