/*
 * Color Scheme settings
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import {SplitButton, MenuItem} from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import {
  removeKeysByName,
  retrieveColorScheme,
  storeColorScheme
} from '../../util/localstorage';

const menuSettings = {
  mainbar: {title: 'By main bar icon', help: 'The dark mode is set by icon in main bar'},
  os: {title: 'By OS settings', help: 'The dark mode follows your OS settings'},
  skpath: {title: 'By Signal K Mode', help: 'The dark mode follows the value of Signal K path: /vessels/self/environment/mode'}
}

export const CS_BY_MAINBAR = "mainbar";
export const CS_BY_OS = "os";
export const CS_BY_SKPATH = "skpath";
export const CS_LIGHT = "light";
export const CS_DARK = "dark";

export default class ColorSchemeSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = retrieveColorScheme();
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(selectedKey) {
    var newColorSchemeToSave = this.state;
    newColorSchemeToSave.colorSchemeSetBy = selectedKey;
    newColorSchemeToSave.colorSchemeCurrent = this.props.instrumentPanel.getColorSchemeCurrent();
    this.setState({colorSchemeSetBy: selectedKey});
    this.props.instrumentPanel.setColorSchemeSetBy(selectedKey);
    if (selectedKey === CS_BY_OS) this.props.instrumentPanel.reloadRequired();
    storeColorScheme(newColorSchemeToSave);
  }

  render() {
    var menuItems = Object.keys(menuSettings).map(key => {
      return <MenuItem key={key} eventKey={key} onSelect={this.handleSelect} active={this.state.colorSchemeSetBy === key}>{menuSettings[key].title}</MenuItem>
    });
    var OsSupportText = (
      (this.state.colorSchemeSetBy === CS_BY_OS) &&
      (! this.props.instrumentPanel.colorSchemeTool.hasNativeSupport)
    ) ? '<strong> but your OS does not support it</strong>' : '';
    return (
      <div className="colorSchemeSettings">
        <div>Select how the dark mode will be activated:</div>
        <SplitButton
          bsStyle="default"
          title={menuSettings[this.state.colorSchemeSetBy].title}
          key="colorSchemeKey"
          id="colorSchemeDropdown"
          className="navbar-btn">
          {menuItems}
        </SplitButton>
        <div>
          {menuSettings[this.state.colorSchemeSetBy].help + OsSupportText}
        </div>
      </div>
    );

  }
};

ColorSchemeSettings.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};
