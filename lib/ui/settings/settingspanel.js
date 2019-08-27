import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, Button, TabPane, Tabs, Tab, Alert } from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import WidgetList from './widgetlist';
import PreferredUnits from './preferredunits';

const notificationPageId = -1;

export default class SettingsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 1,
      displayMessage: false
    }
    this.handleSelect = this.handleSelect.bind(this);
    this.hideAll = this.hideAll.bind(this);
    this.showAll = this.showAll.bind(this);
    this.getButtonByTab = this.getButtonByTab.bind(this);
    this.applyPreferredUnits = this.applyPreferredUnits.bind(this);
    this.resetPreferredUnits = this.resetPreferredUnits.bind(this);
  }

  render() {

    var reloadMessage =
      (<Alert bsStyle="warning"><strong>Reload is required</strong> This will be done when you leave settings tab.</Alert>);

    return (
      <div>
        {this.getButtonByTab()}
        <Tabs id={1} activeKey={this.state.activeKey}
          onSelect={this.handleSelect}>
          <Tab eventKey={1} title="By Display Widget">
            {(this.props.instrumentPanel.isReloadRequired())? reloadMessage : undefined}
            <WidgetList instrumentPanel={this.props.instrumentPanel}/>
          </Tab>
          <Tab eventKey={2} title="Preferred Units">
            {(this.props.instrumentPanel.isReloadRequired())? reloadMessage : undefined}
            <PreferredUnits instrumentPanel={this.props.instrumentPanel}/>
          </Tab>
        </Tabs>
      </div>
    );
  }

  getButtonByTab() {
    var buttonStyle = {
      marginLeft: '2px',
      marginRight: '2px',
      marginTop: '4px'
    };
    if (this.state.activeKey === 1) {
      return (
        <div>
          <ButtonGroup className="pull-right" style={buttonStyle}>
            <Button onClick={this.reset}>Reset all</Button>
          </ButtonGroup>
          <ButtonGroup className="pull-right" style={buttonStyle}>
            <Button onClick={this.hideAll}>Hide all</Button>
            <Button onClick={this.showAll}>Show all</Button>
          </ButtonGroup>
        </div>
      )
    } else if (this.state.activeKey === 2) {
      return(
        <div>
          <ButtonGroup className="pull-right" style={buttonStyle}>
            <Button onClick={this.applyPreferredUnits}>Apply Preferred Units</Button>
            <Button onClick={this.resetPreferredUnits}>Reset Preferred Units</Button>
          </ButtonGroup>
        </div>
      )
    } else if (this.state.activeKey === 3) {
      return null;
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

  reset() {
    if (confirm("You will reset your entire layout")) {
      localStorage.removeItem('signalkGrid3');
      localStorage.removeItem('signalKHostConnected');
      localStorage.removeItem('signalKLastHost');
      location.reload();
    }
  }

  hideAll() {
    this.props.instrumentPanel.getWidgets().forEach( widget => widget.options.active = false);
    if (this.props.instrumentPanel.currentPage === notificationPageId) {
      this.props.instrumentPanel.updateNotificationLevel(false)
    } else {
        this.props.instrumentPanel.pushGridChanges();
      }
  }

  showAll() {
    this.props.instrumentPanel.getWidgets().forEach( widget => widget.options.active = true);
    if (this.props.instrumentPanel.currentPage === notificationPageId) {
      this.props.instrumentPanel.updateNotificationLevel(false)
    } else {
        this.props.instrumentPanel.pushGridChanges();
      }
  }

};

SettingsPanel.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};
