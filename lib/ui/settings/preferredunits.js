/**
 * PreferredUnits
 *
 */
import React from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';
import { ButtonGroup, Button, Form } from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import {
  conversionsToOptions,
  getConversionsList
} from './conversions'
import { getDateFormatLabels, getIndexFromDateFormatLabel } from '../widgets/digitaldatetime'
import { getPositionFormatLabels, getIndexFromPositionFormatLabel } from '../widgets/digitalposition'

export default class PreferredUnits extends React.Component {
  constructor(props) {
    super(props);
    this.applyPreferredUnits = this.applyPreferredUnits.bind(this);
    this.resetPreferredUnits = this.resetPreferredUnits.bind(this);
  }

  applyPreferredUnits() {
    let formatDateIndex = getIndexFromDateFormatLabel(this.props.instrumentPanel.preferredUnits['date']);
    formatDateIndex = (formatDateIndex > 0) ? formatDateIndex : 0;
    let formatPositionIndex = getIndexFromPositionFormatLabel(this.props.instrumentPanel.preferredUnits['position']);
    formatPositionIndex = (formatPositionIndex > 0) ? formatPositionIndex : 0;
    this.props.instrumentPanel.setReloadRequired();
    this.props.instrumentPanel.getPages().map((page, pageNum) => {
      this.props.instrumentPanel.getWidgets(pageNum).map((widget) => {
        const widgetUnit = widget.getOptions().unit;
        if ((widgetUnit !== 'deg') && (widgetUnit !== '') && (typeof widgetUnit !== 'undefined')) {
          widget.options.convertTo = this.props.instrumentPanel.getPreferredUnit(widgetUnit);
        }
        if (widget.widget) {
          let widgetType = widget.getType();
          if (widgetType === 'digitaldatetime') { widget.options.formatDateIndex = formatDateIndex }
          if (widgetType === 'digitalposition') { widget.options.formatPositionIndex = formatPositionIndex }
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
      <React.Fragment>
        <ButtonGroup className="pull-right">
          <Button variant="ip" onClick={this.applyPreferredUnits}>Apply</Button>
          <Button variant="ip" onClick={this.resetPreferredUnits}>Reset</Button>
        </ButtonGroup>
        <div className='items'>
          {getConversionsList().map(unit => {
            if (unit === 'rad') { return null }
            return (<PreferredUnitSelect key={unit} instrumentPanel={this.props.instrumentPanel} unit={unit} defaultUnit={unit} />)
          })}
          <PreferredUnitSelect key='date' instrumentPanel={this.props.instrumentPanel} unit='date' defaultUnit={getIndexFromDateFormatLabel()[0]} />
          <PreferredUnitSelect key='position' instrumentPanel={this.props.instrumentPanel} unit='position' defaultUnit={getPositionFormatLabels()[0]} />
        </div>
      </React.Fragment>
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
      value: this.props.instrumentPanel.getPreferredUnit(this.props.unit) || this.props.defaultUnit
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    if (this.props.instrumentPanel.setPreferredUnit(this.props.unit, event.target.value))
      this.setState({ value: event.target.value });
  }

  buildOptions(unit) {
    if (unit === 'date') {
      return getDateFormatLabels().map(label => {
        return <option key={label} value={label}>{label}</option>
      })
    }
    if (unit === 'position') {
      return getPositionFormatLabels().map(label => {
        return <option key={label} value={label}>{label}</option>
      })
    }
    return (
      <React.Fragment>
        <option key={unit} value={unit}>{unit}</option>
        {conversionsToOptions(unit)}
      </React.Fragment>
    )
  }

  render() {
    return (
      <span className='item'>
        <div className='widget'>
          <b>{this.props.unit}</b> show in &nbsp;
          <Form.Select key={this.props.unit} onChange={this.handleChange} size="sm" className="form-select-ip" defaultValue={this.state.value}>
            {this.buildOptions(this.props.unit)}
          </Form.Select>
        </div>
      </span>
    );
  }
};

PreferredUnitSelect.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired,
  unit: PropTypes.string,
  defaultUnit: PropTypes.string
};
