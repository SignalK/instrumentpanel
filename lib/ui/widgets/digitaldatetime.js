import React from 'react';
import { render } from 'react-dom';
import util from 'util'

import { getConversion } from '../settings/conversions'
import BaseWidget, { defaultComponentDidMount, defaultComponentWillUnmount } from './basewidget';

function pad(n) { return n < 10 ? '0' + n : n; }
var defaultTextDate = { date: '--/--/--', time: '--:--:--', fontSizeDate: 9 };

var dateFormats = [
  function (dateObject) {
    return {
      date: dateObject.getUTCFullYear() + "/" + pad(dateObject.getUTCMonth() + 1) + "/" + pad(dateObject.getUTCDate()),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'YYYY/MM/DD',
      fontSizeDate: 11
    }
  },
  function (dateObject) {
    return {
      date: pad(dateObject.getUTCDate()) + "/" + pad(dateObject.getUTCMonth() + 1) + "/" + dateObject.getUTCFullYear(),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'DD/MM/YYYY',
      fontSizeDate: 11
    }
  },
  function (dateObject) {
    return {
      date: pad(pad(dateObject.getUTCMonth() + 1) + "/" + dateObject.getUTCDate()) + "/" + dateObject.getUTCFullYear(),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'MM/DD/YYYY',
      fontSizeDate: 11
    }
  },
  function (dateObject) {
    return {
      date: dateObject.getUTCFullYear().toString().substring(2) + "/" + pad(dateObject.getUTCMonth() + 1) + "/" + pad(dateObject.getUTCDate()),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'YY/MM/DD',
      fontSizeDate: 11
    }
  },
  function (dateObject) {
    return {
      date: pad(dateObject.getUTCDate()) + "/" + pad(dateObject.getUTCMonth() + 1) + "/" + dateObject.getUTCFullYear().toString().substring(2),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'DD/MM/YY',
      fontSizeDate: 11
    }
  },
  function (dateObject) {
    return {
      date: pad(dateObject.getUTCMonth() + 1) + "/" + pad(dateObject.getUTCDate()) + "/" + dateObject.getUTCFullYear().toString().substring(2),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'MM/DD/YY',
      fontSizeDate: 11
    }
  },
  function (dateObject) {
    return {
      date: dateObject.toDateString(),
      time: pad(dateObject.getUTCHours()) + ":" + pad(dateObject.getUTCMinutes()) + ":" + pad(dateObject.getUTCSeconds()),
      label: 'D M DD YYYY',
      fontSizeDate: 9
    }
  }
]

export function getDateFormatLabels() {
  return dateFormats.map(dateFormat => { return dateFormat(new Date()).label })
}

export function getIndexFromDateFormatLabel(label) {
  return dateFormats.findIndex(dateFormat => { return dateFormat(new Date()).label === label })
}

function DigitalDateTime(id, options, streamBundle, instrumentPanel) {
  options.unit = "UTC";
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);

  if (typeof this.options.formatDateIndex === 'undefined') {
    let index = getIndexFromDateFormatLabel(instrumentPanel.preferredUnits['date']);
    this.options.formatDateIndex = (index > 0) ? index : 0;
  }
  this.options.formatDateIndex = this.options.formatDateIndex % dateFormats.length;

  class ReactComponent extends React.Component {
    constructor(props) {
      super(props);
      this.dynamicPositions = {};
      this.handleTimeoutLabel = null;
      this.widgetLabel = '';
      this.formatDateIndex = 0;
      this.changeDisplayMode = this.changeDisplayMode.bind(this);
      this.preConversion = this.preConversion.bind(this);
      this.postConversion = this.postConversion.bind(this);
      this.onOptionsUpdate = this.onOptionsUpdate.bind(this);
      this.onNavBarHideShow = this.onNavBarHideShow.bind(this);
      this.onOptionsUpdate(props.optionsBundle.getOptions());
      this.onNavBarHideShow(true);
      this.state = {
        value: defaultTextDate,
      };
    }

    preConversion(dateStr) {
      return (dateStr !== null) ? new Date(dateStr).getTime() : NaN;
    }

    postConversion(value) {
      try {
        if (isNaN(value)) return defaultTextDate;
        let dateObject = new Date(value);
        if (!isValidDate(dateObject)) return defaultTextDate;
        return dateFormats[this.formatDateIndex](dateObject);
      } catch (ex) {
        return defaultTextDate;
      }
    }

    onOptionsUpdate(options) {
      if (this.handleTimeoutLabel !== null) {
        this.widgetLabel = dateFormats[options.formatDateIndex](new Date()).label;
      } else {
        this.widgetLabel = options.label;
        this.widgetLabel = this.widgetLabel.replace('navigation.', '');
        this.widgetLabel = this.widgetLabel.replace('environment.', '');
        this.widgetLabel = this.widgetLabel.replace('electrical.', '');

      }
      this.widgetLabel += " (" + this.props.optionsBundle.getFinalUnit(options) + ")";
      this.formatDateIndex = options.formatDateIndex;
    }

    componentDidMount() {
      this.props.functions['changeDisplayMode'] = this.changeDisplayMode;
      defaultComponentDidMount(this, this.preConversion, this.postConversion);
    }

    componentWillUnmount() {
      clearTimeout(this.handleTimeoutLabel);
      this.props.functions['changeDisplayMode'] = undefined;
      defaultComponentWillUnmount(this);
    }

    changeDisplayMode() {
      const firstClic = (this.handleTimeoutLabel === null) ? true : false;
      clearTimeout(this.handleTimeoutLabel);
      this.handleTimeoutLabel = setTimeout(() => {
        this.handleTimeoutLabel = null;
        this.props.optionsBundle.setOptions(null);
      }, 5000);
      if (!firstClic) {
        let newFormatDateIndex = this.props.optionsBundle.getOptions().formatDateIndex;
        newFormatDateIndex = (newFormatDateIndex + 1) % dateFormats.length;
        this.props.optionsBundle.setOptions({ formatDateIndex: newFormatDateIndex });
      } else {
        this.props.optionsBundle.setOptions(null);
      }
    }

    onNavBarHideShow(navBarVisible) {
      this.dynamicPositions.labelVisible = navBarVisible || !this.props.optionsBundle.getOptions().hideLabel
      if (this.dynamicPositions.labelVisible) {
        this.dynamicPositions.yDate = 10
        this.dynamicPositions.yTime = 23
        this.dynamicPositions.incFontSize = 0
      } else {
        this.dynamicPositions.yDate = 7
        this.dynamicPositions.yTime = 23
        this.dynamicPositions.incFontSize = 3
      }
    }

    render() {
      try {
        return (
          <svg key={id} height="100%" width="100%" viewBox="0 0 20 30" stroke="none">
            {this.dynamicPositions.labelVisible && <text x="10" y="3" textAnchor="middle" fontSize="4" dominantBaseline="middle">{this.widgetLabel}</text>}
            <text x="10" y={this.dynamicPositions.yDate} textAnchor="middle" fontSize={this.state.value.fontSizeDate + this.dynamicPositions.incFontSize} dominantBaseline="middle">{this.state.value.date}</text>
            <text x="10" y={this.dynamicPositions.yTime} textAnchor="middle" fontSize={17 + this.dynamicPositions.incFontSize} dominantBaseline="middle">{this.state.value.time}</text>
          </svg>
        )
      } catch (ex) { console.log(ex) }
      return (<div>safety mode</div>)
    }
  }

  ReactComponent.defaultProps = {
    withClickMe: true,
    functions: {}
  }

  this.widget = React.createElement(ReactComponent, {
    key: id,
    valueStream: this.valueStream,
    instrumentPanel: this.instrumentPanel,
    optionsBundle: this.optionsBundle,
  });
}

util.inherits(DigitalDateTime, BaseWidget);

DigitalDateTime.prototype.getReactElement = function () {
  return this.widget;
}

DigitalDateTime.prototype.getSettingsElement = function (pushCellChange) {
  return (
    <React.Fragment>
      {this.getSettingsElementHideLabelOnly(pushCellChange)}
      {this.getSettingsElementUnitOnly(pushCellChange)}
    </React.Fragment>
  )
}

DigitalDateTime.prototype.getType = function () {
  return "digitaldatetime";
}

DigitalDateTime.prototype.getInitialDimensions = function () {
  return { h: 2 };
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

export default {
  constructor: DigitalDateTime,
  type: "digitaldatetime",
  paths: [
    'navigation.datetime',
    'environment.tide.timeLow',
    'environment.tide.timeHigh',
    'electrical.batteries.*.dateInstalled',
    'electrical.inverters.*.dateInstalled',
    'electrical.chargers.*.dateInstalled',
    'electrical.alternators.*.dateInstalled',
    'environment.forecast.time.*'
  ]
}
