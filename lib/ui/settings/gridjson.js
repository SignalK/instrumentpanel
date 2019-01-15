/**
 * GridJson
 *
 * GridJson akes an event stream containing an object with a `serializbable`
 * property and pretty prints it as JSON in a textarea.
 *
 * @model: event stream containing an object with a `serializable` property
 */
import React from 'react';
import { FormControl } from 'react-bootstrap';
import PropTypes from 'prop-types';

export default class GridJson extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serializable: ''
    }
  }

  handleChange(event) {}

  render() {
    return (
      <FormControl componentClass='textarea' rows='20' style={{fontFamily: 'monospace'}}
        value={JSON.stringify(this.state.serializable, null, 2)} onChange={this.handleChange} />
    );
  }

  componentDidMount() {
    var that = this;
    this.unsubscribe = this.props.model.onValue( (newState) => {
      that.setState(newState)
    });
  }

  componentWillUnmount() {
    if(this.unsubscribe) {
      this.unsubscribe();
    }
  }
};

GridJson.propTypes = {
  model: PropTypes.object.isRequired
};
