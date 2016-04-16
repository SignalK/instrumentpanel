var React = require('react');

/** baconmodelmixin
 *
 * baconmodelmixin provides a new prop, `model` and the lifecycle functions
 * `componentDidMount()` and `componentWillUnmount()` which handle subscription
 * and unsubscription to an event steam passed via the `model` prop.
 *
 * @model: event stream to subscribe to
 */
module.exports = {
  propTypes: {
    model: React.PropTypes.object.isRequired
  },

  componentDidMount: function() {
    this.unsubscribe = this.props.model.onValue(this.replaceState.bind(this));
  },

  componentWillUnmount: function() {
    if(this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
