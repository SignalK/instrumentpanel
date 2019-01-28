import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, Button, TabPane, Tabs, Tab } from 'react-bootstrap';

import GridJson from './gridjson';
import InstrumentPanel from '../instrumentpanel';
import WidgetList from './widgetlist';

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
      marginRight: '2px'
    };

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
      localStorage.clear();
      location.reload();
    }
  }

  hideAll() {
    this.props.instrumentPanel.getWidgets().forEach( widget => widget.options.active = false);
    this.props.instrumentPanel.pushGridChanges();
  }

  showAll() {
    this.props.instrumentPanel.getWidgets().forEach( widget => widget.options.active = true);
    this.props.instrumentPanel.pushGridChanges();
  }

};

SettingsPanel.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};
