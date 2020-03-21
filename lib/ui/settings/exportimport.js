/**
 * ExportImportSettingsUnits
 *
 */
import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import { Button, Well, Alert } from 'react-bootstrap';
import beautify from 'json-beautify';
import FileSaver from 'file-saver';

import InstrumentPanel from '../instrumentpanel';
import {
  generateBackupSettings,
  importSettings,
  storeStartConnected
} from '../../util/localstorage.js';
import {reloadWithParams} from '../../util/browser';

export default class ExportImportSettingsUnits extends React.Component {
  constructor(props) {
    super(props);
    this.handleExport = this.handleExport.bind(this);
    this.handleImport = this.handleImport.bind(this);
    this.skHostname = this.props.instrumentPanel.SignalkClient.get('hostname');
  }

  handleExport() {
    const fileDate = new Date().toISOString().replace(/:/g, "-");
    const filename = "ip-settings-" + this.skHostname + "-" + fileDate + ".json";
    var blob = new Blob([beautify(generateBackupSettings(), null, 2, 80)], {type: "application/json"});
    FileSaver.saveAs(blob, filename);
  }

  handleImport(event) {
    const filenameSettings = (event.target && event.target.files[0]) || undefined;
    const errorMessage = "An error occurred in import of settings";
    var reader = new FileReader();
    if ((typeof filenameSettings !== 'undefined') && (filenameSettings.name !== '')) {
      reader.onload = (event) => {
        try {
          var importSettingsData = JSON.parse(event.target.result);
          if (!importSettings(importSettingsData)) {throw errorMessage}
        } catch (ex) {
            console.error(ex);
            alert(errorMessage);
          }
        reloadWithParams(this.props.instrumentPanel.getReloadParams());
      }
      reader.readAsText(filenameSettings);
    } else { alert("File not found !") }
  }

  renderDisable() {
    return (
      <Alert bsStyle="danger">
        Export / Import functions are disable when your settings is not validate.
      </Alert >
    )
  }

  renderEnable() {
    return (
      <React.Fragment>
        <Well >
          <Button bsClass="navbar-btn" className="btn" onClick={this.handleExport}>Export</Button>
          &nbsp;the settings to local file.
        </Well >
        <Well >
          <label className="btn navbar-btn" >
            <input type="file" onChange={this.handleImport} />
            Import
          </label>
          &nbsp;the settings from local file.
        </Well >
      </React.Fragment>
    );
  }

  render() {
    return (
      <div className="exportimport">
        {(this.props.instrumentPanel.backupSettings) ? this.renderDisable() : this.renderEnable()}
      </div>
    )
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }
};

ExportImportSettingsUnits.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};

