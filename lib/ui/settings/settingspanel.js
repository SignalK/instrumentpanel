import React from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';

import GridJson from './gridjson';
import InstrumentPanel from '../../instrumentpanel';
import WidgetList from './widgetlist';

var SettingsPanel = React.createClass({
  propTypes: {
    instrumentPanel: React.PropTypes.instanceOf(InstrumentPanel).isRequired
  },

  render: function() {
    return (
      <Tabs>
        <Tab label="Configure Widgets">
          <WidgetList instrumentPanel={this.props.instrumentPanel} />
        </Tab>
        <Tab label="Grid as JSON">
          <GridJson model={this.props.instrumentPanel.gridSettingsModel} />
        </Tab>
      </Tabs>
    );
  },

  reset: function() {
    localStorage.clear();
    location.reload();
  }
});

module.exports = SettingsPanel;
