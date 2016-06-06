import React from 'react';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import ConnectionIndicator from './connectionindicator';

var NavBar = React.createClass({
  render: function() {
    const connectionLabel = this.props.instrumentPanel.isConnected ? 'Disconnect' : 'Connect';
    const themeLabel = this.props.model.lens('themeChooser').get().label;
    const layoutLabel = this.props.model.get().isLocked ? 'Unlock Layout' : 'Lock Layout';
    const settingsLabel = this.props.model.get().settingsVisible ? 'Configure' : 'Return to Panel';

    return (
      <AppBar
        title={
          <div>
            <span style={{display:'inline-block', width:'100%'}}>
              Instrument Panel
            </span>
            <ConnectionIndicator
              allUpdates={this.props.instrumentPanel.streamBundle.pathValues} />
          </div>
        }
        onLeftIconButtonTouchTap={this.toggleDrawer}
        iconElementRight={
          <IconMenu
            iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
            targetOrigin={{horizontal:'right', vertical:'top'}}
            anchorOrigin={{horizontal:'right', vertical:'top'}}
          >
            <MenuItem primaryText={connectionLabel} onTouchTap={this.toggleConnect} />
            <MenuItem primaryText={themeLabel} onTouchTap={this.toggleTheme} />
            <MenuItem primaryText='Settings' onTouchTap={this.toggleSettingsVisible} />
            <MenuItem primaryText={layoutLabel} onTouchTap={this.toggleLocked} />
            <MenuItem primaryText='Full Screen' onTouchTap={this.goFullscreen} />
          </IconMenu>
      } />
    );
  },

  toggleConnect: function() {
    if (this.props.instrumentPanel.isConnected) {
      this.props.instrumentPanel.disconnect();
    } else {
      this.props.model.lens('showConnect').set(true);
    }
  },

  toggleLocked: function() {
    this.props.model.lens('isLocked').set(!this.props.model.get().isLocked);
  },

  toggleSettingsVisible: function() {
    this.props.model.lens('settingsVisible')
      .set(!this.props.model.get().settingsVisible);
  },

  toggleDrawer: function() {
    this.props.model.lens('drawerOpen')
      .set(!this.props.model.get().drawerOpen);
  },

  toggleTheme: function() {
    this.props.onThemeToggle();
  },

  onConnect: function() {
    this.setState({'connected': true});
  },

  onDisconnect: function() {
    this.setState({'connected': false});
  }
});

module.exports = NavBar;
