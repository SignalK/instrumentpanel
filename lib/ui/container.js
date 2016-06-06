import React from 'react';
import ReactGridLayout, {WidthProvider} from 'react-grid-layout';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ConnectionDialog from './connectiondialog';
import DrawerMenu from './drawermenu';
import NavBar from './navbar';
import SettingsPanel from './settings/settingspanel';

let WReactGridLayout = WidthProvider(ReactGridLayout);

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
          <DrawerMenu
            model={this.props.model}
            instrumentPanel={this.props.instrumentPanel} />
          <ConnectionDialog
            model={this.props.model}
            instrumentPanel={this.props.instrumentPanel} />
          <NavBar
            model={this.props.model}
            instrumentPanel={this.props.instrumentPanel}
            onThemeToggle={this.props.onThemeToggle} />
          {this.state.settingsVisible ?
            <SettingsPanel
              instrumentPanel={this.props.instrumentPanel} /> :
            <WReactGridLayout
              className='layout'
              layout={this.state.gridSettings.layout}
              children={this.state.gridSettings.activeWidgets.map(wrapInDiv)}
              cols={Math.round(width/320*2)}
              rowHeight={50}
              isDraggable={!this.state.isLocked}
              isResizable={!this.state.isLocked}
              onLayoutChange={this.props.instrumentPanel.onLayoutChange
                .bind(this.props.instrumentPanel)} />
          }
        </div>
      </MuiThemeProvider>
    );
  }
});
