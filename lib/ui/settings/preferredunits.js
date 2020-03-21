/**
 * PreferredUnits
 *
 */
import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import {Panel, ButtonGroup, Button} from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import {
  conversionsToOptions,
  getConversionsList
} from './conversions'

export default class PreferredUnits extends React.Component {
  constructor(props) {
    super(props);
    this.applyPreferredUnits = this.applyPreferredUnits.bind(this);
    this.resetPreferredUnits = this.resetPreferredUnits.bind(this);
  }

  applyPreferredUnits() {
    this.props.instrumentPanel.setReloadRequired();
    this.props.instrumentPanel.getPages().map((page, pageNum) => {
      this.props.instrumentPanel.getWidgets(pageNum).map((widget) => {
        const widgetUnit = widget.getOptions().unit;
        if ((widgetUnit !== 'deg') && (widgetUnit !== '') && (typeof widgetUnit !== 'undefined')) {
          widget.options.convertTo = this.props.instrumentPanel.getPreferredUnit(widgetUnit);
        }
      })
    })
    this.props.instrumentPanel.persist();
  }

  resetPreferredUnits() {
    if (confirm("You will reset the settings of your preferred units")) {
      this.props.instrumentPanel.resetPreferredUnit();
    }
  }

  render() {
    return (
      <Panel>
        <Panel.Heading>
          <ButtonGroup className="pull-right">
            <Button bsClass="navbar-btn" className="btn" onClick={this.applyPreferredUnits}>Apply</Button>
            <Button bsClass="navbar-btn" className="btn" onClick={this.resetPreferredUnits}>Reset</Button>
          </ButtonGroup>
        </Panel.Heading>
        <Panel.Body>
          <div className='items'>
            {getConversionsList().map(unit => {
              if (unit === 'rad') {return null}
              return (<PreferredUnitSelect key={unit} instrumentPanel={this.props.instrumentPanel} unit={unit}/>)
            })}
          </div>
        </Panel.Body>
      </Panel>
    );
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }
};

PreferredUnits.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};

class PreferredUnitSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.instrumentPanel.getPreferredUnit(this.props.unit) || this.props.unit
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    console.log(this.props.unit + ' change from:' + this.state.value + ' to:' + event.target.value);
    if (this.props.instrumentPanel.setPreferredUnit(this.props.unit, event.target.value))
      this.setState({value: event.target.value});
  }

  render() {
    return (
      <span className='item'>
      <b>{this.props.unit}</b> show in &nbsp;
      <select value={this.state.value} onChange={this.handleChange}>
        <option key={this.props.unit} value={this.props.unit}>{this.props.unit}</option>
        {conversionsToOptions(this.props.unit)}
      </select>
      </span>
    );
  }
};

PreferredUnitSelect.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired,
  unit: PropTypes.string
};
