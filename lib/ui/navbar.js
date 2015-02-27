var rb = require('react-bootstrap');

var Navbar = rb.Navbar,
    Nav = rb.Nav,
    NavItem = rb.NavItem,
    DropdownButton = rb.DropdownButton,
    MenuItem = rb.MenuItem,
    Button = rb.Button,
    Input = rb.Input,
    OverlayTrigger = rb.OverlayTrigger,
    Tooltip = rb.Tooltip;

var Icon = require('react-font-awesome').Icon;    

var React = require('react');

var ConnectForm = require('./connectform');

var IpNavBar = React.createClass({
  mixins: [require('./util/baconmodelmixin')],
  getInitialState: function() {
    return this.props.model.get();
  },    
  render: function() {
    return (
    <Navbar>
      <Nav >
      <OverlayTrigger placement="right" overlay={<Tooltip>{this.state.isLocked ? "Modify layout" : "Lock layout"}</Tooltip>}>
        <Button style={{fontSize: "20"}} onClick={this.toggleLocked}><Icon type={this.state.isLocked ? "lock" : "unlock"} /></Button>
      </OverlayTrigger>
      <OverlayTrigger placement="right" overlay={<Tooltip>Settings</Tooltip>}>
        <Button style={{fontSize: "20"}} onClick={this.togleSettingsVisible}><Icon type={this.state.settingsVisible ? "cog" : "cogs"}/></Button>
      </OverlayTrigger>
      </Nav>

      <ConnectForm dispatch={this.props.dispatch} allUpdates={this.props.allUpdates}></ConnectForm>

    </Navbar>
    );
  },
  toggleLocked: function() {
    this.props.model.lens("isLocked").set(!this.props.model.get().isLocked);
  },
  togleSettingsVisible: function() {
    this.props.model.lens("settingsVisible").set(!this.props.model.get().settingsVisible);
  }
});

module.exports = IpNavBar;

