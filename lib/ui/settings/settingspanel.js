import React from 'react';
import PropTypes from 'prop-types';
import { Button, TabPane, Tabs, Tab } from 'react-bootstrap';

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
  }

  render() {
    return (
      <div>
        <Button className="pull-right"
          onClick={this.reset}>Reset all</Button>
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
    localStorage.clear();
    location.reload();
  }
};

SettingsPanel.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};
