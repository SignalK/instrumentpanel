/**
 * WidgetCell
 *
 * WidgetCell is a React Component rendering a cell displaying widget
 * information.
 *
 * @widget: An object implementing the BaseWidget interface as defined in
 *   ../widgets/basewidget.js
 */
import { Checkbox, Button } from 'react-bootstrap';
import React from 'react';
import PropTypes from 'prop-types';

import BaseWidget from '../widgets/basewidget';
import { notificationPageId } from './constants';
import { formatHtml8203 } from '../../util/htmlTools'
import { getPathsByWidgetType } from '../instrumentpanel'

export default class WidgetCell extends React.Component {
  constructor(props) {
    super(props);
    this.toggleActive = this.toggleActive.bind(this);
    this.toggleDelete = this.toggleDelete.bind(this);
    this.toggleShowAllPaths = this.toggleShowAllPaths.bind(this);
    this.getAdditionalPathList = this.getAdditionalPathList.bind(this);
    this.renderFull = this.renderFull.bind(this);
    this.renderLight = this.renderLight.bind(this);
    this.pushCellChange = this.pushCellChange.bind(this);
    this.checkBoxActiveDelete = this.checkBoxActiveDelete.bind(this);
    this.state = {
      showAllPaths: false,
      cellChange: false
    }
  }

  pushCellChange() {
    this.setState({cellChange: !this.state.cellChange});
  }

  getAdditionalPathList() {
    var that = this;
    var pathsWidget = Array.from(getPathsByWidgetType(this.props.widget.getType()));
    if (pathsWidget.length === 0) {
      return (
        <p key="x-0" onClick={that.toggleShowAllPaths}>
          This widget handles all paths that don't have a dedicated widget.
        </p>
      )
    }
    var additionalPaths = pathsWidget.filter( currentPath =>
      !that.props.widget.getHandledSources().some( source => source.path === currentPath )
    ).map( (path, i) => {
      return (
        <p key={"x-"+i} onClick={that.toggleShowAllPaths}>
          {formatHtml8203(path)}
        </p>
      )
    })
    if (additionalPaths.length > 0) {
      additionalPaths.unshift(
        <p key="x-" onClick={that.toggleShowAllPaths}>
          This widget can also handle the following paths :
        </p>
      );
      return additionalPaths;
    }
  }

  checkBoxActiveDelete() {
    return (
      <React.Fragment>
        <Checkbox className='headerCbShow' checked={this.props.widget.options.active} disabled={this.props.widget.options.delete} onChange={this.toggleActive} >Show on grid&nbsp;</Checkbox>
        <Checkbox className='headerCbShow' checked={this.props.widget.options.delete} disabled={this.props.widget.options.active} onChange={this.toggleDelete} >Delete</Checkbox>
      </React.Fragment>
    )
  }
  render() {
    return (this.props.editMode) ? this.renderFull() : this.renderLight();
  }

  renderFull() {
    const showAllPaths = this.state.showAllPaths;
    var that = this;
    var paths =
      this.props.widget.getHandledSources().map(function(source, i) {
        return (
          <p key={i} onClick={that.toggleShowAllPaths}>
            {(i === 0)?((showAllPaths)?'[-]':'[+]'):null}
            <b>{formatHtml8203(source.path)}</b>
            {String.fromCharCode(8203) + " (" + source.sourceId})
          </p>
        )
      });

    return (
      <div className='item'>
        <div className='header'>
          {this.checkBoxActiveDelete()}
          <Button className='headerEdit' bsSize="xsmall" onClick={() => this.props.changeWidgetInEdit('')}>Done</Button>
        </div>
        <div className='headerPath'>
          <h3>{this.props.widget.getType()}</h3>
          {paths}
          {(this.state.showAllPaths)?this.getAdditionalPathList():null}
        </div>
        <div className='widget'>
            {this.props.widget.getReactElement()}
        </div>
        <div className='widgetSettings'>
            {this.props.widget.getSettingsElement(this.pushCellChange)}
        </div>
      </div>
    );
  }

  renderLight() {
    return (
      <div className='item'>
        <div className='header'>
          {this.checkBoxActiveDelete()}
          <Button className='headerEdit' bsSize="xsmall" onClick={() => this.props.changeWidgetInEdit(this.props.widget.id)}>Edit</Button>
        </div>
        <div className='widget'>
            {this.props.widget.getReactElement()}
        </div>
      </div>
    );
  }

  toggleActive() {
    this.props.widget.setActive(!this.props.widget.options.active);
    if (this.props.widget.instrumentPanel.currentPage === notificationPageId) {
      this.props.widget.instrumentPanel.updateNotificationLevel(false)
    } else {
        this.props.widget.instrumentPanel.pushGridChanges();
        this.props.widget.instrumentPanel.persist();
      }
    this.pushCellChange();
  }

  toggleDelete() {
    this.props.widget.setDelete(!this.props.widget.options.delete);
    this.props.widget.instrumentPanel.persist();
    this.props.widget.instrumentPanel.setReloadRequired();
    this.pushCellChange();
  }

  toggleShowAllPaths() {
  this.setState({
      showAllPaths: !this.state.showAllPaths
    });
  }

};

WidgetCell.propTypes = {
  widget: PropTypes.instanceOf(BaseWidget).isRequired,
  changeWidgetInEdit: PropTypes.func.isRequired,
  editMode: PropTypes.bool.isRequired
};
