/**
 * ConnectionIndicator
 *
 * ConnectionIndicator subscribes to an event stream and blinks once per second
 * as long as events are flowing.
 *
 * @allUpdates: event stream to subscribe to
 */
import React from 'react';
import PropTypes from 'prop-types';

import SvgFavoriteBorder24px from '../svg/SvgFavoriteBorder24px';
import SvgFavorite24px from '../svg/SvgFavorite24px';

export default class ConnectionIndicator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: false
    }
    this.toggleValue = this.toggleValue.bind(this);
  }

  render() {
    var heartBeat = this.state.value ? (
      <SvgFavoriteBorder24px x="0" y="0" width="1em" height="1em"/>
    ) : (
      <SvgFavorite24px x="0" y="0" width="1em" height="1em"/>
    );
    return heartBeat;
  }

  /**
   * When the indicator is mounted, subscribe to the event stream and respond
   * at most once per second by toggling the state of the indicator.
   *
   * onValue returns a function which can be used to unsubscribe.
   */
  componentDidMount() {
    this.unsubscribe =
      this.props.allUpdates.debounceImmediate(1000).onValue(this.toggleValue);
  }

  /**
   * When the indicator is unmounted, unsubscribe from the event stream.
   */
  componentWillUnmount() {
    this.unsubscribe();
  }

  toggleValue() {
    this.setState({value: !this.state.value});
  }
};

ConnectionIndicator.propTypes = {
  allUpdates: PropTypes.object.isRequired
}
