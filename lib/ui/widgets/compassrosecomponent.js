import React from 'react';

import {defaultComponentDidMount, defaultComponentWillUnmount} from './basewidget';
import {postConversion, onOptionsUpdate} from './compass';
import {
  safeNumber
} from '../settings/conversions';

var size = 400;
var half = size / 2;

export default class CompassRoseComponent extends React.Component {
  constructor(props) {
    super(props);
    this.widgetLabel = '';
    this.renderDirName = this.renderDirName.bind(this);
    this.onOptionsUpdate = onOptionsUpdate.bind(this);
    this.onOptionsUpdate(this.props.optionsBundle.getOptions());
    this.state = {
      value: {angle: NaN, safeAngle: 0, angleText: '-'}
    };
  }

  renderTicks() {
    var ticks = [],
        tick;
    for (var i = 0; i < 180; i += 5) {
      if(i % 10 == 0) {
        tick = 0.1 * half;
      } else {
        tick = 0.07 * half;
      }

      if(i % 45 != 0) {
        ticks.push(
          <path key={i} d={["M", half, "0 L", half, tick, "M", half,
            size - tick, "L", half, size].join(" ")} strokeWidth="1"
            transform={centerRotate(i)} />
        );
      }
    }

    return ticks;
  }

  renderDirName(angle, safeAngle) {
    let index = (angle === safeAngle) ? Math.round(angle / 11.25) : 32;
    var dirs = {
      0: 'North',
      1: 'North by East',
      2: 'North Northeast',
      3: 'Northeast by North',
      4: 'Northeast',
      5: 'Northeast by East',
      6: 'East Northeast',
      7: 'East by North',
      8: 'East',
      9: 'East by South',
      10: 'East Southeast',
      11: 'Southeast by East',
      12: 'Southeast',
      13: 'Southeast by South',
      14: 'South Southeast',
      15: 'South by East',
      16: 'South',
      17: 'South by West',
      18: 'South Southwest',
      19: 'Southwest by South',
      20: 'Southwest',
      21: 'Southwest by West',
      22: 'West Southwest',
      23: 'West by South',
      24: 'West',
      25: 'West by North',
      26: 'West Northwest',
      27: 'Northwest by West',
      28: 'Northwest',
      29: 'Northwest by North',
      30: 'North Northwest',
      31: 'North by West',
      32: '--'
    };

    return dirs[index];
  }

  renderRoseStyle2() {
    return (
      <g id="layer1" fill="none" strokeWidth="0" stroke="none" transform="translate(200,200) scale(1.25)">
        <path d="M -7.701 -7.071 0 -150 7.071 -7.071 100 0 7.071 7.071 0 100 -7.071 7.071 -100 0 Z" fill="url(#g1)" />
        <path d="M -53.033 -53.033 0 -10 53.033 -53.033 10 0 53.033 53.033 0 10 -53.033 53.033 -10 0 Z" fill="url(#g1)" />
        <path d={"M -46.194 -19.134 -7.071 -7.071 -19.134 -46.194 0 -10 19.134 -46.194 7.071 -7.071 46.194 -19.134 10 0 " +
                 "46.194 19.134 7.071 7.071 19.314 46.194 0 10 -19.314 46.194 -7.071 7.071 -46.194 19.134 -10 0 Z"} fill="url(#g1)" />
      </g>
    );
  }

  renderGradient() {
    return (
      <svg dangerouslySetInnerHTML={{__html:
        '  <linearGradient id="g1">' +
        '    <stop offset="0%" stop-color="rgba(10,10,40,0.5)" />' +
        '    <stop offset="100%" stop-color="rgba(200,240,200,0.5)" />' +
        '  </linearGradient>'
      }} />
    );
  }

  render() {
    try {
      return (
        <svg height="100%" width="100%" viewBox="0 0 400 400">
          {this.renderGradient()}
          <g transform="scale(0.8) translate(50 50)">
            <g transform={centerRotate(-this.state.value.safeAngle)}>
            {this.renderTicks()}
            {mainDirs}
            {minorDirs}
            {isNaN(this.state.value.angle) ? undefined : this.renderRoseStyle2()}
            </g>
          </g>
          <text x="200" y="24" textAnchor="middle" fontSize="20" stroke="none">{this.widgetLabel}</text>
          <text x="200" y="325" textAnchor="middle" fontSize="28" stroke="none">{this.state.value.angleText}</text>
          <text x="200" y="390" textAnchor="middle" fontSize="20" stroke="none">{this.renderDirName(this.state.value.angle, this.state.value.safeAngle)}</text>
          <polygon points="200,60 195,90 205,90" fill="url(#g1)" />
          <polygon points="200,60 195,80 205,80" fill="url(#g1)" transform="rotate(45 200 200)" />
          <polygon points="200,60 195,80 205,80" fill="url(#g1)" transform="rotate(315 200 200)" />
        </svg>
      )
    } catch (ex) {console.log(ex)}
    return (<div>safety mode</div>)
  }

  componentDidMount() {
    defaultComponentDidMount(this,undefined,postConversion);
  }

  componentWillUnmount() {
    defaultComponentWillUnmount(this);
  }
};

function centerRotate(deg) {
  return "rotate(" + deg + " " + half + " " + half + ")";
}

function toMainDirText(dir, i) {
  return (
    <text key={i*90}
       x={half}
       y={0.06 * size * 0.8}
       textAnchor="middle"
       fontSize={(0.07 * size) + "px"}
       transform={centerRotate(i*90)} stroke="none">{dir}</text>
  );
}

function toMinorDirText(dir, i) {
  return (
    <text key={i*90+45}
       x={half}
       y={0.045 * size * 0.8}
       textAnchor="middle"
       fontSize={(0.03 * size) + "px"}
       transform={centerRotate(i*90+45)} stroke="none">{dir}</text>
  );
}

var mainDirs = ['N', 'E', 'S', 'W'].map(toMainDirText);
var minorDirs = ['NE', 'SE', 'SW', 'NW'].map(toMinorDirText);
