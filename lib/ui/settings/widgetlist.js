/**
 * WidgetList
 *
 * WidgetList displays all of the widgets currently registered with the
 * instrument panel in a table.
 *
 * Similar enough to DataItemList that these two classes should be refactored
 * in to one.
 *
 * @instrumentPanel: an InstrumentPanel object
 */
import React from 'react';
import PropTypes from 'prop-types';

import InstrumentPanel from '../instrumentpanel';
import WidgetCell from './widgetcell';

export default class WidgetList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var widgetCells =
      this.props.instrumentPanel.getWidgets().map(function(widget, i) {
        return <WidgetCell key={i} widget={widget}></WidgetCell>;
      });

    return (
      <div className="items">{widgetCells}</div>
    );
  }
};

WidgetList.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};

