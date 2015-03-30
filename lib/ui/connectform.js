var React = require('react');
var rb = require('react-bootstrap');

var DropdownButton = rb.DropdownButton,
    MenuItem = rb.MenuItem,
    Button = rb.Button,
    Input = rb.Input;

var Icon = require('react-font-awesome').Icon;    

var signalk = require('../signalk');

var ConnectionIndicator = require('./connectionindicator');




var ConnectForm = React.createClass({
  getInitialState: function() {
    try {
      var storedHosts = JSON.parse(window.localStorage['signalKHosts']);
    } catch (ex) {
      debug("error:" + ex);
    }

    return {
      hosts: storedHosts || [],
      host: window.localStorage['signalKLastHost'] || window.location.host,
      connecting: false,
      connected: false
    };
  },    
  render: function() {
    var doConnectOrDisconnect = this.doConnectOrDisconnect;
    return (
      <div class="form-group">
          <ConnectionIndicator allUpdates={this.props.instrumentPanel.streamBundle.pathValues} style={{position:"absolute"}}/>
      <form class="navbar-form">
      <Input type="text" 
        style={{width:"40%", float:"right"}} 
        value={this.state.host} 
        onChange={this.addressChanged} 
        onKeyPress={this.onKeyPress}
        disabled={this.state.connected}
        buttonAfter={
        <div>
          <DropdownButton title="&nbsp;" disabled={this.state.connected}>
              {
                this.state.hosts.map(function(host, i) {
                  return <MenuItem key={i} onSelect={function(){doConnectOrDisconnect(host)}}>{host}</MenuItem>
                })
              }
              </DropdownButton>
          <Button onClick={this.connectOrDisconnect} >{this.state.connected ? 'Disconnect' : this.state.connecting ? 'Connecting' : 'Connect'}</Button>
          </div>
        } />
      </form>
      </div>
    );
  },
  componentDidMount: function() {
    if (window.localStorage['signalKHostConnected'] === 'true') {
      this.connectOrDisconnect();
    }
  },
  onKeyPress: function(event) {
    if (event.charCode === 13) // Enter key, prevent form submission & page reload
      event.preventDefault();
  },
  addressChanged: function(event) {
    this.setState({
      host: event.target.value
    });
  },
  connectOrDisconnect: function() {
    this.doConnectOrDisconnect(this.state.host);
  },
  doConnectOrDisconnect: function(host) {
    if (!this.state.connecting && !this.state.connected) {
      this.setState({
        "connecting": true,
        "host": host,
        "connection":signalk.connectDelta(host,
          this.props.instrumentPanel.dispatch.bind(this.props.instrumentPanel),
          this.onConnect.bind(this, host),
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

module.exports = ConnectForm;

