import React from 'react';
import { render } from 'react-dom';
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

function Notification(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options.label = this.getLabelForPath(this.options.path).replace('notifications.','');
  this.notification = {
    value: {
      state: 'nominal',
      message: 'no alarm',
      timestamp: '',
      level: 0,
      color: notificationLevels[0],
      date: null
    }
  };
  this.streamBundle.getStreamForSourcePath(options.sourceId, options.path).onValue(function(value) {
    var levelChange = false;
    var oldLevel;
    if (value === null){
      value = {
        state: 'nominal',
        message: 'no alarm',
        timestamp: '',
        date: null,
        level: 0
      }
    }
    this.notification.value = value;
    oldLevel = this.notification.value.level || 0;
    this.notification.value.level = notificationLevels[this.notification.value.state];
    this.notification.value.color = this.instrumentPanel.notificationColors[this.notification.value.level];
    this.notification.value.date = new Date(this.notification.value.timestamp);
    this.instrumentPanel.updateNotificationLevel(oldLevel !== this.notification.value.level);
    return value;
  }.bind(this))
  class NotificationComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        count: 0,
      };
    }

    componentDidMount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      this.unsubscribe = this.props.notificationStream.getStreamForSourcePath(this.props.options.sourceId, this.props.options.path).onValue(function(value) {
        this.setState({count: this.state.count+1});
      }.bind(this));
    }

    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    }

    render() {
      return (
        <div style={{marginLeft: '5px'}}>
          <p>
            [{this.props.label + '] ' + this.props.notification.value.state + ': '}
            {(typeof this.props.notification.value.timestamp !== 'undefined') ? this.props.notification.value.timestamp + ': ' : ''}
            {this.props.notification.value.message}
          </p>
        </div>
      );
    }
  };

  this.widget = React.createElement(NotificationComponent,{
    key: id,
    options: this.options,
    instrumentPanel: this.instrumentPanel,
    notification: this.notification,
    notificationStream: this.streamBundle
  });
  this.updateUnitData(this);
}

util.inherits(Notification, BaseWidget);

Notification.prototype.updateStream = function(widget, valueStream) {
  widget.widget = React.cloneElement(widget.widget,{
    label: widget.options.label.replace('notifications.',''),
  })
  widget.instrumentPanel.pushGridChanges();
}

Notification.prototype.getReactElement = function() {
  return this.widget;
}

Notification.prototype.getType = function() {
  return "notification";
}

Notification.prototype.getInitialDimensions = function() {
  return {h:2, w:100};
}


module.exports = {
  constructor: Notification,
  type: "notification",
  paths: ['notifications.*']
}
