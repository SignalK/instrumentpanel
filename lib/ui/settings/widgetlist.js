/**
 * WidgetList
 *
 * WidgetList displays all of the widgets currently registered with the
 * instrument panel in a table.
 *
 * Similar enough to DataItemList that these two classes should be refactored
 * in to one.
 *
 * @instrumentPanel: an InstrumentPanel object
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Panel, ButtonGroup, Button, SplitButton, MenuItem} from 'react-bootstrap';

import InstrumentPanel from '../instrumentpanel';
import WidgetCell from './widgetcell';
import {
  widgetActiveModes,
  notificationPageId,
  WA_BASE_DATA,
  WA_ALL,
  WA_NO
} from './constants'

const widgetAutoShowMenu = {
  [WA_BASE_DATA]: 'Base paths shown',
  [WA_ALL]:       'Shown',
  [WA_NO]:        'Hidden'
};

export default class WidgetList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      widgetActiveMode: this.props.instrumentPanel.widgetActiveMode,
      widgetIdEditing: ""
    }
    this.handleShowAllPaths = this.handleShowAllPaths.bind(this);
    this.handleHideAllPaths = this.handleHideAllPaths.bind(this);
    this.handleHideShowAllPaths = this.handleHideShowAllPaths.bind(this);
    this.handlewidgetActiveMode = this.handlewidgetActiveMode.bind(this);
    this.handleWidgetDeleteAll = this.handleWidgetDeleteAll.bind(this);
    this.changeWidgetInEdit = this.changeWidgetInEdit.bind(this);
    this.getNewPathMenu = this.getNewPathMenu.bind(this);
  }

  changeWidgetInEdit(widgetId) {
    this.setState({
      widgetIdEditing: widgetId
    });
  }

  handleHideShowAllPaths(show) {
    const hideShow = (show)?"show":"hide";
    if (confirm("you are going to " + hideShow + " all the paths on your grid")) {
      this.props.instrumentPanel.getWidgets().forEach( widget => widget.options.active = show);
      if (this.props.instrumentPanel.currentPage === notificationPageId) {
        this.props.instrumentPanel.updateNotificationLevel(false)
      } else {
          this.props.instrumentPanel.pushGridChanges();
          this.props.instrumentPanel.persist();
        }
    }
  }

  handleShowAllPaths() {
    this.handleHideShowAllPaths(true)
  }

  handleHideAllPaths() {
    this.handleHideShowAllPaths(false)
  }

  handlewidgetActiveMode(selectedKey) {
    this.setState({
      widgetActiveMode: selectedKey
    });
    this.props.instrumentPanel.widgetActiveMode = selectedKey;
    this.props.instrumentPanel.saveWidgetActiveMode();
  }

  handleWidgetDeleteAll() {
    if (confirm("you are going to delete all the paths that are not visible on your grid.\n" +
      "See help for more details.")) {
      this.props.instrumentPanel.getWidgets().forEach( widget => {
        if (!widget.options.active) widget.options.delete = true;
      });
      this.props.instrumentPanel.persist();
      this.props.instrumentPanel.setReloadRequired();
    }
  }

  getNewPathMenu() {
    return (
      <div className="pull-left">
        &nbsp;<b>New</b> Paths Display&nbsp;
        <SplitButton
          bsStyle="default"
          title={widgetAutoShowMenu[this.state.widgetActiveMode]}
          key="widgetActiveModeKey"
          id="widgetActiveModeDropdown"
          className="navbar-btn">
          <MenuItem key={0} eventKey={WA_BASE_DATA} onSelect={this.handlewidgetActiveMode} active={this.state.widgetActiveMode === WA_BASE_DATA}>{widgetAutoShowMenu[WA_BASE_DATA]} (see help)</MenuItem>
          <MenuItem key={1} eventKey={WA_ALL} onSelect={this.handlewidgetActiveMode} active={this.state.widgetActiveMode === WA_ALL}>{widgetAutoShowMenu[WA_ALL]}</MenuItem>
          <MenuItem key={2} eventKey={WA_NO} onSelect={this.handlewidgetActiveMode} active={this.state.widgetActiveMode === WA_NO}>{widgetAutoShowMenu[WA_NO]}</MenuItem>
        </SplitButton>
        &nbsp;on grid&nbsp;
      </div>
    );
  }

  render() {
    var that = this;
    var widgetCells =
      this.props.instrumentPanel.getWidgets().sort((widgetA, widgetB) => {
        return widgetA.options.path.localeCompare(widgetB.options.path)
      }).map(function(widget, i) {
        return <WidgetCell key={i} widget={widget} changeWidgetInEdit={that.changeWidgetInEdit} editMode={(that.state.widgetIdEditing === widget.id)}></WidgetCell>;
      });
    return (
        <Panel>
          <Panel.Heading>
            <ButtonGroup className="pull-right">
              <Button bsClass="navbar-btn" className="btn" onClick={this.handleWidgetDeleteAll}>Delete all non-visible paths</Button>
              <Button bsClass="navbar-btn" className="btn" onClick={this.handleHideAllPaths}>Hide all paths</Button>
              <Button bsClass="navbar-btn" className="btn" onClick={this.handleShowAllPaths}>Show all paths</Button>
            </ButtonGroup>
            &nbsp;{(this.props.instrumentPanel.currentPage !== notificationPageId) ? this.getNewPathMenu() : null}
          </Panel.Heading>
          <Panel.Body>
            <div className="center-text">Current layout name: <strong>{this.props.instrumentPanel.layoutName}</strong></div>
            <div className="items">{widgetCells}</div>
          </Panel.Body>
        </Panel>
    );
  }
};

WidgetList.propTypes = {
  instrumentPanel: PropTypes.instanceOf(InstrumentPanel).isRequired
};

