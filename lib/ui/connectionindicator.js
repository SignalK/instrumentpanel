import React from 'react';
import LensIcon from 'material-ui/svg-icons/image/lens';
import PanoramaFishEyeIcon from 'material-ui/svg-icons/image/panorama-fish-eye';

const iconStyle = {
  marginTop: 12,
  marginLeft: -22,
};

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
    if(this.state.value) {
      return <LensIcon style={iconStyle} />;
    } else {
      return <PanoramaFishEyeIcon style={iconStyle} />;
    }
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
