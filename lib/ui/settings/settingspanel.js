import React from 'react';
import PropTypes from 'prop-types';
import { Navbar, Button, Alert, Dropdown } from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import WidgetList from './widgetlist';
import PreferredUnits from './preferredunits';
import ResetSettings from './resetsettings';
import ColorSchemeSettings from './colorschemesettings';
import SaveLoadSettingsUnits from './saveload';
import PathSubscription from './pathsubscription';
import { reloadWithParams } from '../../util/browser';
import {
  saveDisplayKey,
  loadDisplayKey
} from './constants';

const settingsMenu = {
  ST_DisplayValue: 'Customise Display',
  ST_PathSubscription: 'Path Subscription',
  ST_PrefUnits: 'Preferred Units',
  ST_DarkMode: 'Dark Mode',
  ST_Save: 'Save settings',
  ST_Load: 'Load settings',
  ST_ResetIP: 'Reset settings'
};

export default class SettingsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'ST_DisplayValue'
    }
    this.handleSelect = this.handleSelect.bind(this);
    this.getContentBySettingsKey = this.getContentBySettingsKey.bind(this);
    this.isNoSourceInLayout = this.isNoSourceInLayout.bind(this);
    this.deleteWidgetsNoSource = this.deleteWidgetsNoSource.bind(this);
  }

  render() {
    var reloadMessage =
      (<Alert bsStyle="warning"><strong>Reload is required</strong> This will be done when you leave settings tab.</Alert>);
    var menuItems = Object.getOwnPropertyNames(settingsMenu).map(item => {
      return <Dropdown.Item key={item} eventKey={item} active={this.state.activeKey === item}>{settingsMenu[item]}</Dropdown.Item>
    });
    return (
      <React.Fragment>
        {(this.props.instrumentPanel.isReloadRequired()) ? reloadMessage : undefined}
        {this.isNoSourceInLayout()}
        <Navbar>
          <Dropdown onSelect={this.handleSelect}>
            <Dropdown.Toggle>
              {settingsMenu[this.state.activeKey]}
            </Dropdown.Toggle>
            <Dropdown.Menu>{menuItems}</Dropdown.Menu>
          </Dropdown>
        </Navbar>
        {this.getContentBySettingsKey()}
      </React.Fragment>
    )
  }

  getContentBySettingsKey() {
    if (this.state.activeKey === 'ST_DisplayValue') {
      return (<WidgetList instrumentPanel={this.props.instrumentPanel} />)
    } else if (this.state.activeKey === 'ST_PathSubscription') {
      return (<PathSubscription instrumentPanel={this.props.instrumentPanel} />)
    } else if (this.state.activeKey === 'ST_PrefUnits') {
      return (<PreferredUnits instrumentPanel={this.props.instrumentPanel} />)
    } else if (this.state.activeKey === 'ST_DarkMode') {
      return (<ColorSchemeSettings instrumentPanel={this.props.instrumentPanel} />)
    } else if (this.state.activeKey === 'ST_ResetIP') {
      return (<ResetSettings instrumentPanel={this.props.instrumentPanel} />)
    } else if (this.state.activeKey === 'ST_Save') {
      return (<SaveLoadSettingsUnits instrumentPanel={this.props.instrumentPanel} displayKey={saveDisplayKey} key={this.state.activeKey} />);
    } else if (this.state.activeKey === 'ST_Load') {
      return (<SaveLoadSettingsUnits instrumentPanel={this.props.instrumentPanel} displayKey={loadDisplayKey} key={this.state.activeKey} />);
    }
    return null;
  }

  handleSelect(selectedKey) {
    this.setState({
      activeKey: selectedKey
    });
  }

  isNoSourceInLayout() {
    if (this.props.instrumentPanel.legacySourcesOn) {
      let pageKeys = [];
      let activeWidget = false
      let pageText = '';
      let messageActive = '';
      let pageIter = this.props.instrumentPanel.pages.keys();
      for (const pageKey of pageIter) {
        this.props.instrumentPanel.getWidgets(pageKey).filter(widget => widget.options.sourceId === 'no_source' && widget.options.active).forEach(widget => {
          if (pageKeys.indexOf(pageKey) === -1) pageKeys.push(pageKey);
          activeWidget = true;
        })
      }
      pageText = pageKeys.reduce((acc, val) => acc + ((acc !== '') ? ',' : '') + (val + 1), '');
      console.log(activeWidget, pageText);
      if (pageText !== '') {
        messageActive = "uncheck 'Show on grid' on all widgets with a red dotted border in page " + pageText + ", select the appropriate new widget, check your new layout and then ";
      }
      return (
        <Alert bsStyle="warning">
          You use paths with 'no_source' as reference in your layout. Please, {messageActive} clic on&nbsp;
          <Button className='headerEdit' bsSize='xsmall' disabled={activeWidget} onClick={this.deleteWidgetsNoSource}>Delete outdated widgets</Button>
        </Alert>
      );
    }
  }

  deleteWidgetsNoSource() {
    let pageIter = this.props.instrumentPanel.pages.keys();
    for (const pageKey of pageIter) {
      this.props.instrumentPanel.getWidgets(pageKey).filter(widget => widget.options.sourceId === 'no_source').forEach(widget => {
        widget.setActive(false);
        widget.setDelete(true);
      })
    }
    this.props.instrumentPanel.persist(true);
    reloadWithParams(this.props.instrumentPanel.getReloadParams());
  }
};

SettingsPanel.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};
