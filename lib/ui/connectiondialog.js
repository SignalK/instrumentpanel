import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export default React.createClass({
  mixins: [require('../util/baconmodelmixin')],

  getInitialState: function() {
    return this.props.model.get();
  },

  handleConnect: function() {
    let host = this.state.newHost || this.state.host;
    this.props.instrumentPanel.connect(host);
    this.props.model.lens('showConnect').set(false);
  },

  handleCancel: function() {
    this.props.model.lens('showConnect').set(false);
  },

  handleHostChange: function(event, index, value) {
    this.setState({host: value, newHost: undefined});
  },

  handleNewHostChange: function(event) {
    this.setState({host: undefined, newHost: event.target.value});
  },

  render: function() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCancel}
      />,
      <FlatButton
        label="Connect"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleConnect}
      />,
    ];

    let hosts = this.props.instrumentPanel.getHosts().map(function(host, i) {
      return <MenuItem key={i} value={host} primaryText={host} />;
    });

    return (
      <Dialog title="Connect to Signal K Host"
        actions={actions}
        modal={false}
        open={this.state.showConnect}
        onRequestClose={this.handleClose}
      >
        Choose a Signal K server to connect to or enter a new one.<br />
        <SelectField floatingLabelText="Choose Previous Server"
          onChange={this.handleHostChange} value={this.state.host}>
          {hosts}
        </SelectField><br />
        <TextField id="new-server"
          hintText="New Signal K Server"
          value={this.state.newHost || ''}
          onChange={this.handleNewHostChange} />
      </Dialog>
    );
  }
});
