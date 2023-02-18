import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, HelpBlock } from 'react-bootstrap';
import {
  storeEnPathSubscription
} from '../../util/localstorage';

import InstrumentPanel from '../instrumentpanel';

export default class PathSubscription extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      enable: this.props.instrumentPanel.enPathSubscription
    }
  }

  handleChange(e) {
    storeEnPathSubscription(e.target.checked);
    this.props.instrumentPanel.setReloadRequired(this.props.instrumentPanel.enPathSubscription !== e.target.checked)
    this.setState({ 'enable': e.target.checked });
  }

  render() {
    return (
      <Checkbox key='1' id='1' onChange={this.handleChange} checked={this.state.enable}>
        Path Subscription
        <HelpBlock>By default, InstrumentPanel subscribes to all paths below 'self' (see 'Data Browser' in the SignalK server).<br />
          When your server has a lot of paths, you get them all in InstrumentPanel even if you only display a few widgets on your active page.<br />
          This can generate significant and unnecessary network usage.<br />
          By enabling 'Path Subscription', when the navigation bar disappears, you subscribe only to the useful paths for the widgets on your current page.<br />
          Tips for maximizing reduction in network bandwidth usage:<br />
          Rather than stacking widgets down and scrolling to display them, it is better to create several pages with widgets that do not fill more than the size of your screen.<br />
          However, if you have a page with a lot of widgets, it is better not to enable 'Path Subscription' as this can have a negative effect on SignalK server performance.
        </HelpBlock>
      </Checkbox>
    );
  }
};

PathSubscription.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};
