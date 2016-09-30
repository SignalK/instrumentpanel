import React from 'react';
import TextField from 'material-ui/TextField';

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

  render: function() {
    return (
      <TextField name='grid' fullWidth={true} multiLine={true} rows={20}
        textareaStyle={{fontFamily: 'monospace'}}
        value={JSON.stringify(this.state.serializable, null, 2)}
      />
    );
  }
});

module.exports = GridJson;
