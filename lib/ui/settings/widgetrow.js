var Input = require('react-bootstrap').Input,
    React = require('react'),
    BaseWidget = require('../widgets/basewidget'),
    _ = require('lodash');

/**
 * WidgetRow
 *
 * WidgetRow is a React Component rendering a table row displaying widget
 * information.
 *
 * @widget: An object implementing the BaseWidget interface as defined in
 *   ../widgets/basewidget.js
 */
var WidgetRow = React.createClass({
  propTypes: {
    widget: React.PropTypes.instanceOf(BaseWidget).isRequired
  },

  render: function() {
    var rowStyle = {
      verticalAlign: 'middle',
      height: '16vh',
      width: '30vw'
    };

    var paths =
      this.props.widget.getHandledSources().map(function(source, i) {
        return <li key={i}>{source.sourceId}::<b>{source.path}</b></li>;
      });

    return (
      <tr>
        <td style={{width: '10vw'}}>
          <Input type="checkbox" label="&nbsp;"
            checked={this.props.widget.options.active}
            onChange={this.toggleActive} />
        </td>
        <td style={rowStyle}>{this.props.widget.getType()}</td>
        <td style={rowStyle}>
          {this.props.widget.getReactElement()}
        </td>
        <td style={rowStyle}>
          <ul>{paths}</ul>
        </td>
      </tr>
    );
  },

  toggleActive: function() {
    this.props.widget.setActive(!this.props.widget.options.active);
  }
});

module.exports = WidgetRow;
