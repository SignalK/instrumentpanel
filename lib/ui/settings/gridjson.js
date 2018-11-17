var Input = require('react-bootstrap').Input,
    React = require('react');

/**
 * GridJson
 *
 * GridJson akes an event stream containing an object with a `serializbable`
 * property and pretty prints it as JSON in a textarea.
 *
 * @model: event stream containing an object with a `serializable` property
 */
var GridJson = React.createClass({
  mixins: [require('../../util/baconmodelmixin')],

  getInitialState: function() {
    return {serializable: ''}
  },

  handleChange: function(event) {},

  render: function() {
    return (
      <Input type='textarea' rows='20' style={{fontFamily: 'monospace'}}
        value={JSON.stringify(this.state.serializable, null, 2)} onChange={this.handleChange} />
    );
  }
});

module.exports = GridJson;
