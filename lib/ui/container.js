import React from 'react';
import ReactGridLayout, {WidthProvider} from 'react-grid-layout';
import hotkey from 'react-hotkey';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import events from 'material-ui/utils/events';
import ConnectionDialog from './connectiondialog';
import DrawerMenu from './drawermenu';
import NavBar from './navbar';
import Footer from './footer';
import SettingsPanel from './settings/settingspanel';

let WReactGridLayout = WidthProvider(ReactGridLayout);

hotkey.activate();

export default React.createClass({
  mixins: [require('../util/baconmodelmixin')],

  getInitialState: function() {
    return this.props.model.get();
  },

  componentDidMount: function() {
    hotkey.addHandler(this.hotkeyHandler);
    events.on(document, 'mozfullscreenchange', this.setFullscreen);
  },

  setFullscreen: function(e) {
    var isFullscreen = document.fullScreen ||
                       document.mozFullScreen ||
                       document.webkitIsFullScreen;
    this.setState({isFullscreen: isFullscreen});
  },

  render: function() {
    console.log('render');
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
          {!this.state.isFullscreen ? <Footer /> : ''}
        </div>
      </MuiThemeProvider>
    );
  },

  hotkeyHandler: function(e) {
    if(this.props.model.lens('showConnect').get()) {
      return;
    }

    switch(e.key) {
      case 'c':
        this.connect();
        break;
      case 'd':
        this.disconnect();
        break;
      case 'f':
        this.fullscreen();
        break;
      case 'n':
        this.lightsOut();
        break;
      case 's':
        this.settings();
        break;
      case 'u':
        this.unlock();
        break;
      default:
        console.log(e.key);
        break;
    }
  },

  connect: function() {
    this.props.model.lens('showConnect').set(true);
  },

  disconnect: function() {
    console.log('disconnect');
  },

  fullscreen: function() {
    document.fullscreenEnabled =
      document.fullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.documentElement.webkitRequestFullScreen;

    function requestFullscreen( element ) {
      if ( element.requestFullscreen ) {
        element.requestFullscreen();
      } else if ( element.mozRequestFullScreen ) {
        element.mozRequestFullScreen();
      } else if ( element.webkitRequestFullScreen ) {
        element.webkitRequestFullScreen( Element.ALLOW_KEYBOARD_INPUT );
      }
    }

    if ( document.fullscreenEnabled ) {
      requestFullscreen( document.documentElement );
    }
  },

  lightsOut: function() {
    this.props.onThemeToggle();
  },

  settings: function() {
    this.props.model.lens('settingsVisible')
      .set(!this.props.model.get().settingsVisible);
  },

  unlock: function() {
    this.props.model.lens('isLocked').set(!this.props.model.get().isLocked);
  }
});
