import React from 'react';
import { render } from 'react-dom';
import {Bus} from 'baconjs';
import util from 'util'

import BaseWidget from './basewidget';

var notificationLevels = {
  "nominal": 0,
  "normal": 1,
  "alert": 2,
  "warn": 3,
  "alarm": 4,
  "emergency": 5
};

let defaultValue = {
  state: 'nominal',
  message: 'no alarm',
  timestamp: '',
  level: 0,
  color: notificationLevels["nominal"],
  date: null
}

function shortLabel(label) {
  return label.replace('notifications.','').replace('.urn:mrn:imo:mmsi:',' ');
}

function Notification(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options.label = shortLabel(this.options.path);
  this.notification = {
    value: defaultValue
  };
  this.valueBus = new Bus();
  this.valueStream.onValue(value => {
    var levelChange = false;
    var oldLevel;
    if (value === null || typeof value !== 'object'){
      value = defaultValue;
    }
    oldLevel = this.notification.value.level || 0;
    this.notification.value = value;
    if (!this.notification.value.message) {
      this.notification.value.message = '';
    }
    this.notification.value.level = notificationLevels[this.notification.value.state || 'nominal'];
    this.notification.value.color = this.instrumentPanel.notificationColors[this.notification.value.level];
    this.notification.value.date = new Date(this.notification.value.timestamp);
    this.instrumentPanel.updateNotificationLevel(oldLevel !== this.notification.value.level);
    this.valueBus.push(value);
  })
/*
  this.optionsBundle.optionsStream.onValue(
    ( ([options,currentvalue]) => {
      this.options.label = shortLabel(this.options.label);
    })
  )
*/
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
      this.setState({message: this.props.notification.value.message});
      this.unsubscribe = this.props.valueStream.onValue((value => {
        if (value === null) { value = {}; value.message = ''; }
        if (this.state.message !== value.message) {
          this.setState({message: value.message});
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
          <div style={{marginLeft: '5px'}}>
            <p>
              [{this.props.options.label + '] ' + this.props.notification.value.state + ': '}
              {(typeof this.props.notification.value.timestamp !== 'undefined') ? this.props.notification.value.timestamp + ': ' : ''}
              {this.state.message}
            </p>
          </div>
        );
      } catch (ex) {console.log(ex)}
      return (<div>safety mode</div>)
    }
  };

  this.widget = React.createElement(NotificationComponent,{
    key: id,
    options: this.options,
    instrumentPanel: this.instrumentPanel,
    notification: this.notification,
    valueStream: this.valueBus.toProperty(),
    optionsBundle: this.optionsBundle
  });
}

util.inherits(Notification, BaseWidget);

Notification.prototype.getReactElement = function() {
  return this.widget;
}

Notification.prototype.getType = function() {
  return "notification";
}

Notification.prototype.getInitialDimensions = function() {
  return {h:2, w:100};
}


export default {
  constructor: Notification,
  type: "notification",
  paths: ['notifications.*']
}
