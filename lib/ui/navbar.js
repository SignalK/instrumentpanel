var rb = require('react-bootstrap');

var Navbar = rb.Navbar,
    Nav = rb.Nav,
    NavItem = rb.NavItem,
    DropdownButton = rb.DropdownButton,
    MenuItem = rb.MenuItem,
    Button = rb.Button,
    Input = rb.Input;

var Icon = require('react-font-awesome').Icon;    

var React = require('react');

var IpNavBar = React.createClass({
  mixins: [require('./util/baconmodelmixin')],
  getInitialState: function() {
    return this.props.model.get();
  },    
  render: function() {
    return (
    <Navbar>
      <Nav>
      <Button onClick={this.toggleLocked}><Icon type={this.state.isLocked ? "lock" : "unlock"} /></Button>
      <Button onClick={this.togleSettingsVisible}><Icon type={this.state.settingsVisible? "cog" : "cogs"}/></Button>

      <div>
      <Input type="text" buttonAfter={
        <div>
        <Button>Connect</Button>
        <DropdownButton title="&nbsp;">
              <MenuItem key="1">Item</MenuItem>
            </DropdownButton>
        </div>
        } />
      </div>

      </Nav>
      <Nav className="navbar-right">
      </Nav>
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

