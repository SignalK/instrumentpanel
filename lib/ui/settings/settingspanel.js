import React from 'react';
import PropTypes from 'prop-types';
import {Panel, Button, Alert, SplitButton, MenuItem} from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import WidgetList from './widgetlist';
import PreferredUnits from './preferredunits';
import ResetSettings from './resetsettings';
import ColorSchemeSettings from './colorschemesettings';
import ExportImportSettingsUnits from './exportimport';

const settingsMenu = {
  ST_DisplayValue: 'Display Value',
  ST_PrefUnits:    'Preferred Units',
  ST_DarkMode:     'Dark Mode',
  ST_ResetIP:      'Reset',
  ST_ExportImport: 'Export / Import'
};

export default class SettingsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'ST_DisplayValue'
    }
    this.handleSelect = this.handleSelect.bind(this);
    this.getContentBySettingsKey = this.getContentBySettingsKey.bind(this);
  }

  render() {
    var reloadMessage =
      (<Alert bsStyle="warning"><strong>Reload is required</strong> This will be done when you leave settings tab.</Alert>);
    var menuItems = Object.getOwnPropertyNames(settingsMenu).map( item => {
      return <MenuItem key={item} eventKey={item} onSelect={this.handleSelect} active={this.state.activeKey === item}>{settingsMenu[item]}</MenuItem>
    });
    return (
      <React.Fragment>
        {(this.props.instrumentPanel.isReloadRequired())? reloadMessage : undefined}
        <Panel>
          <Panel.Heading>
            <div className="pull-left">
              &nbsp;Settings for:&nbsp;
              <SplitButton
                bsStyle="default"
                title={settingsMenu[this.state.activeKey]}
                key="settingsKey"
                id="settingsDropdown"
                className="navbar-btn">
                {menuItems}
              </SplitButton>
            </div>
          </Panel.Heading>
          <Panel.Body>{this.getContentBySettingsKey()}</Panel.Body>
        </Panel>
      </React.Fragment>
    )
  }

  getContentBySettingsKey() {
    if (this.state.activeKey === 'ST_DisplayValue') {
      return (<WidgetList instrumentPanel={this.props.instrumentPanel}/>)
    } else if (this.state.activeKey === 'ST_PrefUnits') {
      return(<PreferredUnits instrumentPanel={this.props.instrumentPanel}/>)
    } else if (this.state.activeKey === 'ST_DarkMode') {
      return (<ColorSchemeSettings instrumentPanel={this.props.instrumentPanel}/>)
    } else if (this.state.activeKey === 'ST_ResetIP') {
      return (<ResetSettings instrumentPanel={this.props.instrumentPanel}/>)
    } else if (this.state.activeKey === 'ST_ExportImport') {
      return (<ExportImportSettingsUnits instrumentPanel={this.props.instrumentPanel}/>);
    }
    return null;
  }

  handleSelect(selectedKey) {
    this.setState({
      activeKey: selectedKey
    });
  }
};

SettingsPanel.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};
