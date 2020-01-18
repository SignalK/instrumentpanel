import React from 'react';
import PropTypes from 'prop-types';
import {Panel, ButtonGroup, Button, Alert, SplitButton, MenuItem} from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import WidgetList from './widgetlist';
import PreferredUnits from './preferredunits';
import ResetSettings from './resetsettings';
import ColorSchemeSettings from './colorschemesettings';
import {
  widgetActiveModes,
  notificationPageId,
  WA_BASE_DATA,
  WA_ALL,
  WA_NO
} from './constants'

const settingsMenu = {
  ST_DisplayValue: 'Display Value',
  ST_PrefUnits:    'Preferred Units',
  ST_DarkMode:     'Dark Mode',
  ST_ResetIP:      'Reset Instrument Panel'
};

const widgetAutoShowMenu = {
  [WA_BASE_DATA]: 'Base paths shown',
  [WA_ALL]:       'Shown',
  [WA_NO]:        'Hidden'
};

export default class SettingsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'ST_DisplayValue',
      displayMessage: false,
      widgetActiveMode: this.props.instrumentPanel.widgetActiveMode
    }
    this.handleSelect = this.handleSelect.bind(this);
    this.handlewidgetActiveMode = this.handlewidgetActiveMode.bind(this);
    this.handleHideShowAllPaths = this.handleHideShowAllPaths.bind(this);
    this.handleShowAllPaths = this.handleShowAllPaths.bind(this);
    this.handleHideAllPaths = this.handleHideAllPaths.bind(this);
    this.getButtonBySettingsKey = this.getButtonBySettingsKey.bind(this);
    this.getContentBySettingsKey = this.getContentBySettingsKey.bind(this);
    this.applyPreferredUnits = this.applyPreferredUnits.bind(this);
    this.resetPreferredUnits = this.resetPreferredUnits.bind(this);
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
              &nbsp;Select settings for:&nbsp;
              <SplitButton
                bsStyle="default"
                title={settingsMenu[this.state.activeKey]}
                key="settingsKey"
                id="settingsDropdown"
                className="navbar-btn">
                {menuItems}
              </SplitButton>
            </div>
            {this.getButtonBySettingsKey()}
          </Panel.Heading>
          <Panel.Body>{this.getContentBySettingsKey()}</Panel.Body>
        </Panel>
      </React.Fragment>
    )
  }

  getButtonBySettingsKey() {
    if (this.state.activeKey === 'ST_DisplayValue') {
      return (
        <React.Fragment>
          &nbsp;
          <ButtonGroup className="pull-right">
            <Button bsClass="navbar-btn" className="btn" onClick={this.handleHideAllPaths}>Hide all paths</Button>
            <Button bsClass="navbar-btn" className="btn" onClick={this.handleShowAllPaths}>Show all paths</Button>
          </ButtonGroup>
          &nbsp;
          <div className="pull-left">
            &nbsp;<b>New</b> Paths Display&nbsp;
            <SplitButton
              bsStyle="default"
              title={widgetAutoShowMenu[this.state.widgetActiveMode]}
              key="widgetActiveModeKey"
              id="widgetActiveModeDropdown"
              className="navbar-btn">
              <MenuItem key={0} eventKey={WA_BASE_DATA} onSelect={this.handlewidgetActiveMode} active={this.state.widgetActiveMode === WA_BASE_DATA}>{widgetAutoShowMenu[WA_BASE_DATA]} (see help)</MenuItem>
              <MenuItem key={1} eventKey={WA_ALL} onSelect={this.handlewidgetActiveMode} active={this.state.widgetActiveMode === WA_ALL}>{widgetAutoShowMenu[WA_ALL]}</MenuItem>
              <MenuItem key={2} eventKey={WA_NO} onSelect={this.handlewidgetActiveMode} active={this.state.widgetActiveMode === WA_NO}>{widgetAutoShowMenu[WA_NO]}</MenuItem>
            </SplitButton>
            &nbsp;on grid&nbsp;
          </div>
        </React.Fragment>
      )
    } else if (this.state.activeKey === 'ST_PrefUnits') {
      return(
        <ButtonGroup className="pull-right">
          <Button bsClass="navbar-btn" className="btn" onClick={this.applyPreferredUnits}>Apply</Button>
          <Button bsClass="navbar-btn" className="btn" onClick={this.resetPreferredUnits}>Reset</Button>
        </ButtonGroup>
      )
    } else if (this.state.activeKey === 'ST_DarkMode') {
      return null;
    } else if (this.state.activeKey === 'ST_ResetIP') {
      return null;
    }
    return null;
  }

  getContentBySettingsKey() {
    if (this.state.activeKey === 'ST_DisplayValue') {
      return (
        <React.Fragment>
          <div className="center-text">Current layout name: <strong>{this.props.instrumentPanel.layoutName}</strong></div>
          <WidgetList instrumentPanel={this.props.instrumentPanel}/>
        </React.Fragment>
      )
    } else if (this.state.activeKey === 'ST_PrefUnits') {
      return(
        <PreferredUnits instrumentPanel={this.props.instrumentPanel}/>
      )
    } else if (this.state.activeKey === 'ST_DarkMode') {
      return (
        <ColorSchemeSettings instrumentPanel={this.props.instrumentPanel}/>
      )
    } else if (this.state.activeKey === 'ST_ResetIP') {
      return (
        <ResetSettings instrumentPanel={this.props.instrumentPanel}/>
      );
    }
    return null;
  }

  applyPreferredUnits() {
    this.props.instrumentPanel.setReloadRequired();
    this.setState({displayMessage: !this.state.displayMessage});
    this.props.instrumentPanel.getPages().map((page, pageNum) => {
      this.props.instrumentPanel.getWidgets(pageNum).map((widget) => {
        const widgetUnit = widget.getOptions().unit;
        if ((widgetUnit !== 'deg') && (widgetUnit !== '') && (typeof widgetUnit !== 'undefined')) {
          widget.options.convertTo = this.props.instrumentPanel.getPreferredUnit(widgetUnit);
        }
      })
    })
    this.props.instrumentPanel.persist();
  }

  resetPreferredUnits() {
    if (confirm("You will reset the settings of your preferred units")) {
      this.props.instrumentPanel.resetPreferredUnit();
    }
  }

  handleSelect(selectedKey) {
    this.setState({
      activeKey: selectedKey
    });
  }

  handlewidgetActiveMode(selectedKey) {
    this.setState({
      widgetActiveMode: selectedKey
    });
    this.props.instrumentPanel.widgetActiveMode = selectedKey;
    this.props.instrumentPanel.saveWidgetActiveMode();
  }

  handleHideShowAllPaths(show) {
    const hideShow = (show)?"show":"hide";
    if (confirm("you are going to " + hideShow + " all the paths on your grid")) {
      this.props.instrumentPanel.getWidgets().forEach( widget => widget.options.active = show);
      if (this.props.instrumentPanel.currentPage === notificationPageId) {
        this.props.instrumentPanel.updateNotificationLevel(false)
      } else {
          this.props.instrumentPanel.pushGridChanges();
        }
    }
  }
  
  handleShowAllPaths() {
    this.handleHideShowAllPaths(true)
  }

  handleHideAllPaths() {
    this.handleHideShowAllPaths(false)
  }


};

SettingsPanel.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};
