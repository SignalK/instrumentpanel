/*
 * ResetSettings & ResetComponent
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Panel, FormGroup, Checkbox, HelpBlock, Button} from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import {
  reloadWithLayout,
  getLayoutName,
  } from '../../util/browser';
import {
  removeKeysByName as localstorageRemoveKeysByName,
  old_layoutKeyName,
  layoutsKeyName,
  startConnectedKeyName,
  preferredUnitsKeyName
  } from '../../util/localstorage';


export default class ResetSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    return (
      <ResetComponent instrumentPanel={this.props.instrumentPanel}/>
    );
  }
};

ResetSettings.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};

export class ResetComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.doReset = this.doReset.bind(this);
    this.state = {};
  }

  handleChange(e) {
    this.setState({ [e.target.id]: e.target.checked });
  }

  doReset() {
    if (confirm("You will reset all selected items !")) {
      var keysToDelete = [];
      for (let [key, value] of Object.entries(this.state)) {
        if (value === true) keysToDelete.push(key)
      }
      localstorageRemoveKeysByName(keysToDelete);
      if (typeof this.props.instrumentPanel !== 'undefined') {
        this.props.instrumentPanel.reloadRequired = true;
      } else {
          reloadWithLayout(getLayoutName());
        }
    }
  }

  render() {
    return (
      <Panel style={{ margin: '10px 15px' }}>
        <Panel.Heading>Reset instrumentpanel settings</Panel.Heading>
        <Panel.Body>
        <FormGroup>
          <Checkbox id={layoutsKeyName} onChange={this.handleChange}>Layouts
            <HelpBlock>Delete all layouts</HelpBlock>
          </Checkbox>
          <Checkbox id={startConnectedKeyName} onChange={this.handleChange}>Start connected
            <HelpBlock>Reset the automatic connection at startup</HelpBlock>
          </Checkbox>
          <Checkbox id={preferredUnitsKeyName} onChange={this.handleChange}>Preferred units
            <HelpBlock>Delete all preferred units</HelpBlock>
          </Checkbox>
          <Checkbox id={old_layoutKeyName} onChange={this.handleChange}>Previous layout
            <HelpBlock>Clean previous layouts, if a layout existed in version 0.12.0 and earlier, it is used as a template to build the default layout.</HelpBlock>
          </Checkbox>
        </FormGroup>
        <Button bsStyle="danger" onClick={this.doReset}>Reset</Button>
        </Panel.Body>
      </Panel>
    );
  }
}
