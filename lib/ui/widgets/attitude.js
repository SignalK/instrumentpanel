import React from 'react';
import { render } from 'react-dom';
import util from 'util';
import Qty from 'js-quantities'

import BaseWidget, {defaultComponentDidMount, defaultComponentWillUnmount} from './basewidget';

const defaultText = '-.----°';
const defaultValue = {
  yaw:   defaultText,
  pitch: defaultText,
  roll:  defaultText
}

let convertRadToDeg = Qty.swiftConverter('rad', 'deg')

function Attitude(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  class ReactComponent extends React.Component {
    constructor(props) {
      super(props);
      this.widgetLabel = '';
      this.onOptionsUpdate = this.onOptionsUpdate.bind(this);
      this.onOptionsUpdate(this.props.optionsBundle.getOptions());
      this.state = {
        value: defaultValue,
      };
    }

    componentDidMount() {
      defaultComponentDidMount(this,undefined,postConversion);
    }
  
    componentWillUnmount() {
      defaultComponentWillUnmount(this);
    }

    onOptionsUpdate(options) {
      this.widgetLabel = options.label;
    }

    render() {
      try {
        return (
          <svg key={id} height="100%" width="100%" viewBox="0 0 20 33" stroke="none">
            <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">{this.widgetLabel}</text>
            <text x="-25" y="12" textAnchor="start" fontSize="10" dominantBaseline="middle">yaw:</text>
            <text x="-25" y="21" textAnchor="start" fontSize="10" dominantBaseline="middle">pitch:</text>
            <text x="-25" y="29" textAnchor="start" fontSize="10" dominantBaseline="middle">roll:</text>
            <text x="45" y="12" textAnchor="end" fontSize="10" dominantBaseline="middle">{this.state.value.yaw}</text>
            <text x="45" y="21" textAnchor="end" fontSize="10" dominantBaseline="middle">{this.state.value.pitch}</text>
            <text x="45" y="29" textAnchor="end" fontSize="10" dominantBaseline="middle">{this.state.value.roll}</text>
          </svg>
        )
      } catch (ex) {console.log(ex)}
      return (<div>safety mode</div>)
    }
  }

  this.widget = React.createElement(ReactComponent,{
    key: id,
    instrumentPanel: this.instrumentPanel,
    valueStream: this.valueStream,
    optionsBundle: this.optionsBundle,
  });
}

util.inherits(Attitude, BaseWidget);

Attitude.prototype.getReactElement = function() {
  return this.widget;
}

Attitude.prototype.getType = function() {
  return "attitude";
}

Attitude.prototype.getInitialDimensions = function() {
  return {h:2};
}

function convertAndRound(value) {
  return (typeof value === 'number') ?
  convertRadToDeg(value).toFixed(4) + '°' : defaultText
}


function postConversion(value) {
  if (typeof value === 'object' && value !== null) {
    value.yaw = convertAndRound(value.yaw);
    value.pitch = convertAndRound(value.pitch);
    value.roll = convertAndRound(value.roll);
  } else {
    value = defaultValue
  }
  return value;
}

export default {
  constructor: Attitude,
  type: "attitude",
  paths: ['navigation.attitude']
}
