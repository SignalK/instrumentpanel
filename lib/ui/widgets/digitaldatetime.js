var React = require('react');

import {
  getConversionsForUnit,
  conversionsToOptions,
  unitChoice
} from '../settings/conversions'

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
      fontSizeDate: 13
    }
  },
  function(dateObject) {
    return {
      date: pad(dateObject.getUTCDate()) + "/" + pad(dateObject.getUTCMonth()+1) + "/" + dateObject.getUTCFullYear(),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'DD/MM/YYYY',
      fontSizeDate: 13
    }
  },
  function(dateObject) {
    return {
      date: pad(pad(dateObject.getUTCMonth()+1) + "/" + dateObject.getUTCDate()) + "/" + dateObject.getUTCFullYear(),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'MM/DD/YYYY',
      fontSizeDate: 13
    }
  },
  function(dateObject) {
    return {
      date: dateObject.getUTCFullYear().toString().substring(2) + "/" + pad(dateObject.getUTCMonth()+1) + "/" + pad(dateObject.getUTCDate()),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'YY/MM/DD',
      fontSizeDate: 13
    }
  },
  function(dateObject) {
    return {
      date: pad(dateObject.getUTCDate()) + "/" + pad(dateObject.getUTCMonth()+1) + "/" + dateObject.getUTCFullYear().toString().substring(2),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'DD/MM/YY',
      fontSizeDate: 13
    }
  },
  function(dateObject) {
    return {
      date: pad(dateObject.getUTCMonth()+1) + "/" + pad(dateObject.getUTCDate()) + "/" + dateObject.getUTCFullYear().toString().substring(2),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'MM/DD/YY',
      fontSizeDate: 13
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

var BaseWidget = require('./basewidget');
require('util').inherits(DigitalDateTime, BaseWidget);

function DigitalDateTime(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options.unit = "UTC";
  var valueStream = this.streamBundle.getStreamForSourcePath(this.options.sourceId, this.options.path);
  const conversions = getConversionsForUnit(this.options.unit)[this.options.convertTo];
  valueStream = valueStream.map(function(value) {
    if(value !== undefined) {
      value = new Date(value).getTime();
      if (conversions) {
        value = conversions(value);
      }
      return value;
    }
  }.bind(this));
  if ((typeof this.options.formatDateIndex === 'undefined') ||
       (this.options.formatDateIndex < 0) ||
       (this.options.formatDateIndex > dateFormats.length -1)) {
    this.options.formatDateIndex = 0;
  }
  this.widget = React.createElement(React.createClass({
    getInitialState: function() {
      return {
        epochDate: undefined,
        formatDateIndex: this.props.options.formatDateIndex
      }
    },
    componentDidMount: function() {
      if (this.props.valueStream) {
        if (this.unsubscribe) {
          this.unsubscribe();
        }
        this.unsubscribe = this.props.valueStream.onValue(function(value) {
          this.setState({epochDate: value});
        }.bind(this));
      }
    },
    componentWillUnmount: function() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    },
    changeDateFormat: function() {
      const newFormatDateIndex = this.state.formatDateIndex === dateFormats.length -1 ? 0 : this.state.formatDateIndex +1;
      this.setState({ formatDateIndex: newFormatDateIndex});
      this.props.options.formatDateIndex = newFormatDateIndex;
      this.props.instrumentPanel.persist();
    },
    render: function() {
      var textDate = {};
      if(typeof this.state.epochDate !== 'undefined') {
        const dateObject = new Date(this.state.epochDate);
        textDate = dateFormats[this.state.formatDateIndex](dateObject);
      } else {
        textDate = {date: '--/--/--', time: '--:--:--'};
      }
      return (
        <svg key={id} onClick={this.changeDateFormat} height="100%" width="100%" viewBox="0 0 20 40">
          <text x="10" y="5" textAnchor="middle" fontSize="4" dominantBaseline="middle">{textDate.label + " (" + (options.convertTo !== undefined ? options.convertTo : options.unit) + ")"}</text>
          <text x="10" y="17" textAnchor="middle" fontSize={textDate.fontSizeDate} dominantBaseline="middle">{textDate.date}</text>
          <text x="10" y="32" textAnchor="middle" fontSize="16" dominantBaseline="middle">{textDate.time}</text>
          <text x="10" y="37" textAnchor="middle" fontSize="3" dominantBaseline="middle">{options.sourceId}</text>
        </svg>
      )
    }
  }),{
    key: id,
    valueStream: valueStream,
    options: this.options,
    instrumentPanel: this.instrumentPanel
  });
}

DigitalDateTime.prototype.getReactElement = function() {
  return this.widget;
}

DigitalDateTime.prototype.getSettingsElement = function() {
  var that = this;
  return SettingsPanel({
    options: this.options,
    unit: this.options.unit,
    onUnitChange: function(event) {
      that.options.convertTo = event.target.value === that.options.unit ? undefined : event.target.value;
      that.instrumentPanel.persist();
      that.instrumentPanel.pushGridChanges();
    }
  });
}

DigitalDateTime.prototype.getType = function() {
  return "digitaldatetime";
}

DigitalDateTime.prototype.getOptions = function() {
  return this.options;
}

DigitalDateTime.prototype.getInitialDimensions = function() {
  return {h:3};
}


module.exports = {
  constructor: DigitalDateTime,
  type: "digitaldatetime",
  paths: ['navigation.datetime']
}
