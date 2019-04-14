import React from 'react';
import { render } from 'react-dom';
import util from 'util';
import Qty from 'js-quantities'

import BaseWidget from './basewidget';

const defaultText = '-.----°';

function Attitude(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  class ReactComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        yaw: defaultText,
        pitch: defaultText,
        roll: defaultText
      };
    }

    componentDidMount() {
        if (this.unsubscribe) {
          this.unsubscribe();
        }
        this.unsubscribe = streamBundle.getStreamForSourcePath(options.sourceId, options.path).onValue(function(value) {
          var convert = Qty.swiftConverter('rad', 'deg')
          value.yaw = (typeof value.yaw === 'number')? convert(value.yaw).toFixed(4) + '°': defaultText;
          value.pitch = (typeof value.pitch === 'number')? convert(value.pitch).toFixed(4) + '°' : defaultText;
          value.roll = (typeof value.roll === 'number')? convert(value.roll).toFixed(4) + '°': defaultText;
          this.setState(value);
        }.bind(this));
    }

    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    }

    render() {
      return (
        <svg key={id} height="100%" width="100%" viewBox="0 0 20 33" >
          <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">{this.props.options.label}</text>
          <text x="-25" y="12" textAnchor="start" fontSize="10" dominantBaseline="middle">yaw:</text>
          <text x="-25" y="21" textAnchor="start" fontSize="10" dominantBaseline="middle">pitch:</text>
          <text x="-25" y="29" textAnchor="start" fontSize="10" dominantBaseline="middle">roll:</text>
          <text x="45" y="12" textAnchor="end" fontSize="10" dominantBaseline="middle">{this.state.yaw}</text>
          <text x="45" y="21" textAnchor="end" fontSize="10" dominantBaseline="middle">{this.state.pitch}</text>
          <text x="45" y="29" textAnchor="end" fontSize="10" dominantBaseline="middle">{this.state.roll}</text>
        </svg>
      )
    }
  }
  this.widget = React.createElement(ReactComponent,{
    key: id,
    options: this.options,
    instrumentPanel: this.instrumentPanel
  });
  this.updateUnitData(this);
}

util.inherits(Attitude, BaseWidget);

Attitude.prototype.updateStream = function(widget, valueStream) {
  widget.widget = React.cloneElement(widget.widget,{
    valueStream: valueStream
  });
  widget.instrumentPanel.pushGridChanges();
}

Attitude.prototype.getReactElement = function() {
  return this.widget;
}

Attitude.prototype.getType = function() {
  return "attitude";
}

Attitude.prototype.getOptions = function() {
  return this.options;
}

Attitude.prototype.getInitialDimensions = function() {
  return {h:2};
}


module.exports = {
  constructor: Attitude,
  type: "attitude",
  paths: ['navigation.attitude']
}
