import Bacon from 'baconjs';
import BaconModel from 'bacon.model';
import React from 'react';
import ReactDOM from 'react-dom';

import Container from './ui/container';
import InstrumentPanel from './ui/instrumentpanel';
import StreamBundle from './streambundle';
import ThemeChooser from './themechooser';

let streamBundle = new StreamBundle();
let instrumentPanel = new InstrumentPanel(streamBundle);
let themeChooser = new ThemeChooser();

let model = Bacon.Model.combine({
  isLocked: Bacon.Model(true),
  settingsVisible: Bacon.Model(false),
  drawerOpen: Bacon.Model(false),
  gridSettings: instrumentPanel.gridSettingsModel,
  themeChooser: Bacon.Model(themeChooser),
  theme: themeChooser.getCurrentThemeModel()
});

// Needed for onTouchTap
// See https://github.com/callemall/material-ui
let injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

function toggleTheme() {
  themeChooser.toggleTheme();
}

const App = () => (
  <Container model={model} instrumentPanel={instrumentPanel} onThemeToggle={toggleTheme} />
);

ReactDOM.render(<App />, document.getElementById('content'));
