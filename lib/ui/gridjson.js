var rb = require('react-bootstrap');
var React = require('react');

var Input = rb.Input;


var GridJson = React.createClass({
  mixins: [require('./util/baconmodelmixin')],
  getInitialState: function() {
    return {serializable: "foo"}
  },
  render: function() {
    return (
      <Input type='textarea' label='' placeholder='' rows='20' value={JSON.stringify(this.state.serializable, null, 2)} />
    );
  }
});


module.exports = GridJson;