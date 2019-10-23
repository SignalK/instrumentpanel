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
import { Well } from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import WidgetRow from './widgetrow';

export default class WidgetList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var widgetRows =
      this.props.instrumentPanel.getWidgets().map(function(widget, i) {
        return <WidgetRow key={i} widget={widget}></WidgetRow>;
      });

    return (
      <div>
        <Well bsSize="small">Layout Name: <strong>{this.props.instrumentPanel.layoutName}</strong></Well>
        <div className="items">{widgetRows}</div>
      </div>
    );
  }
};

WidgetList.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};

