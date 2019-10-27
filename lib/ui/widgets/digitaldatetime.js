import React from 'react';
import { render } from 'react-dom';
import util from 'util'

import {
  unitChoice,
  getConversion
} from '../settings/conversions'
import BaseWidget from './basewidget';

function pad(n) { return n<10 ? '0'+n : n; }

var SettingsPanel = (props) => {
  return (
    <div>
      {props.options.unit != '' ? unitChoice(props.options.unit, props.onUnitChange, props.options.convertTo) : undefined}
    </div>
  )
}

var dateFormats = [
  function(dateObject) {
    return {
      date: dateObject.getUTCFullYear() + "/" + pad(dateObject.getUTCMonth()+1) + "/" + pad(dateObject.getUTCDate()),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'YYYY/MM/DD',
      fontSizeDate: 11
    }
  },
  function(dateObject) {
    return {
      date: pad(dateObject.getUTCDate()) + "/" + pad(dateObject.getUTCMonth()+1) + "/" + dateObject.getUTCFullYear(),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'DD/MM/YYYY',
      fontSizeDate: 11
    }
  },
  function(dateObject) {
    return {
      date: pad(pad(dateObject.getUTCMonth()+1) + "/" + dateObject.getUTCDate()) + "/" + dateObject.getUTCFullYear(),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'MM/DD/YYYY',
      fontSizeDate: 11
    }
  },
  function(dateObject) {
    return {
      date: dateObject.getUTCFullYear().toString().substring(2) + "/" + pad(dateObject.getUTCMonth()+1) + "/" + pad(dateObject.getUTCDate()),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'YY/MM/DD',
      fontSizeDate: 11
    }
  },
  function(dateObject) {
    return {
      date: pad(dateObject.getUTCDate()) + "/" + pad(dateObject.getUTCMonth()+1) + "/" + dateObject.getUTCFullYear().toString().substring(2),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'DD/MM/YY',
      fontSizeDate: 11
    }
  },
  function(dateObject) {
    return {
      date: pad(dateObject.getUTCMonth()+1) + "/" + pad(dateObject.getUTCDate()) + "/" + dateObject.getUTCFullYear().toString().substring(2),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'MM/DD/YY',
      fontSizeDate: 11
    }
  },
  function(dateObject) {
    return {
      date: dateObject.toDateString(),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'D M DD YYYY',
      fontSizeDate: 9
    }
  }
]

function DigitalDateTime(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options.unit = "UTC";
  var valueStream = this.streamBundle.getStreamForSourcePath(this.options.sourceId, this.options.path);
  const conversion = getConversion(this.options.unit, this.options.convertTo);
  valueStream = valueStream.map(function(value) {
    if(value !== undefined) {
      value = new Date(value).getTime();
      if (conversion) {
        value = conversion(value);
      }
      return value;
    }
  }.bind(this));
  if ((typeof this.options.formatDateIndex === 'undefined') ||
       (this.options.formatDateIndex < 0) ||
       (this.options.formatDateIndex > dateFormats.length -1)) {
    this.options.formatDateIndex = 0;
  }
  class ReactComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        epochDate: undefined,
        formatDateIndex: this.props.options.formatDateIndex
      };
      this.changeDateFormat = this.changeDateFormat.bind(this);
    }

    componentDidMount() {
      if (this.props.valueStream) {
        if (this.unsubscribe) {
          this.unsubscribe();
        }
        this.unsubscribe = this.props.valueStream.onValue(function(value) {
          this.setState({epochDate: value});
        }.bind(this));
      }
    }
    
    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    }
    
    changeDateFormat(event) {
      if ((event.nativeEvent.offsetX > 50) || (event.nativeEvent.offsetY > 50)) { return }
      const newFormatDateIndex = this.state.formatDateIndex === dateFormats.length -1 ? 0 : this.state.formatDateIndex +1;
      this.setState({ formatDateIndex: newFormatDateIndex});
      this.props.options.formatDateIndex = newFormatDateIndex;
      this.props.instrumentPanel.persist();
    }
    
    render() {
      var textDate = {};
      if(typeof this.state.epochDate !== 'undefined') {
        const dateObject = new Date(this.state.epochDate);
        textDate = dateFormats[this.state.formatDateIndex](dateObject);
      } else {
        textDate = {date: '--/--/--', time: '--:--:--'};
      }
      return (
        <svg key={id} onClick={this.changeDateFormat} height="100%" width="100%" viewBox="0 0 20 30" stroke="none">
          <text x="10" y="3" textAnchor="middle" fontSize="4" dominantBaseline="middle">{textDate.label + " (" + (options.convertTo !== undefined ? options.convertTo : options.unit) + ")"}</text>
          <text x="10" y="10" textAnchor="middle" fontSize={textDate.fontSizeDate} dominantBaseline="middle">{textDate.date}</text>
          <text x="10" y="23" textAnchor="middle" fontSize="17" dominantBaseline="middle">{textDate.time}</text>
        </svg>
      )
    }
  }

  ReactComponent.defaultProps = {
    withClickMe: true
  }

  this.widget = React.createElement(ReactComponent,{
    key: id,
    valueStream: valueStream,
    options: this.options,
    instrumentPanel: this.instrumentPanel
  });
}

util.inherits(DigitalDateTime, BaseWidget);

DigitalDateTime.prototype.getReactElement = function() {
  return this.widget;
}

DigitalDateTime.prototype.getSettingsElement = function() {
  var that = this;
  return SettingsPanel({
    options: this.options,
    unit: this.options.unit,
    onUnitChange: function(event) {
      that.options.convertTo = event.target.value === that.options.unit ? '' : event.target.value;
      that.instrumentPanel.persist();
      that.instrumentPanel.pushGridChanges();
      that.instrumentPanel.setReloadRequired();
    }
  });
}

DigitalDateTime.prototype.getType = function() {
  return "digitaldatetime";
}

DigitalDateTime.prototype.getInitialDimensions = function() {
  return {h:2};
}


export default {
  constructor: DigitalDateTime,
  type: "digitaldatetime",
  paths: ['navigation.datetime']
}
