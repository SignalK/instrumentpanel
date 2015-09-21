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


var FontAwesome = require('react-fontawesome');    

var React = require('react');

var ConnectForm = require('./connectform');

var IpNavBar = React.createClass({
  mixins: [require('./util/baconmodelmixin')],
  getInitialState: function() {
    return this.props.model.get();
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
              <ButtonGroup>
              {[0,1,2].map( function(index) {
                return (
                  <Button style={{fontSize: "20"}} onClick={that.switchView.bind(this, index)}>
                    <FontAwesome name={that.getViewIconName(index)}/>
                  </Button>
                )
                }
              )}
              </ButtonGroup>
              <Button onClick={this.props.instrumentPanel.disconnect.bind(this.props.instrumentPanel)}>Disconnect</Button>
      </div>
    )
  },
  getViewIconName(index) {
    return this.state.gridSettings.currentView === index ? "sticky-note" : "sticky-note-o";
  },
  disconnectedButtons: function() {
     return (
      <div> 
        <Input type="text" value="localhost:3000" />
        <Button onClick={this.props.instrumentPanel.connect.bind(this.props.instrumentPanel)}>Connect</Button>
      </div>
    )    
  },
  toggleLocked: function() {
    this.props.model.lens("isLocked").set(!this.props.model.get().isLocked);
  },
  togleSettingsVisible: function() {
    this.props.model.lens("settingsVisible").set(!this.props.model.get().settingsVisible);
  },
  switchView: function(viewIndex) {
    this.props.instrumentPanel.setView.call(this.props.instrumentPanel, viewIndex);
  }
});

module.exports = IpNavBar;

