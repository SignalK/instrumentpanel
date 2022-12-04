import React from 'react';
import BaseWidget, { defaultComponentDidMount, defaultComponentWillUnmount } from './basewidget';

export default class DigitalComponent extends React.Component {
  constructor(props) {
    super(props);
    this.finalUnit = '';
    this.dynamicPositions = {
      unitFontSize: 4
    }
    this.widgetLabel = ''
    this.onOptionsUpdate = this.onOptionsUpdate.bind(this);
    this.onNavBarHideShow = this.onNavBarHideShow.bind(this);
    this.onOptionsUpdate(this.props.optionsBundle.getOptions());
    this.onNavBarHideShow(true);
    this.state = {
      value: '-'
    };
  }

  render() {
    try {
      return (
        <svg height="100%" width="100%" viewBox="0 0 20 33" stroke="none">
          {this.dynamicPositions.labelVisible && <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle" textDecoration={this.dynamicPositions.labelTextDecoration}>
            {this.widgetLabel}
          </text>}
          <text textAnchor="end" x="68" y="30" fontSize={this.dynamicPositions.unitFontSize} dominantBaseline="baseline">{this.finalUnit}</text>
          <text textAnchor="middle" x="10" y={this.dynamicPositions.valueY} fontSize={this.dynamicPositions.valueFontSize} dominantBaseline="middle">
            {this.state.value.toString()}
          </text>
        </svg>
      )
    } catch (ex) { console.log(ex) }
    return (<div>safety mode</div>)
  }

  componentDidMount() {
    defaultComponentDidMount(this, undefined, BaseWidget.prototype.defaultPostConversion);
  }

  componentWillUnmount() {
    defaultComponentWillUnmount(this);
  }

  onOptionsUpdate(options) {
    this.finalUnit = this.props.optionsBundle.getFinalUnit(options);
    if (this.finalUnit) {
      this.dynamicPositions.unitFontSize = (this.finalUnit.length > 4) ? "4" : "8";
    }
    this.widgetLabel = options.label;
    this.fixedDecimal = BaseWidget.prototype.getFixedDecimalByUnit(this.finalUnit);
  }

  onNavBarHideShow(navBarVisible) {
    this.dynamicPositions.labelVisible = navBarVisible || !this.props.optionsBundle.getOptions().hideLabel
    if (this.dynamicPositions.labelVisible) {
      this.dynamicPositions.valueY = 22
      this.dynamicPositions.valueFontSize = 29
      this.dynamicPositions.labelTextDecoration = (this.props.instrumentPanel.model.get().settingsVisible && this.props.optionsBundle.getOptions().hideLabel) ? "line-through" : ""
    } else {
      this.dynamicPositions.valueY = 20
      this.dynamicPositions.valueFontSize = 38
      this.dynamicPositions.labelTextDecoration = ""
    }
  }
}
