/*
 * ResetSettings & ResetComponent
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Checkbox, HelpBlock, Button} from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import {
  reloadWithParams,
  getLayoutName,
} from '../../util/browser';
import {
  removeKeysByName
} from '../../util/localstorage.js';
import {
  old_layoutKeyName,
  layoutsKeyName,
  preferredUnitsKeyName,
  colorSchemeKeyName,
  backupSettingsKeyName
} from './constants';

var menuSettings = {
  [layoutsKeyName]: {title: 'Layouts', help: 'Delete all layouts'},
  [old_layoutKeyName]: {title: 'Previous layout', help: 'Clean previous layouts, if a layout existed in version 0.12.0 and earlier, it is used as a template to build the default layout.'},
  [preferredUnitsKeyName]: {title: 'Preferred units', help: 'Delete all preferred units'},
  [colorSchemeKeyName]: {title: 'Dark Mode', help: 'Delete dark mode settings'},
  [backupSettingsKeyName]: {title: 'Backup settings', help: 'Delete the settings backup and remove top message about imported configuration'}
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
    this.doCancel = this.doCancel.bind(this);
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
    var keysToDelete = [];
    for (let [key, value] of Object.entries(this.state)) {
      if (key === 'submitDisable') {continue;}
      if (value === true) {
        if (!key.startsWith('NOKEY_')) keysToDelete.push(key);
      }
    }
    removeKeysByName(keysToDelete);
    if (typeof this.props.instrumentPanel !== 'undefined') {
      var reloadParams = this.props.instrumentPanel.getReloadParams();
      reloadWithParams(reloadParams);
    } else {
        reloadWithParams({layout: getLayoutName()})
      }
  }

  doCancel() {
    reloadWithParams({layout: getLayoutName()})
  }

  render() {
    const checkboxItems = Object.keys(menuSettings).map(key => {
      let helpText = menuSettings[key].help.split ('\n').map ((item, i) => <span key={i}>{item}<br/></span>);
      return <Checkbox key={key} id={key} onChange={this.handleChange}>
               {menuSettings[key].title}
               <HelpBlock>{helpText}</HelpBlock>
             </Checkbox>
    });
    var that = this;
    var cancelButton = function() {
      return (typeof that.props.instrumentPanel === 'undefined') ?
        (<Button onClick={that.doCancel}>Cancel</Button>) : null;
    }

    return (
      <div className="resetSettings">
        <div>Select Instrument Panel settings to reset:</div>
        {checkboxItems}
        <Button bsStyle="danger" disabled={this.state.submitDisable} onClick={this.doReset}>Reset</Button>&nbsp;
        {cancelButton()}
      </div>
    );
  }
}
