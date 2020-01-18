/*
 * ResetSettings & ResetComponent
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Checkbox, HelpBlock, Button} from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import {
  reloadWithLayout,
  getLayoutName,
} from '../../util/browser';
import {
  removeKeysByName as localstorageRemoveKeysByName,
} from '../../util/localstorage.js';
import {
  old_layoutKeyName,
  layoutsKeyName,
  startConnectedKeyName,
  preferredUnitsKeyName,
  colorSchemeKeyName
} from './constants';

const menuSettings = {
  [layoutsKeyName]: {title: 'Layouts', help: 'Delete all layouts'},
  [old_layoutKeyName]: {title: 'Previous layout', help: 'Clean previous layouts, if a layout existed in version 0.12.0 and earlier, it is used as a template to build the default layout.'},
  [startConnectedKeyName]: {title: 'Start connected', help: 'Reset the automatic connection at startup'},
  [preferredUnitsKeyName]: {title: 'Preferred units', help: 'Delete all preferred units'},
  [colorSchemeKeyName]: {title: 'Dark Mode', help: 'Delete dark mode settings'}
};

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
    this.state = {submitDisable: true};
  }

  handleChange(e) {
    var submitDisable = true;
    this.setState({ [e.target.id]: e.target.checked });
    if (e.target.checked === true) {
      submitDisable = false;
    } else {
        for (let [key, value] of Object.entries(this.state)) {
          if (key === 'submitDisable') {continue;}
          if (key === e.target.id) {continue;}
          if (value === true) {
            submitDisable = false;
            break;
          }
        }
      }
    this.setState({'submitDisable': submitDisable});
  }

  doReset() {
    var message = '';
    var keysToDelete = [];
    for (let [key, value] of Object.entries(this.state)) {
      if (key === 'submitDisable') {continue;}
      if (value === true) {
        keysToDelete.push(key);
        message += menuSettings[key].title + '\n';
      }
    }

    if (confirm("You will reset settings for:\n" + message)) {
      localstorageRemoveKeysByName(keysToDelete);
      if (typeof this.props.instrumentPanel !== 'undefined') {
        this.props.instrumentPanel.reloadRequired = true;
      } else {
          reloadWithLayout(getLayoutName());
        }
    }
  }

  render() {
    const checkboxItems = Object.keys(menuSettings).map(key => {
      return <Checkbox key={key} id={key} onChange={this.handleChange}>
               {menuSettings[key].title}
               <HelpBlock>{menuSettings[key].help}</HelpBlock>
             </Checkbox>
    });
    return (
      <div className="resetSettings">
        <div>Select Instrument Panel settings to reset:</div>
        {checkboxItems}
        <Button bsStyle="danger" disabled={this.state.submitDisable} onClick={this.doReset}>Reset</Button>
      </div>
    );
  }
}
