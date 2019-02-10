import React from 'react';
import {arc as d3arc} from 'd3-shape';
import {scaleLinear} from "d3-scale";

import gaugeComponents from './gaugecomponents';
import BaseWidget from './basewidget';

var getShadow = gaugeComponents.getShadow;
var getHand = gaugeComponents.getHand;

var size = 400;
var half = size / 2;
var strokeWidth = 25;

export default class AnalogComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      label: this.props.label,
      minValue: this.props.minValue || 0,
      maxValue: this.props.maxValue || 2,
      redLine: this.props.redLine || 1.5
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.valueStream !== this.props.valueStream) {
      if (nextProps.valueStream) {
        this.unsubscribes.push(nextProps.valueStream.onValue(function(value) {
          if (typeof value === 'number') {
            this.setState({
              value: value
            });
          }
        }.bind(this)));
      }
    }
  }

  renderTicks(scale) {
    var yOffset = 0;
    return scale.ticks().map(function(i) {
      return (
        <g key={"text-" + i} transform={'rotate(' + scale(i) + ' 200 0)'}>
          <text x={-half} y={yOffset + 10} textAnchor="middle" dominantBaseline="central" style={{"fontSize":"28px"}}
          transform={"rotate(" + -scale(i) + ")"}>{i}</text>
        </g>
      )
    });
  }

  render() {
    try {
      var degreesScale = scaleLinear()
        .domain([this.state.minValue, this.state.maxValue])
        .range([10, 170]).clamp(true);

      var radianScale = scaleLinear()
        .domain([this.state.minValue, this.state.maxValue])
        .range([-80, 80]);

      var arcInset = 30;

      var arc = d3arc()
        .startAngle(deg2rad(-80))
        .endAngle(deg2rad(80))
        .innerRadius(half  - strokeWidth - arcInset)
        .outerRadius(half - arcInset)
        .cornerRadius(strokeWidth/4);

      var redArc = d3arc()
        .startAngle(deg2rad(radianScale(this.state.redLine)))
        .endAngle(deg2rad(radianScale(this.state.maxValue)))
        .innerRadius(half  - strokeWidth - arcInset)
        .outerRadius(half - arcInset)
        .cornerRadius(strokeWidth/4);

      var innerArc = d3arc()
        .startAngle(deg2rad(-80))
        .endAngle(deg2rad(80))
        .outerRadius(half  - strokeWidth - arcInset)
        .innerRadius(half / 20);

      var ticks = degreesScale.ticks([5]).slice(1,5);

      return (
        <svg height="100%" width="100%" viewBox="0 -20 400 240">
          <svg dangerouslySetInnerHTML={getShadow()} />
          <g transform={'translate(' + half + ',' + half + ' )'} stroke="black">

          {ticks.map(function(i){
            return (
              <path key={"tick-" + i}
                    d={"M -180 0 L -176 0"}
                    strokeWidth={2}
                    transform={'rotate(' + degreesScale(i) + ')'}
                    stroke="black"/>
            )
          })}

          <path d={arc()} stroke="black" strokeWidth="5" fill="white" />

          <path d={redArc()} stroke="black" strokeWidth="5" fill="red" />

          {getHand(200 - arcInset/2, degreesScale(this.state.value)-90)}

          <path d={innerArc()} stroke="none" strokeWidth="5" fill="#efefef" opacity="0.8" />

          {this.renderTicks(degreesScale)}

          <text  y="-75" textAnchor="middle" fontSize="70" dominantBaseline="middle">
            <tspan x="0">{BaseWidget.prototype.displayValue(this.state.value)}</tspan>
            <tspan x="0" dy="45" fontSize="30">{this.props.convertTo ? this.props.convertTo : (this.props.unit||' ')}</tspan>
            <tspan x="0" dy="32" fontSize="30">{this.props.label}</tspan>
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
        if (typeof value === 'number') {
          this.setState({
            value: value
          });
        }
      }.bind(this)));
    }
    this.unsubscribes.push(this.props.maxValueStream.onValue(function(value) {
      this.setState({
        maxValue: value
      });
    }.bind(this)));
    this.unsubscribes.push(this.props.minValueStream.onValue(function(value) {
      this.setState({
        minValue: value
      });
    }.bind(this)));
    this.unsubscribes.push(this.props.redLineStream.onValue(function(value) {
      this.setState({
        redLine: value
      });
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
