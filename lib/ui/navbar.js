import React from 'react';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import MenuItem from 'material-ui/MenuItem';
import ExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

import ConnectionIndicator from './connectionindicator';

var NavBar = React.createClass({
  render: function() {
    const connectionLabel = this.props.model.lens('isConnected').get() ? 'Disconnect' : 'Connect';
    const themeLabel = this.props.model.lens('themeChooser').get().label;
    const layoutLabel = this.props.model.get().isLocked ? 'Unlock Layout' : 'Lock Layout';
    const settingsLabel = this.props.model.get().settingsVisible ? 'Return to Panel' : 'Configure' ;

    return (
      <Toolbar>
        <ToolbarGroup firstChild={true}>
          <IconButton onTouchTap={this.toggleDrawer}>
            <MenuIcon />
          </IconButton>
        </ToolbarGroup>
        <ToolbarTitle text='Instrument Panel' />
        <ToolbarGroup lastChild={true}>
          <ConnectionIndicator
            allUpdates={this.props.instrumentPanel.streamBundle.pathValues} />
          <IconMenu
            iconButtonElement={<IconButton><ExpandMoreIcon /></IconButton>}
            targetOrigin={{horizontal:'right', vertical:'top'}}
            anchorOrigin={{horizontal:'right', vertical:'top'}}
          >
            <MenuItem primaryText={connectionLabel} onTouchTap={this.toggleConnect} />
            <MenuItem primaryText={themeLabel} onTouchTap={this.toggleTheme} />
            <MenuItem primaryText={settingsLabel} onTouchTap={this.toggleSettingsVisible} />
            <MenuItem primaryText={layoutLabel} onTouchTap={this.toggleLocked} />
            <MenuItem primaryText='Full Screen' onTouchTap={this.goFullscreen} />
          </IconMenu>
        </ToolbarGroup>
      </Toolbar>
    );
  },

  toggleConnect: function() {
    if (this.props.model.lens('isConnected').get()) {
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
