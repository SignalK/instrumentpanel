var React = require('react'),
    Table = require('react-bootstrap').Table,
    InstrumentPanel = require('../instrumentpanel'),
    WidgetRow = require('./widgetrow')

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
var WidgetList = React.createClass({
  propTypes: {
    instrumentPanel: React.PropTypes.instanceOf(InstrumentPanel).isRequired
  },

  render: function() {
    var widgetRows =
      this.props.instrumentPanel.getWidgets().map(function(widget, i) {
        return <WidgetRow key={i} widget={widget}></WidgetRow>;
      });

    return (
      <div className="items">
          {widgetRows}
      </div>
    );
  }
});

module.exports = WidgetList;
