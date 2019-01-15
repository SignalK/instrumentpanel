/**
 * WidgetRow
 *
 * WidgetRow is a React Component rendering a table row displaying widget
 * information.
 *
 * @widget: An object implementing the BaseWidget interface as defined in
 *   ../widgets/basewidget.js
 */
import { Checkbox } from 'react-bootstrap';
import React from 'react';
import PropTypes from 'prop-types';

import BaseWidget from '../widgets/basewidget';

export default class WidgetRow extends React.Component {
  constructor(props) {
    super(props);
    this.toggleActive = this.toggleActive.bind(this);
  }

  render() {
    var rowStyle = {
      verticalAlign: 'middle',
      height: '16vh',
      width: '30vw'
    };

    var paths =
      this.props.widget.getHandledSources().map(function(source, i) {
        return <p key={i}><b>{source.path.replace(/\./g, '.' + String.fromCharCode(8203))}</b> ({source.sourceId})</p>
      });
    return (
      <div className='item'>
        <div className='copy'>
          <Checkbox checked={this.props.widget.options.active} onChange={this.toggleActive} >
            Visible
          </Checkbox>
          <h3>{this.props.widget.getType()}</h3>
          {paths}
        </div>
        <div className='widget'>
            {this.props.widget.getReactElement()}
        </div>
        <div>
            {this.props.widget.getSettingsElement()}
        </div>
      </div>
    );
  }

  toggleActive() {
    this.props.widget.setActive(!this.props.widget.options.active);
  }
};

WidgetRow.propTypes = {
  widget: PropTypes.instanceOf(BaseWidget).isRequired
};
