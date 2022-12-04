import React from 'react';
import { arc as d3arc } from 'd3-shape';
import { scaleLinear } from "d3-scale";

import BaseWidget, { defaultComponentDidMount, defaultComponentWillUnmount } from './basewidget';
import { safeNumber } from '../settings/conversions';
import {
  colorsToHTML,
  defaultStatesColor
} from '../settings/constants';

var size = 400;
var half = size / 2;
var strokeWidth = 25;
var arcInset = 20;

export default class AnalogComponent extends React.Component {
  constructor(props) {
    super(props);
    this.dynamicPositions = {}
    this.finalUnit = '';
    this.minValue = 0;
    this.maxValue = 0;
    this.widgetLabel = '';
    this.widgetZones = [];
    this.buildWidgetZones = this.buildWidgetZones.bind(this);
    this.onOptionsUpdate = this.onOptionsUpdate.bind(this);
    this.onNavBarHideShow = this.onNavBarHideShow.bind(this);
    this.onOptionsUpdate(this.props.optionsBundle.getOptions());
    this.onNavBarHideShow(true);
    this.state = {
      value: { displayValue: '-', value: 0 }
    };
  }

  onOptionsUpdate(options) {
    this.buildWidgetZones(options);
    this.finalUnit = this.props.optionsBundle.getFinalUnit(options);
    this.minValue = options.minValue;
    this.maxValue = options.maxValue;
    this.widgetLabel = options.label;
    this.fixedDecimal = BaseWidget.prototype.getFixedDecimalByUnit(this.finalUnit);;
  }

  postConversion(value, fixedDecimal) {
    return {
      displayValue: BaseWidget.prototype.defaultPostConversion(value, fixedDecimal),
      value: safeNumber(value)
    }
  }

  buildWidgetZones(options) {
    var that = this;
    var keyID = 0;
    this.widgetZones = [];
    if (options.zoneMode === 'local') {
      this.widgetZones.push({
        min: options.redLine,
        max: options.maxValue,
        color: 'red',
        keyID: 0
      })
    } else if (Array.isArray(options.zones)) {
      options.zones.forEach(zone => {
        var widgetZone = {};
        if (typeof zone.upper === 'undefined' && typeof zone.lower !== 'undefined') {
          widgetZone.min = (zone.lower < options.minValue) ? options.minValue : zone.lower;
          widgetZone.max = options.maxValue;
        } else if (typeof zone.upper !== 'undefined' && typeof zone.lower === 'undefined') {
          widgetZone.min = options.minValue;
          widgetZone.max = (zone.upper > options.maxValue) ? options.maxValue : zone.upper;
        } else if (typeof zone.upper !== 'undefined' && typeof zone.lower !== 'undefined') {
          widgetZone.min = (zone.lower < options.minValue) ? options.minValue : zone.lower;
          widgetZone.max = (zone.upper > options.maxValue) ? options.maxValue : zone.upper;
        } else { // something wrong ????
          widgetZone.min = 0;
          widgetZone.max = 0;
        }
        var color = colorsToHTML[options.statesColor[zone.state]];
        if (color === null) color = 'none';
        widgetZone.color = color;
        widgetZone.keyID = keyID;
        if (typeof color !== 'undefined') {
          that.widgetZones.push(widgetZone);
          keyID += 1;
        }
      })
    }
  }

  getHandClear(length, angle) {
    const yLength = -length + 9;
    isNaN(angle) && (angle = 0);
    return (
      <React.Fragment>
        <path d={'M 0 ' + yLength + ' l -12 ' + length / 1.055 + ' a 1 1 0 0 1 24 0 z'} fill="rgba(221, 221, 221, 0.6)" strokeWidth="1" transform={'rotate(' + angle + ' 0 0)'} />
        <path d={'M 0 ' + yLength + ' l -5 ' + length / 2.9 + ' l 10 0 z'} transform={'rotate(' + angle + ' 0 0)'} />
      </React.Fragment>
    )
  }

  renderTicks(scale) {
    var count = 0;
    return scale.ticks().map(function (i) {
      const scaleI = scale(i);
      var textAnchor = 'middle';
      var xOffset = -15;
      var yOffset = 10;

      if (scaleI < 65) {
        textAnchor = 'end';
        xOffset = 0;
        yOffset = 0;
      } else if (scaleI > 115) {
        textAnchor = 'start';
        xOffset = -30;
        yOffset = 0;
      }
      var tickLength = (count % 2) ? "M -185 0 L -155 0" : "M -190 0 L -155 0";
      var tickWidth = (count % 2) ? 1 : 2;
      count += 1;
      return (
        <React.Fragment key={"ticks-" + i}>
          <path key={"tick-" + i} d={tickLength} strokeWidth={tickWidth} transform={'rotate(' + scaleI + ')'} />
          <g key={"text-" + i} transform={'rotate(' + scaleI + ' 215 0)'}>
            <text x={-half + xOffset} y={yOffset} textAnchor={textAnchor} dominantBaseline="central" style={{ "fontSize": "28px" }}
              transform={"rotate(" + -scaleI + ")"} stroke="none">{i}</text>
          </g>
        </React.Fragment>
      )
    });
  }

  renderColorArc(zone, radianScale) {
    try {
      var arc = d3arc()
        .startAngle(deg2rad(radianScale(zone.min)))
        .endAngle(deg2rad(radianScale(zone.max)))
        .innerRadius(half - strokeWidth - arcInset)
        .outerRadius(half - arcInset);
      return (<path key={zone.keyID} d={arc()} strokeWidth="2" fill={zone.color} />)
    } catch (ex) {
      console.log(ex)
    }
    return null
  }

  render() {
    try {
      var degreesScale = scaleLinear()
        .domain([this.minValue, this.maxValue])
        .range([this.dynamicPositions.startScale, this.dynamicPositions.endScale]).clamp(true);

      var radianScale = scaleLinear()
        .domain([this.minValue, this.maxValue])
        .range([this.dynamicPositions.startAngle, this.dynamicPositions.endAngle]);

      var arc = d3arc()
        .startAngle(deg2rad(this.dynamicPositions.startAngle))
        .endAngle(deg2rad(this.dynamicPositions.endAngle))
        .innerRadius(half - strokeWidth - arcInset)
        .outerRadius(half - arcInset);

      return (
        <svg height="100%" width="100%" viewBox="0 -20 400 240">
          <g transform={'translate(' + half + ',' + half + ' )'}>

            <path d={arc()} strokeWidth="2" fill="none" />

            {this.widgetZones.map(zone => {
              return this.renderColorArc(zone, radianScale)
            })}

            <text y="-75" textAnchor="middle" fontSize="70" dominantBaseline="middle" stroke="none">
              <tspan x="0">{this.state.value.displayValue}</tspan>
              <tspan x="0" dy="45" fontSize="30">{this.finalUnit}</tspan>
            </text>

            {this.renderTicks(degreesScale)}

            {(this.state.value.displayValue !== 'null') ? this.getHandClear(200, degreesScale(this.state.value.value) - 90) : undefined}

            {this.dynamicPositions.labelVisible && <text y="-35" textAnchor="middle" fontSize="70" dominantBaseline="middle" stroke="none" textDecoration={this.dynamicPositions.labelTextDecoration}>
              <tspan x="0" dy="32" fontSize="30">{this.widgetLabel}</tspan>
            </text>}

          </g>
        </svg>
      )
    } catch (ex) { console.log(ex) }
    return (<div>safety mode</div>)
  }

  onNavBarHideShow(navBarVisible) {
    this.dynamicPositions.labelVisible = navBarVisible || !this.props.optionsBundle.getOptions().hideLabel
    if (this.dynamicPositions.labelVisible) {
      this.dynamicPositions.startAngle = -80
      this.dynamicPositions.endAngle = 80
      this.dynamicPositions.startScale = 10
      this.dynamicPositions.endScale = 170
      this.dynamicPositions.labelTextDecoration = (this.props.instrumentPanel.model.get().settingsVisible && this.props.optionsBundle.getOptions().hideLabel) ? "line-through" : ""
    } else {
      this.dynamicPositions.startAngle = -90
      this.dynamicPositions.endAngle = 90
      this.dynamicPositions.startScale = 0
      this.dynamicPositions.endScale = 180
      this.dynamicPositions.labelTextDecoration = ""
    }
  }

  componentDidMount() {
    defaultComponentDidMount(this, undefined, this.postConversion);
  }

  componentWillUnmount() {
    defaultComponentWillUnmount(this);
  }
};

function deg2rad(deg) {
  return deg / 180 * Math.PI;
}
