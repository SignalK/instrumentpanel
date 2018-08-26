var Input = require('react-bootstrap').Input,
    React = require('react'),
    BaseWidget = require('../widgets/basewidget')

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
        return <p key={i}><b>{source.path.replace(/\./g, '.' + String.fromCharCode(8203))}</b> ({source.sourceId})</p>
      });
    return (
      <div className='item'>
        <div className='copy'>
          <Input type="checkbox" label="Visible"
            checked={this.props.widget.options.active}
            onChange={this.toggleActive} />
          <h3>{this.props.widget.getType()}</h3>
          {paths}
        </div>
        <div className='widget'>
            {this.props.widget.getReactElement()}
        </div>
        <div>
            {this.props.widget.getSettingsElement()}
        </div>
      </div>
    );
  },

  toggleActive: function() {
    this.props.widget.setActive(!this.props.widget.options.active);
  }
});

module.exports = WidgetRow;
