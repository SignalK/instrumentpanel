import React from 'react';
import BaseWidget, {defaultComponentDidMount, defaultComponentWillUnmount} from './basewidget';

export default class DigitalComponent extends React.Component {
  constructor(props) {
    super(props);
    this.finalUnit = '';
    this.unitFontSize = 4;
    this.widgetLabel = ''
    this.onOptionsUpdate = this.onOptionsUpdate.bind(this);
    this.onOptionsUpdate(this.props.optionsBundle.getOptions());
    this.state = {
      value: '-'
    };
  }

  render() {
    try {
      return (
        <svg height="100%" width="100%" viewBox="0 0 20 33" stroke="none">
          <text x="10" y="4" textAnchor="middle" fontSize="6" dominantBaseline="middle">
            {this.widgetLabel}
          </text>
          <text textAnchor="end" x="60" y="30" fontSize={this.unitFontSize} dominantBaseline="baseline">{this.finalUnit}</text>
          <text textAnchor="middle" x="10" y="22" fontSize="29" dominantBaseline="middle">
            {this.state.value.toString()}
          </text>
        </svg>
      )
    } catch (ex) {console.log(ex)}
    return (<div>safety mode</div>)
  }

  componentDidMount() {
    defaultComponentDidMount(this,undefined,BaseWidget.prototype.defaultPostConversion);
  }

  componentWillUnmount() {
    defaultComponentWillUnmount(this);
  }

  onOptionsUpdate(options) {
    this.finalUnit = this.props.optionsBundle.getFinalUnit(options);
    if (this.finalUnit) {
      this.unitFontSize = (this.finalUnit.length > 4) ? "4" : "8";
    }
    this.widgetLabel = options.label;
  }
}
