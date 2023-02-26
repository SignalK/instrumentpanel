/**
 * PreferredUnits
 *
 */
import React from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';
import { ButtonGroup, Button, Dropdown } from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import {
  conversionsToItems,
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
            return (<PreferredUnitSelect key={unit} instrumentPanel={this.props.instrumentPanel} unit={unit} />)
          })}
          <PreferredFormatSelect
            key="date"
            instrumentPanel={this.props.instrumentPanel}
            type="date"
            formatIndex={getIndexFromDateFormatLabel(this.props.instrumentPanel.preferredUnits['date'])}
            formats={getDateFormatLabels()}
          />
          <PreferredFormatSelect
            key="position"
            instrumentPanel={this.props.instrumentPanel}
            type="position"
            formatIndex={getIndexFromPositionFormatLabel(this.props.instrumentPanel.preferredUnits['position'])}
            formats={getPositionFormatLabels()}
          />
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
      value: this.props.instrumentPanel.getPreferredUnit(this.props.unit) || this.props.unit
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    if (this.props.instrumentPanel.setPreferredUnit(this.props.unit, event.target.value))
      this.setState({ value: event.target.value });
  }

  render() {
    return (
      <span className='item'>
        <b>{this.props.unit}</b> show in &nbsp;
        <Dropdown onSelect={this.handleChange}>
          <Dropdown.Toggle>
            {this.state.value}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item key={this.props.unit}>{this.props.unit}</Dropdown.Item>
            {conversionsToItems(this.props.unit)}
          </Dropdown.Menu>
        </Dropdown>
      </span>
    );
  }
};

PreferredUnitSelect.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired,
  unit: PropTypes.string
};

class PreferredFormatSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formatIndex: (this.props.formatIndex > 0) ? this.props.formatIndex : 0
    };
    this.handleChange = this.handleChange.bind(this);
    this.formatsToItems = this.formatsToItems.bind(this);
  }

  handleChange(event) {
    if (this.props.instrumentPanel.setPreferredUnit(this.props.type, event.target[event.target.value].innerText))
      this.setState({ formatIndex: event.target.value });
  }

  formatsToItems() {
    return this.props.formats.map((label, index) => {
      return <Dropdown.Item key={index}>{label}</Dropdown.Item>
    })
  }

  render() {
    return (
      <span className='item'>
        <b>{this.props.type}</b> show in&nbsp;
        <Dropdown onSelect={this.handleChange}>
          <Dropdown.Toggle>{this.props.formats[this.state.formatIndex]}</Dropdown.Toggle>
          <Dropdown.Menu>{this.formatsToItems()}</Dropdown.Menu>
        </Dropdown>
      </span>
    );
  }
};

PreferredFormatSelect.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired,
  type: PropTypes.string,
  formats: PropTypes.array,
  formatIndex: PropTypes.number
};
