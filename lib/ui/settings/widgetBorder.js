/**
 * WidgetBorder
 * Change border ["width","widthAlarm","radius","padding","margin"] on widget
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Panel, ButtonGroup, Button } from 'react-bootstrap';
import InstrumentPanel from '../instrumentpanel';
import {
  defaultWidgetBorder,
  defaultNotificationColors
} from './constants';
import { reloadWithParams } from '../../util/browser';

var menuSettings = {
  width: { title: 'thickness', help: '', min: 0, max: 4 },
  widthAlarm: { title: 'thickness with alarm', help: '', min: 0, max: 4 },
  radius: { title: 'radius', help: '', min: 0, max: 10 },
  padding: { title: 'padding', help: '', min: 0, max: 4 },
  margin: { title: 'margin', help: '', min: 0, max: 4 }
};

export default class WidgetBorder extends React.Component {
  constructor(props) {
    super(props);
    this.defaultWidgetBorder = { ...defaultWidgetBorder };
    this.resetWidgetSettings = this.resetWidgetSettings.bind(this);
    this.state = { ...this.props.instrumentPanel.widgetBorder }
    this.handleChange = this.handleChange.bind(this);
    if (this.props.instrumentPanel.getWidgets().length > 0) {
      this.reactWidget1 = this.props.instrumentPanel.getWidgets()[0].getReactElement()
      if (this.props.instrumentPanel.getWidgets().length > 1)
        this.reactWidget2 = this.props.instrumentPanel.getWidgets()[1].getReactElement()
      else
        this.reactWidget2 = this.reactWidget1
    }
  }

  handleChange(item, value) {
    this.setState({ [item]: value })
  }

  resetWidgetSettings() {
    if (confirm("You will reset the border settings of widgets to default value")) {
      this.props.instrumentPanel.resetWidgetBorder();
      reloadWithParams(this.props.instrumentPanel.getReloadParams());
    }
  }

  render() {
    return (
      <Panel>
        <Panel.Heading>
          <ButtonGroup className="pull-left">
            <div style={{ display: "flex", width: 300, height: 45 }}>
              <div className="react-grid-item" style={{ width: "50%", borderWidth: this.state.width, borderRadius: this.state.radius, margin: this.state.margin, padding: this.state.padding }}>
                {this.reactWidget1}
              </div>
              <div className="react-grid-item" style={{ width: "50%", borderWidth: this.state.widthAlarm, borderColor: defaultNotificationColors[4], borderRadius: this.state.radius, margin: this.state.margin, padding: this.state.padding }}>
                {this.reactWidget2}
              </div>
            </div>
          </ButtonGroup>
          <ButtonGroup className="pull-right">
            <Button bsClass="navbar-btn" className="btn" onClick={this.resetWidgetSettings}>Reset</Button>
          </ButtonGroup>
        </Panel.Heading>
        <Panel.Body>
          <div className="items">
            {Object.entries(menuSettings).map(([itemName, menuItem]) => {
              var currentValue = Number(this.props.instrumentPanel.widgetBorder[itemName])
              return (<ItemSelect
                key={itemName}
                itemName={itemName}
                menuItem={menuItem}
                instrumentPanel={this.props.instrumentPanel}
                currentValue={currentValue}
                defaultValue={Number(this.defaultWidgetBorder[itemName])}
                change={this.handleChange}
              />)
            })
            }
          </div>
        </Panel.Body>
      </Panel>
    );
  }

};

WidgetBorder.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};

class ItemSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.currentValue,
      selected: this.props.currentValue
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    this.setState({ value: value });
    this.props.instrumentPanel.setWidgetBorderItem(this.props.itemName, value);
    this.props.instrumentPanel.saveWidgetBorder();
    this.props.change(this.props.itemName, value)
  }

  generateOptions(menuItem, defaultValue) {
    return Array.from(Array(menuItem.max - menuItem.min + 1)).map(
      (e, i) => {
        var value = i + menuItem.min;
        var textValue = (value === defaultValue) ? value + ' (default)' : value
        return (
          <option key={value} value={value}>{textValue}</option>
        )
      }
    )
  }

  render() {
    return (
      <span className='item'>
        <b>{this.props.menuItem.title}</b>:&nbsp;
        <select value={this.state.value} onChange={(event) => { this.handleChange(Number(event.target.value)) }}>
          {this.generateOptions(this.props.menuItem, this.props.defaultValue)}
        </select>
      </span>
    );
  }
};

ItemSelect.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired,
  itemName: PropTypes.string.isRequired,
  menuItem: PropTypes.any.isRequired,
  currentValue: PropTypes.number.isRequired,
  defaultValue: PropTypes.number.isRequired
};
