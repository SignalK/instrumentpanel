import React from 'react';
import { render } from 'react-dom';
import { Bus } from 'baconjs';
import util from 'util'

import BaseWidget from './basewidget';
import {
  notificationLevels,
} from '../settings/constants'

let defaultValue = {
  state: 'nominal',
  message: 'no alarm',
  timestamp: '',
  level: 0,
  color: notificationLevels["nominal"],
  date: null
}

function shortLabel(label) {
  return label.replace('notifications.', '').replace('.urn:mrn:imo:mmsi:', ' ');
}

function Notification(id, options, streamBundle, instrumentPanel) {
  var that = this;
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options.label = shortLabel(this.options.path);
  this.notification = {
    value: defaultValue
  };
  this.valueBus = new Bus();
  this.valueStream.onValue(value => {
    var oldLevel = that.notification.value.level || 0;
    if (value === null || typeof value !== 'object') {
      value = defaultValue;
    }
    that.notification.value = value;
    if (!that.notification.value.message) {
      that.notification.value.message = '';
    }
    that.notification.value.level = notificationLevels[that.notification.value.state || 'nominal'];
    that.notification.value.color = that.instrumentPanel.notificationColors[that.notification.value.level];
    that.notification.value.date = new Date(that.notification.value.timestamp);
    that.instrumentPanel.updateNotificationLevel(oldLevel !== that.notification.value.level);
    that.valueBus.push(value);
  })

  this.optionsBundle.optionsStream.onValue(
    (([options, currentvalue]) => {
      that.options.label = shortLabel(that.options.label);
    })
  )

  class NotificationComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        message: '',
      };
    }

    componentDidMount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      this.setState({ message: this.props.notification.value.message });
      this.unsubscribe = this.props.valueStream.onValue((value => {
        if (value === null) { value = {}; value.message = ''; }
        if (this.state.message !== value.message) {
          this.setState({ message: value.message });
        }
      }).bind(this));
    }

    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    }

    render() {
      try {
        return (
          <div style={{ marginLeft: '5px' }}>
            <p>
              [{this.props.options.label + '] ' + this.props.notification.value.state + ': '}
              {(typeof this.props.notification.value.timestamp !== 'undefined') ? this.props.notification.value.timestamp + ': ' : ''}
              {this.state.message}
            </p>
          </div>
        );
      } catch (ex) { console.log(ex) }
      return (<div>safety mode</div>)
    }
  };

  this.widget = React.createElement(NotificationComponent, {
    key: id,
    options: this.options,
    instrumentPanel: this.instrumentPanel,
    notification: this.notification,
    valueStream: this.valueBus.toProperty()
  });
}

util.inherits(Notification, BaseWidget);

Notification.prototype.getReactElement = function () {
  return this.widget;
}

Notification.prototype.getType = function () {
  return "notification";
}

Notification.prototype.getInitialDimensions = function () {
  return { h: 2, w: this.instrumentPanel.gridCols };
}


export default {
  constructor: Notification,
  type: "notification",
  paths: ['notifications.*']
}
