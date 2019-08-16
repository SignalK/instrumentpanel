import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, Button, TabPane, Tabs, Tab, Alert } from 'react-bootstrap';

import GridJson from './gridjson';
import InstrumentPanel from '../instrumentpanel';
import WidgetList from './widgetlist';

const notificationPageId = -1;

export default class SettingsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 1
    }
    this.handleSelect = this.handleSelect.bind(this);
    this.hideAll = this.hideAll.bind(this);
    this.showAll = this.showAll.bind(this);
  }

  render() {
    var buttonStyle = {
      marginLeft: '2px',
      marginRight: '2px',
      marginTop: '4px'
    };

    var reloadMessage =
      (<Alert bsStyle="warning"><strong>Reload is required</strong> This will be done when you leave settings tab.</Alert>);

    return (
      <div>
        <ButtonGroup className="pull-right" style={buttonStyle}>
          <Button onClick={this.reset}>Reset all</Button>
        </ButtonGroup>
        <ButtonGroup className="pull-right" style={buttonStyle}>
          <Button onClick={this.hideAll}>Hide all</Button>
          <Button onClick={this.showAll}>Show all</Button>
        </ButtonGroup>
        <Tabs id={1} activeKey={this.state.activeKey}
          onSelect={this.handleSelect}>
          <Tab eventKey={1} title="By Display Widget">
            {(this.props.instrumentPanel.isReloadRequired())? reloadMessage : undefined}
            <WidgetList instrumentPanel={this.props.instrumentPanel}/>
          </Tab>
          <Tab eventKey={3} title="Grid as JSON">
            <GridJson model={this.props.instrumentPanel.gridSettingsModel}/>
          </Tab>
        </Tabs>
      </div>
    );
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
