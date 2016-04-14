var React = require('react'),
    Table = require('react-bootstrap').Table,
    InstrumentPanel = require('../instrumentpanel'),
    _ = require('lodash');

/**
 * DataItemList
 *
 * DataItemList displays all of the widgets currently registered with the
 * instrument panel in a table. Unlike WidgetList, it sorts them by path and
 * relies on an instrumentPanel object which responds to widgetsByPath.
 *
 * Similar enough to WidgetList that these two classes should be refactored
 * in to one.
 *
 * @instrumentPanel: an InstrumentPanel object
 */
var DataItemList = React.createClass({
  propTypes: {
    instrumentPanel: React.PropTypes.instanceOf(InstrumentPanel).isRequired
  },

  render: function() {
    var rowStyle = {
      verticalAlign: 'middle',
      height: '16vh',
      width: '33vw'
    };

    var widgetRows =
      _.pairs(this.props.instrumentPanel.widgetsByPath).map(function(pair, i) {
        return (
          <tr key={i}>
            <td style={rowStyle}>{pair[0]}</td>
            <td style={rowStyle}>{pair[1].getType()}</td>
            <td style={rowStyle}>{pair[1].getReactElement()}</td>
          </tr>
        );
      });

    return (
      <div className="widgetlist">
        <Table striped bordered condensed hover>
          <tbody>{widgetRows}</tbody>
        </Table>
      </div>
    );
  }
});

module.exports = DataItemList;
