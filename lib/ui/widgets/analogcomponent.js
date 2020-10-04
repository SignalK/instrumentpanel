import React from 'react';
import {arc as d3arc} from 'd3-shape';
import {scaleLinear} from "d3-scale";

import BaseWidget from './basewidget';
import {safeNumber} from '../settings/conversions';
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
    this.state = {
      value: 0,
      minValue: this.props.options.minValue || 0,
      maxValue: this.props.options.maxValue || 2,
      redLine: this.props.options.redLine || 1.5,
      zoneMode: this.props.options.zoneMode || 'local',
      statesColor: (
        typeof props.options.statesColor === 'object'  &&
        props.options.statesColor !== null
      ) ? props.options.statesColor : defaultStatesColor
    };
    this.widgetZones = [];
    this.buildWidgetZones = this.buildWidgetZones.bind(this);
    this.buildWidgetZones();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.options.selectedWidget === 1) {
      this.setState({
        minValue: this.props.options.minValue || 0,
        maxValue: this.props.options.maxValue || 2
      }, this.buildWidgetZones);
    }

    if(nextProps.valueStream !== this.props.valueStream) {
      if (nextProps.valueStream) {
        this.unsubscribes.push(nextProps.valueStream.onValue(function(value) {
          this.setState({
            value: value
          });
        }.bind(this)));
      }
    }
  }

  buildWidgetZones() {
    var that = this;
    var keyID = 0;
    this.widgetZones = [];
    if (this.state.zoneMode === 'local') {
      this.widgetZones.push({
        min: this.state.redLine,
        max: this.state.maxValue,
        color: 'red',
        keyID: 0
      })
    } else if (Array.isArray(this.props.options.zones)){
      this.props.options.zones.forEach(zone =>{
        var widgetZone = {};
        if (typeof zone.upper === 'undefined' && typeof zone.lower !== 'undefined') {
          widgetZone.min = (zone.lower < that.state.minValue) ? that.state.minValue : zone.lower;
          widgetZone.max = that.state.maxValue;
        } else if (typeof zone.upper !== 'undefined' && typeof zone.lower === 'undefined') {
          widgetZone.min = that.state.minValue;
          widgetZone.max = (zone.upper > that.state.maxValue) ? that.state.maxValue : zone.upper;
        } else if (typeof zone.upper !== 'undefined' && typeof zone.lower !== 'undefined') {
          widgetZone.min = (zone.lower < that.state.minValue) ? that.state.minValue : zone.lower;
          widgetZone.max = (zone.upper > that.state.maxValue) ? that.state.maxValue : zone.upper;
        } else { // something wrong ????
          widgetZone.min = 0;
          widgetZone.max = 0;
        }
        var color = colorsToHTML[that.state.statesColor[zone.state]];
        if(color === null) color = 'none';
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
    const yLength = -length +9;
    return (
      <React.Fragment>
        <path d={'M 0 ' + yLength + ' l -12 ' + length / 1.055 + ' a 1 1 0 0 1 24 0 z'} fill="rgba(221, 221, 221, 0.6)" strokeWidth="1" transform={'rotate(' + angle + ' 0 0)'}/>
        <path d={'M 0 ' + yLength + ' l -5 ' + length / 2.9 + ' l 10 0 z'} transform={'rotate(' + angle + ' 0 0)'}/>
      </React.Fragment>
    )
  }

  renderTicks(scale) {
    var count = 0;
    return scale.ticks().map(function(i) {
      const scaleI = scale(i);
      var textAnchor = 'middle';
      var xOffset = -15;

      if (scaleI < 65) {
        textAnchor = 'end';
        xOffset = 0;
      } else if (scaleI > 115) {
          textAnchor = 'start';
          xOffset = -30;
        }
      var tickLength = (count % 2) ? "M -185 0 L -155 0" : "M -190 0 L -155 0";
      var tickWidth = (count % 2) ? 1 : 2;
      count += 1;
      return (
        <React.Fragment key={"ticks-" + i}>
          <path key={"tick-" + i} d={tickLength} strokeWidth={tickWidth} transform={'rotate(' + scaleI + ')'}/>
          <g key={"text-" + i} transform={'rotate(' + scaleI + ' 215 0)'}>
            <text x={-half + xOffset} y="10" textAnchor={textAnchor} dominantBaseline="central" style={{"fontSize":"28px"}}
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
        .innerRadius(half  - strokeWidth - arcInset)
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
        .domain([this.state.minValue, this.state.maxValue])
        .range([10, 170]).clamp(true);

      var radianScale = scaleLinear()
        .domain([this.state.minValue, this.state.maxValue])
        .range([-80, 80]);

      var arc = d3arc()
        .startAngle(deg2rad(-80))
        .endAngle(deg2rad(80))
        .innerRadius(half  - strokeWidth - arcInset)
        .outerRadius(half - arcInset);

      var value = safeNumber(this.state.value);

      return (
        <svg height="100%" width="100%" viewBox="0 -20 400 240">
          <g transform={'translate(' + half + ',' + half + ' )'}>

          <path d={arc()} strokeWidth="2" fill="none"/>

          {this.widgetZones.map(zone => {
            return this.renderColorArc(zone, radianScale)
          })}

          <text  y="-75" textAnchor="middle" fontSize="70" dominantBaseline="middle" stroke="none">
            <tspan x="0">{BaseWidget.prototype.displayValue(this.state.value)}</tspan>
            <tspan x="0" dy="45" fontSize="30">{this.props.options.convertTo ? this.props.options.convertTo : (this.props.options.unit||' ')}</tspan>
          </text>

          {this.renderTicks(degreesScale)}

          {this.getHandClear(200 , degreesScale(value)-90)}

          <text  y="-35" textAnchor="middle" fontSize="70" dominantBaseline="middle" stroke="none">
            <tspan x="0" dy="32" fontSize="30">{this.props.options.label}</tspan>
          </text>

          </g>
        </svg>
      )
    } catch (ex) {
      console.log(ex)
    }
    return (<div>failsafe</div>)
  }

  componentDidMount() {
    if (this.unsubscribes) {
      this.unsubscribes.forEach(function(unsubscribe) {
        unsubscribe()
      });
    }
    this.unsubscribes = [];
    if (this.props.valueStream) {
      this.unsubscribes.push(this.props.valueStream.onValue(function(value) {
        this.setState({
          value: value
        });
      }.bind(this)));
    }
    this.unsubscribes.push(this.props.settingsStream.onValue(function(value) {
      this.setState(value, this.buildWidgetZones);
    }.bind(this)));
  }

  componentWillUnmount() {
    this.unsubscribes.forEach(function(unsubscribe) {
      unsubscribe()
    });
  }
};

function deg2rad(deg) {
  return deg / 180 * Math.PI;
}
