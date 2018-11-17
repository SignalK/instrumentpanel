var debug = require('debug')('signalk:instrumentPanel'),
    rb = require('react-bootstrap'),
    signalkClient = require('@signalk/client').Client,
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
    var buttons = this.state.connected ? this.connectedButtons() : this.disconnectedButtons();
    var navBarStyles = {
      width: '100%',
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      borderBottom: 'none',
      borderTop: 'none'
    }
    return (
      <nav className="navbar navbar-default">
        <form className="navbar-form navbar-left" style={navBarStyles}>
          {buttons}
          <p className="navbar-text pull-right" style={{marginRight: 0}}>
            <ConnectionIndicator allUpdates={this.props.instrumentPanel.streamBundle.pathValues} />
          </p>
        </form>
      </nav>
    );
  },

  connectedButtons: function() {
    var buttonStyle = {
      fontSize: 20,
      margin: '4px 2.5px'
    };

    var buttonClass = "btn btn-md btn-default navbar-btn";

    var pageButton = function(page, i) {
      return (
        <Button key={i} className={buttonClass + (this.props.instrumentPanel.currentPage === i ? ' btn-primary' : '')}
          onClick={this.setPage.bind(this, i)}>
          {i+1}
        </Button>
      )
    };

    var addPageButton = this.props.model.get().settingsVisible ? (
      <Button className={buttonClass} onClick={this.appendPage}>+</Button>
    ) : undefined;

    var deletePageButton = this.props.model.get().settingsVisible && this.props.instrumentPanel.pages.length > 1? (
      <Button className={buttonClass} onClick={this.onDeletePage}>Del current</Button>
    ) : undefined;

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
        {deletePageButton}
        <div className="btn-group" role="group">
        {this.props.instrumentPanel.pages.map(pageButton, this)}
        {addPageButton}
        </div>
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

  setPage: function(page) {
    this.props.instrumentPanel.setPage(page);
  },

  appendPage: function() {
    this.props.instrumentPanel.setPage(this.props.instrumentPanel.pages.length);
  },
  onDeletePage: function() {
    if (confirm("Are you sure you want to delete page " + (this.props.instrumentPanel.currentPage + 1))) {
      this.props.instrumentPanel.deleteCurrentPage();
    }
  },

  connectOrDisconnect: function() {
    this.doConnectOrDisconnect(this.state.host);
  },

  doConnectOrDisconnect: function(host) {
    if (host) {
      if (!(this.state.connecting || this.state.connected)) {
        const useSSL = host.startsWith('https://') || window.location.protocol === 'https:'
        const theHost = host.startsWith('https:')  || host.startsWith('http:') ? host.split(':').slice(1).join(':').replace(/\//g, '') : host
        signalk = new signalkClient(host, 3000, useSSL) //only useSSL is relevant, host & port overridden below
        this.props.instrumentPanel.useSSL = useSSL;
        var thisOnConnect = this.onConnect;
        this.setState({
          "connecting": true,
          "host": host,
          "connection": signalk.connectDelta(theHost,
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
    location.reload();
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
