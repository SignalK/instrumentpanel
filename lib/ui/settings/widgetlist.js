import React from 'react';
import {GridList, GridTile} from 'material-ui/GridList';
import Toggle from 'material-ui/Toggle';

import InstrumentPanel from '../../instrumentpanel';

/**
 * WidgetList
 *
 * WidgetList displays all of the widgets currently registered with the
 * instrument panel in a table.
 *
 * @instrumentPanel: an InstrumentPanel object
 */
var WidgetList = React.createClass({
  propTypes: {
    instrumentPanel: React.PropTypes.instanceOf(InstrumentPanel).isRequired
  },

  style: {
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
    },

    gridList: {
      marginBottom: 24,
    },

    digital: {
      width: '100%',
      height: '50%',
    },

    analog: {
      width: '100%',
      height: '100%'
    },
  },

  render: function() {
    function getCols() {
      const width = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

      return Math.round(width/640*2);
    }

    function getWidgetStyle(type, that) {
      if(type === 'universal' || type === 'digitalposition') {
        return that.style.digital;
      }

      return that.style.analog;
    }

    function getPaths(sources) {
      return sources.map(function(source, i) {
        return
          <p key={i} style={{fontWeight:'bold'}}>
            {source.path.replace(/\./g, '.\u8203')}
            ({source.sourceId})
          </p>;
      });
    }

    var tiles =
      this.props.instrumentPanel.getWidgets().map(function(widget, i) {
        return (
          <GridTile
            key={i}
            title={widget.getType()}
            actionIcon={
              <Toggle
                toggled={widget.options.active}
                onToggle={this.toggleActive(widget)} />
            }
            subtitle={<span>getPaths(widget.getHandledSources())</span>}
          >
            <div style={getWidgetStyle(widget.getType(), this)}>
              {widget.getReactElement()}
            </div>
          </GridTile>
        );
      }, this);

    return (
      <div style={this.style.root}>
        <GridList cols={getCols()} cellHeight={200} style={this.style.gridList}>
          {tiles}
        </GridList>
      </div>
    );
  },

  toggleActive: function(widget) {
    return function() {
      widget.setActive(!widget.options.active);
    }
  }
});

module.exports = WidgetList;
