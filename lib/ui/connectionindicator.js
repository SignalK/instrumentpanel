var React = require('react');
var FontAwesome = require('react-fontawesome');

/**
 * ConnectionIndicator
 *
 * ConnectionIndicator subscribes to an event stream and blinks once per second
 * as long as events are flowing.
 *
 * @allUpdates: event stream to subscribe to
 */
var ConnectionIndicator = React.createClass({
  propTypes: {
    allUpdates: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      value: false
    };
  },

  render: function() {
    var name = this.state.value ? 'circle' : 'circle-o';

    return <FontAwesome name={name} />;
  },

  /**
   * When the indicator is mounted, subscribe to the event stream and respond
   * at most once per second by toggling the state of the indicator.
   *
   * onValue returns a function which can be used to unsubscribe.
   */
  componentDidMount: function() {
    this.unsubscribe =
      this.props.allUpdates.debounceImmediate(1000).onValue(this.toggleValue);
  },

  /**
   * When the indicator is unmounted, unsubscribe from the event stream.
   */
  componentWillUnmount: function() {
    this.unsubscribe();
  },

  toggleValue: function() {
    this.setState({value: !this.state.value});
  },
});

module.exports = ConnectionIndicator;
