var rb = require('react-bootstrap');

var Navbar = rb.Navbar,
    Nav = rb.Nav,
    NavItem = rb.NavItem,
    DropdownButton = rb.DropdownButton,
    MenuItem = rb.MenuItem,
    Button = rb.Button,
    ButtonGroup = rb.ButtonGroup,
    Input = rb.Input,
    OverlayTrigger = rb.OverlayTrigger,
    CollapsibleNav = rb.CollapsibleNav,
    Tooltip = rb.Tooltip;

var debug = require('debug')('signalk:instrumentPanel');


var FontAwesome = require('react-fontawesome');

var React = require('react');

var signalkClient = require('signalk-client').Client;
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
    var buttonGroupStyle = {
      padding: 1
    }
    return (
      <div>
          {this.state.connected ? this.connectedButtons() : this.disconnectedButtons()}
      </div>
    );
  },
  connectedButtons: function() {
    var that = this;
    return (
      <div>
              <ButtonGroup>
              <Button style={{fontSize: "20"}} onClick={this.toggleLocked}>
                <FontAwesome name={this.state.isLocked ? "lock" : "unlock"} />
              </Button>
              <Button style={{fontSize: "20"}} onClick={this.togleSettingsVisible}>
                <FontAwesome name={this.state.settingsVisible ? "cog" : "cogs"}/>
              </Button>
              </ButtonGroup>

              <Button onClick={this.connectOrDisconnect} >{this.state.connected ? 'Disconnect' : this.state.connecting ? 'Connecting' : 'Connect'}</Button>
      </div>
    )
  },
  disconnectedButtons: function() {
     return (
      <div>
        <Input
          value={this.state.host}
          type="text"
          onChange={this.addressChanged}
          onKeyPress={this.onKeyPress}
        />
        <Button onClick={this.connectOrDisconnect} >{this.state.connected ? 'Disconnect' : this.state.connecting ? 'Connecting' : 'Connect'}</Button>
      </div>
    )
  },
  getViewIconName: function(index) {
    return this.state.gridSettings.currentView === index ? "sticky-note" : "sticky-note-o";
  },
  componentDidMount: function() {
    if (window.localStorage['signalKHostConnected'] === 'true' && this.state.host) {
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
  toggleLocked: function() {
    this.props.model.lens("isLocked").set(!this.props.model.get().isLocked);
  },
  togleSettingsVisible: function() {
    this.props.model.lens("settingsVisible").set(!this.props.model.get().settingsVisible);
  },
  switchView: function(viewIndex) {
    this.props.instrumentPanel.setView.call(this.props.instrumentPanel, viewIndex);
  },
  connectOrDisconnect: function() {
    this.doConnectOrDisconnect(this.state.host);
  },
  doConnectOrDisconnect: function(host) {
    if (host) {
      if (!this.state.connecting && !this.state.connected) {
        var thisOnConnect = this.onConnect;
        this.setState({
          "connecting": true,
          "host": host,
          "connection":signalk.connectDelta(host,
            this.props.instrumentPanel.dispatch.bind(this.props.instrumentPanel),
            function(skConnection){
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
