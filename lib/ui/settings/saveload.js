/**
 * SaveLoadSettingsUnits
 *
 */
import React from 'react';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import {Radio, Button, Well, Alert } from 'react-bootstrap';
import beautify from 'json-beautify';
import FileSaver from 'file-saver';
import Debug from 'debug';

const debug = Debug('instrumentpanel:saveload')
import InstrumentPanel from '../instrumentpanel';
import {
  generateBackupSettings as lsGenerateBackupSettings,
  storeAllSettings as lsStoreAllSettings,
  storeGridForHost as lsStoreGridForHost,
  retrievePreferredUnits as lsRetrievePreferredUnits,
  storePreferredUnits as lsStorePreferredUnits
} from '../../util/localstorage.js';
import {reloadWithParams} from '../../util/browser';
import {
  retrieveLayoutsArray as ssRetrieveLayoutsArray,
  retrieveLayoutsInfos as ssRetrieveLayoutsInfos,
  retrieveLayoutsData as ssRetrieveLayoutsData,
  storeHostLayouts as ssStoreHostLayouts,
  deleteHostLayouts as ssDeleteHostLayouts,
  storePreferredUnits as ssStorePreferredUnits,
  retrievePreferredUnits as ssRetrievePreferredUnits,
  isPreferredUnits as ssIsPreferredUnits
} from '../../util/serverstorage';
import {
  layoutsKeyName,
  saveDisplayKey,
  loadDisplayKey
} from './constants';

export default class SaveLoadSettingsUnits extends React.Component {
  constructor(props) {
    super(props);
    this.setMessageProgress = this.setMessageProgress.bind(this);
    this.handleFileSave = this.handleFileSave.bind(this);
    this.handleFileLoad = this.handleFileLoad.bind(this);
    this.handleSsLayoutSave = this.handleSsLayoutSave.bind(this);
    this.handleSsLayoutDelete = this.handleSsLayoutDelete.bind(this);
    this.handleSsLayoutLoad = this.handleSsLayoutLoad.bind(this);
    this.handleSsPrefUnitsSave = this.handleSsPrefUnitsSave.bind(this);
    this.handleSsPrefUnitsLoad = this.handleSsPrefUnitsLoad.bind(this);
    this.handleSsUserOrGlobalChange = this.handleSsUserOrGlobalChange.bind(this);
    this.checkPreferredUnits = this.checkPreferredUnits.bind(this);
    this.getSsLayouts = this.getSsLayouts.bind(this);
    this.renderSsLayoutsLoad = this.renderSsLayoutsLoad.bind(this);
    this.skHostname = this.props.instrumentPanel.SignalkClient.get('hostname');
    this.ssAvaliable = this.props.instrumentPanel.getSsAvailable();
    this.state =  {
      ssLayouts: {},
      ssLayoutLoadKey: '',
      ssUser: true,
      adminLevel: false,
      readWriteLevel: false,
      readOnlyLevel: false,
      loggedIn: false,
      authenticationRequired: false,
      username: '',
      saveForAllUser: false,
      messageProgress: '',
      readOnlyButton: false,
      isUserPreferredUnits: false,
      isGlobalPreferredUnits: false
    };
  }

  setMessageProgress(message, typeError = false) {
    message = ((typeError)?'ERROR: ':'') + message;
    this.setState({messageProgress: message});
  }

  checkPreferredUnits() {
    if (! this.ssAvaliable) {return null}
    var that = this;

    ssIsPreferredUnits(
      this.props.instrumentPanel.SignalkClient,
      false, // global settings
      (isUnits=> {that.setState({isGlobalPreferredUnits: isUnits});})
    )
    ssIsPreferredUnits(
      this.props.instrumentPanel.SignalkClient,
      true, // user
      (isUnits=> {
        that.setState({isUserPreferredUnits: isUnits});
        if (!that.state.isUserPreferredUnits && that.state.isGlobalPreferredUnits) {
          that.setState({ssUser: false});
        }
      })
    )
  }

  getSsLayouts() {
    if (! this.ssAvaliable) {return null}
    var that = this;

    function fillInfos(date, infos, isUser) {
      debug("[fillInfos] date:" + date)
      debug("[fillInfos] infos:" + JSON.stringify(infos))
      debug("[fillInfos] user:" + isUser)
      var newSsLayouts = that.state.ssLayouts;
      var infosKey = ((isUser)?'u':'g') + date;
      newSsLayouts[infosKey] = infos;
      that.setState({ssLayouts: newSsLayouts});
      if (that.state.ssLayoutLoadKey === '') {
        that.setState({ssLayoutLoadKey: infosKey})
      }
    }

    function fillInfosArray(infosArray, isUser) {
      if (infosArray && Array.isArray(infosArray)) {
        debug("[fillInfosArray] globalSsInfosArray:" + infosArray)
        if (infosArray && infosArray.length > 0) {
          infosArray.forEach( infos => {
            ssRetrieveLayoutsInfos(
              that.props.instrumentPanel.SignalkClient,
              isUser,
              infos,
              fillInfos
            )
          })
        } else {
            that.setState({ssLayouts: {}});
          }
      }
    }

    ssRetrieveLayoutsArray(
      this.props.instrumentPanel.SignalkClient,
      false,
      fillInfosArray
    )

    ssRetrieveLayoutsArray(
      this.props.instrumentPanel.SignalkClient,
      true,
      fillInfosArray
    )

  }

  handleFileSave() {
    const fileDate = new Date().toISOString().replace(/:/g, "-");
    const filename = "ip-settings-" + this.skHostname + "-" + fileDate + ".json";
    var blob = new Blob([beautify(lsGenerateBackupSettings(), null, 2, 80)], {type: "application/json"});
    FileSaver.saveAs(blob, filename);
  }

  handleFileLoad(event) {
    const filenameSettings = (event.target && event.target.files[0]) || undefined;
    const errorMessage = "An error occurred in load of settings";
    var reader = new FileReader();
    if ((typeof filenameSettings !== 'undefined') && (filenameSettings.name !== '')) {
      reader.onload = (event) => {
        this.setState({readOnlyButton: true});
        try {
          var loadSettingsData = JSON.parse(event.target.result);
          if (!lsStoreAllSettings(loadSettingsData)) {throw errorMessage}
          reloadWithParams(this.props.instrumentPanel.getReloadParams());
        } catch (ex) {
            console.error(ex);
            alert(errorMessage);
            this.setState({readOnlyButton: false});
          }
      }
      reader.readAsText(filenameSettings);
    } else { alert("File not found !") }
  }

  handleSsLayoutSave() {
    const defaultLayoutName = "Layouts for " + this.skHostname;
    var layoutName = window.prompt('Please give a name for the saved settings', defaultLayoutName);
    this.setState({readOnlyButton: true});
    if ((layoutName === null) || (layoutName === '')) {
      layoutName = defaultLayoutName;
    }
    this.setMessageProgress("Saving layout in progress...");
    var layouts = lsGenerateBackupSettings()[layoutsKeyName] || {};
    layouts = layouts[this.skHostname] || {};
    var saveDate = new Date();
    var saveDateISO = saveDate.toISOString().replace('.',',');
    var hostLayouts = {
      "infos": {
        "screenSize": window.innerWidth + "X" + window.innerHeight,
        "host": this.skHostname,
        "name": layoutName
      }
    };
    hostLayouts[layoutsKeyName] = {};
    hostLayouts[layoutsKeyName][this.skHostname] = layouts;
    ssStoreHostLayouts(
      this.props.instrumentPanel.SignalkClient,
      this.state.ssUser,
      saveDateISO,
      hostLayouts,
      (opRet => {
        debug("[handleSsSave] ssStoreHostLayouts return:" + opRet);
        if (opRet === true) {
          var newSsLayouts = this.state.ssLayouts;
          var infosKey = ((this.state.ssUser)?'u':'g') + saveDateISO;
          newSsLayouts[infosKey] = hostLayouts.infos;
          this.setState({ssLayouts: newSsLayouts});
          this.setMessageProgress("Layouts saved.");
        } else {
            this.setMessageProgress("Saving layout failed.", true);
          }
        this.setState({readOnlyButton: false});
      })
    )
  }

  handleSsLayoutLoad(infosKey) {
    debug("[handleSsLoad] infosKey:" + infosKey);
    this.setState({readOnlyButton: true});
    this.setMessageProgress("Loading layout in progress...");
    const that = this;
    const isUser = (infosKey[0] === 'u');
    const date = infosKey.substring(1);
    const host = this.state.ssLayouts[infosKey].host;
    const targetHost = this.skHostname;
    ssRetrieveLayoutsData(
      this.props.instrumentPanel.SignalkClient,
      isUser,
      date,
      ((date, data, isUser) => {
        debug("[handleSsLoad] ssRetrieveLayoutsData return date:" + date);
        try {
          if (date === null) {throw 'date = null';}
          if (!lsStoreGridForHost(targetHost, data[host])) {
            throw 'lsStoreGridForHost return false';
          }
          reloadWithParams(this.props.instrumentPanel.getReloadParams());
        } catch (ex) {
            console.error(ex);
            this.setMessageProgress("Loading layout failed.");
            this.setState({readOnlyButton: false});
          }
      })
    )
  }

  handleSsLayoutDelete(infosKey) {
    debug("[handleSsLayoutDelete] infosKey:" + infosKey)
    this.setState({readOnlyButton: true});
    this.setMessageProgress("Deleting layout in progress...");
    var isUser = (infosKey[0] === 'u');
    var date = infosKey.substring(1);
    ssDeleteHostLayouts(
      this.props.instrumentPanel.SignalkClient,
      isUser,
      date,
      (opRet => {
        debug("[handleSsLayoutDelete] ssDeleteHostLayouts return:" + opRet);
        if (opRet === true) {
          var newSsLayouts = this.state.ssLayouts;
          delete newSsLayouts[infosKey]
          var newSsLayoutLoadKey = Object.keys(newSsLayouts);
          newSsLayoutLoadKey = (newSsLayoutLoadKey.length > 0)?newSsLayoutLoadKey[0]:'';
          this.setState({
            ssLayouts: newSsLayouts,
            ssLayoutLoadKey: newSsLayoutLoadKey
          });
          this.setMessageProgress("Layouts deleted.");
        } else {
            this.setMessageProgress("Deleting layout failed.", true);
          }
        this.setState({readOnlyButton: false});
      })
    )
  }

  handleSsLayoutLoadKeyChange(infosKey) {
    if (!this.state.readOnlyButton)
      this.setState({ssLayoutLoadKey: infosKey});
  }

  handleSsPrefUnitsSave() {
    this.setMessageProgress("Saving in progress...");
    this.setState({readOnlyButton: true});
    const preferredUnits = lsRetrievePreferredUnits() || ({});
    ssStorePreferredUnits(
      this.props.instrumentPanel.SignalkClient,
      this.state.ssUser,
      preferredUnits,
      (opRet => {
        debug("[handleSsSavePrefUnits] ssStorePreferredUnits return:" + opRet);
        if (opRet !== true) {
          this.setMessageProgress("Saving failed.", true);
        } else {
            this.setMessageProgress("Preferred units saved.");
          }
        this.setState({readOnlyButton: false});
      })
    )
  }

  handleSsPrefUnitsLoad() {
    this.setMessageProgress("Loading in progress...");
    this.setState({readOnlyButton: true});
    ssRetrievePreferredUnits(
      this.props.instrumentPanel.SignalkClient,
      this.state.ssUser,
      (preferredUnits => {
        debug("[handleSsLoadPrefUnits] retrievePreferredUnits return:" + JSON.stringify(preferredUnits));
        if (preferredUnits !== null) {
          lsStorePreferredUnits(preferredUnits);
          this.props.instrumentPanel.loadPreferredUnits();
          this.setMessageProgress("Preferred units loaded.");
        } else {
            this.setMessageProgress("Loading failed.");
          }
        this.setState({readOnlyButton: false});
      })
    )
  }

  handleSsUserOrGlobalChange() {
    if (!this.state.readOnlyButton)
      this.setState({ssUser: !this.state.ssUser});
  }

  renderDisable() {
    return (
      <Alert bsStyle="danger">
        Save / Load functions are disable when your settings is not validate.
      </Alert >
    )
  }


  renderFileSave() {
    return (
      <Well key="fileSave">
        <Button bsClass="navbar-btn" className="btn" onClick={this.handleFileSave}>Save all settings</Button>
        &nbsp;to local file
      </Well >
    );
  }

  renderFileLoad() {
    return (
      <Well key="fileLoad">
        <label className="btn navbar-btn" >
          <input type="file" onChange={this.handleFileLoad} />
          Load all settings
        </label>
        &nbsp;from local file.
      </Well >
    )
  }

  renderSsLayoutsSave () {
    if (!this.ssAvaliable || !(this.state.readWriteLevel || this.state.adminLevel)) {return null}
    return (
      <div>
        <Button
          bsClass="navbar-btn"
          className="btn"
          onClick={this.handleSsLayoutSave}
          disabled={this.state.readOnlyButton}
        >Save page layouts</Button>
        &nbsp;on the server.
      </div>
    )
  }

  renderSsLayoutsLoad () {
    if (! this.ssAvaliable) {return null}
    var infoDetails = null;
    var that = this;
    var deleteButton = (
      <div>
        <Button
          key="d"
          bsClass="navbar-btn"
          className="btn"
          onClick={()=>{this.handleSsLayoutDelete(this.state.ssLayoutLoadKey)}}
          disabled={this.state.readOnlyButton}
        >Delete this layout</Button>&nbsp;
      </div>
    )
    var allLayoutsList =
      Object.keys(this.state.ssLayouts).map(function(infosKey, i) {
        var userOrGlobal = infosKey[0];
        var infosDate = infosKey.substring(1).replace(',','.');
        var layoutName = (that.state.ssLayouts[infosKey].name !== '')?that.state.ssLayouts[infosKey].name:infosDate;
        if (that.state.ssLayoutLoadKey === infosKey) {
          var isDeleteButton = (that.state.adminLevel || (that.state.readWriteLevel && (userOrGlobal === 'u')));
          infoDetails = (
            <div className="layoutDetail">
              <div>Saved on {infosDate}</div>
              <div>With screen size {that.state.ssLayouts[infosKey].screenSize}</div>
              <div>Host {that.state.ssLayouts[infosKey].host}</div>
              <div>Type {(userOrGlobal === 'u')?'user':'global'} layout</div>
              <div>
                <Button
                  key="i"
                  bsClass="navbar-btn"
                  className="btn"
                  onClick={()=>{that.handleSsLayoutLoad(that.state.ssLayoutLoadKey)}}
                  disabled={that.state.readOnlyButton}
                >Load this layout</Button>&nbsp;
              </div>
              {(isDeleteButton)?deleteButton:null}
            </div>
          )
        }

        return (
          <Radio
            name="loadGroup"
            key={infosKey}
            checked={(that.state.ssLayoutLoadKey === infosKey)}
            onChange={()=>{that.handleSsLayoutLoadKeyChange(infosKey)}} >
            <span className={(that.state.ssLayoutLoadKey === infosKey)?"layoutDetail":""} style={(that.state.ssLayoutLoadKey === infosKey)?{fontWeight: 'bold'}:{}}>{layoutName}</span>
          </Radio>
        )
      });

    if (Object.keys(this.state.ssLayouts).length === 0) {
      return (
        <Well key="ssLoad" className="noItem">No layout found on the server</Well >
      )
    }
    return (
      <Well key="ssLoad" className="noItem layoutLoad">
        <div className="layoutList">
         <div>Layouts:</div>
         {allLayoutsList}
        </div>
        {infoDetails}
      </Well >
    )
  }

  renderSsPrefUnitsSave () {
    if (!this.ssAvaliable || !(this.state.readWriteLevel || this.state.adminLevel)) {return null}
    return (
      <div>
        <Button
          bsClass="navbar-btn"
          className="btn"
          onClick={this.handleSsPrefUnitsSave}
          disabled={this.state.readOnlyButton}
        >Save preferred units</Button>
        &nbsp;on the server.{(!this.state.ssUser)?" These preferred units will be loaded on new devices by default.":""}
      </div>
    )
  }

  renderSsPrefUnitsLoad () {
    if (! this.ssAvaliable) {return null}
    var disableBtn = (
      this.state.readOnlyButton ||
      (this.state.ssUser && !this.state.isUserPreferredUnits) ||
      (!this.state.ssUser && !this.state.isGlobalPreferredUnits)
    )
    return (
      <Well key="ssPrefUnitsLoad" className="noItem">
        {this.renderUserOrGlobalChoice('load from', false)}
        <div>
          <Button
            bsClass="navbar-btn"
            className="btn"
            onClick={this.handleSsPrefUnitsLoad}
            disabled={disableBtn}
          >{(disableBtn)?"No":"Load"} preferred units</Button>
          &nbsp;from the server.
        </div>
      </Well >
    );
  }

  renderIsLoggedAndSsAvaliable() {
    const loginUrl = window.location.origin + '/admin/#/login';
    if (!this.ssAvaliable) {
      return (
        <Alert bsStyle="info">
          <b>Save and Load</b> on the server is only available on the Signal K server version &gt; <b>1.27.0</b>
        </Alert >
      )
    }
    if (this.state.adminLevel) {return null}
    if (!this.state.authenticationRequired) {
      return (
        <Alert bsStyle="info">
          you need to <a href="/admin/#/security/settings">enable security</a> to save settings on the server.
        </Alert >
      )
    }
    if (this.state.readWriteLevel) {
      return (
        <Alert bsStyle="info">
          You are logged in as <b>{this.state.username}</b> with <b>read/write</b> acces. To save in global settings, you must <a href={loginUrl}>logout and log in</a> with <b>admin</b> acces.
        </Alert >
      )
    }
    if (this.state.readOnlyLevel) {
      return (
        <Alert bsStyle="info">
          You are logged in as <b>{this.state.username}</b> with <b>read only</b> acces. To save on server, you must <a href={loginUrl}>logout and log in</a> with <b>read/write</b> or <b>admin</b> acces.
        </Alert >
      )
    }
    if (!this.state.loggedIn) {
      return (
        <Alert bsStyle="info">
          You are not logged in. To save on server, you must <a href={loginUrl}>log in</a> with <b>read/write</b> or <b>admin</b> acces.
        </Alert >
      )
    }
  }

  renderUserOrGlobalChoice(actionTxt, forWrite=false) {
    if (!this.ssAvaliable) {return null}
    if (!this.state.adminLevel && forWrite) {return null}
    return (
      <React.Fragment>
        <Radio
          name="userKey"
          key="userKey"
          checked={this.state.ssUser}
          onChange={this.handleSsUserOrGlobalChange} >
          {actionTxt} this user <b>{this.state.username}</b>
        </Radio>
        <Radio
          name="globalKey"
          key="globalKey"
          checked={!this.state.ssUser}
          onChange={this.handleSsUserOrGlobalChange} >
          {actionTxt} global settings
        </Radio>
      </React.Fragment>
    )
  }

  render() {
    if (this.props.instrumentPanel.backupSettings) {
      return this.renderDisable();
    }

    if (this.props.displayKey === saveDisplayKey) {
      return (
        <div className="saveload">
          <Well key="saveToServer" className="noItem">
            <div style={(this.state.messageProgress.startsWith('ERROR'))?{color:"red"}:{}}>{this.state.messageProgress}</div>
            {this.renderUserOrGlobalChoice('save for', true)}
            {this.renderSsLayoutsSave()}
            {this.renderSsPrefUnitsSave()}
            {this.renderIsLoggedAndSsAvaliable()}
          </Well >
          {this.renderFileSave()}
        </div>
      )
    } else {
        return (
          <div className="saveload">
            <div style={(this.state.messageProgress.startsWith('ERROR'))?{color:"red"}:{}}>{this.state.messageProgress}</div>
            {this.renderSsLayoutsLoad()}
            {this.renderSsPrefUnitsLoad()}
            {this.renderFileLoad()}
          </div>
        )
      }
  }

  componentDidMount() {
    this.props.instrumentPanel.retrieveLoginStatus(( loginStatus => {
        this.setState({
          adminLevel: (loginStatus && loginStatus.userLevel === 'admin'),
          readWriteLevel: (loginStatus && loginStatus.userLevel === 'readwrite'),
          readOnlyLevel: (loginStatus && loginStatus.userLevel === 'readonly'),
          loggedIn: (loginStatus && loginStatus.status === 'loggedIn'),
          username: (loginStatus && loginStatus.username) || '',
          ssUser: (loginStatus && loginStatus.status === 'loggedIn'),
          authenticationRequired: (loginStatus && loginStatus.authenticationRequired)
        });
        if (this.props.displayKey === loadDisplayKey) {
          this.getSsLayouts();
          this.checkPreferredUnits();
        }
      })
    );
  }

  componentWillUnmount() {
  }
};

SaveLoadSettingsUnits.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired,
  displayKey:      PropTypes.oneOf([saveDisplayKey, loadDisplayKey])
};

