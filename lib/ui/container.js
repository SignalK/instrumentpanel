import React from 'react';
import ReactGridLayout, {WidthProvider} from 'react-grid-layout';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import IpNavBar from './navbar';
import SettingsPanel from './settings/settingspanel';
import {spacing, typography, zIndex} from 'material-ui/styles';
import {cyan500} from 'material-ui/styles/colors';

let WReactGridLayout = WidthProvider(ReactGridLayout);

const styles = {
  logo: {
    cursor: 'pointer',
    fontSize: 24,
    color: typography.textFullWhite,
    lineHeight: `${spacing.desktopKeylineIncrement}px`,
    fontWeight: typography.fontWeightLight,
    backgroundColor: cyan500,
    paddingLeft: spacing.desktopGutter,
    marginBottom: 8,
  },
};

export default React.createClass({
  mixins: [require('../util/baconmodelmixin')],

  getInitialState: function() {
    return this.props.model.get();
  },

  render: function() {
    let wrapInDiv = function(widget, i) {
      return React.createElement('div', {key: widget.key}, widget);
    };

    const width = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;

    const height = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight;

    return (
      <MuiThemeProvider muiTheme={this.props.model.lens('theme').get()}>
        <div>
          <IpNavBar model={this.props.model} instrumentPanel={this.props.instrumentPanel} onThemeToggle={this.props.onThemeToggle}></IpNavBar>
          <Drawer open={this.state.drawerOpen} docked={false} onRequestChange={(drawerOpen) => this.setState({drawerOpen})}>
            <div style={styles.logo}>
              Instrument Panel
            </div>
          </Drawer>
          {this.state.settingsVisible ?
            <SettingsPanel instrumentPanel={this.props.instrumentPanel}></SettingsPanel> :
            <WReactGridLayout
              className="layout"
              layout={this.state.gridSettings.layout}
              children={this.state.gridSettings.activeWidgets.map(wrapInDiv)}
              cols={Math.round(width/320*2)}
              rowHeight={50}
              isDraggable={!this.state.isLocked}
              isResizable={!this.state.isLocked}
              onLayoutChange={this.props.instrumentPanel.onLayoutChange.bind(this.props.instrumentPanel)} />
          }
        </div>
      </MuiThemeProvider>
    );
  }
});
