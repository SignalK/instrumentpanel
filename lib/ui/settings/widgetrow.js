var Input = require('react-bootstrap').Input,
    React = require('react'),
    _ = require('lodash');

/**
 * WidgetRow
 *
 * WidgetRow is a React Component rendering a table row displaying widget
 * information.
 *
 * @widget: An object implementing the widget interface described by propTypes
 *   below. TODO: Ensure all of these exist in the BaseWidget prototype, so
 *   it can be used as an interface and the widget def can be shortened to
 *   React.PropTypes.instanceOf(Widget)
 */
var WidgetRow = React.createClass({
  propTypes: {
    widget: React.PropTypes.shape({
      options: React.PropTypes.object.isRequired,
      getHandledPaths: React.PropTypes.func.isRequired,
      getReactElement: React.PropTypes.func.isRequired,
      getType: React.PropTypes.func.isRequired,
      setActive: React.PropTypes.func.isRequired
    }).isRequired
  },

  render: function() {
    var rowStyle = {
      verticalAlign: 'middle',
      height: '16vh',
      width: '30vw'
    };

    var paths =
      this.props.widget.getHandledPaths().map(function(path, i) {
        return <li key={i}>{path}</li>;
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
