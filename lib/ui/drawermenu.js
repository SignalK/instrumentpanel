import React from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

import {spacing, typography, zIndex} from 'material-ui/styles';
import {cyan500} from 'material-ui/styles/colors';

const styles = {
  logo: {
    cursor: 'pointer',
    fontSize: 24,
    color: typography.textFullWhite,
    lineHeight: `${spacing.desktopKeylineIncrement}px`,
    fontWeight: typography.fontWeightLight,
    backgroundColor: cyan500,
    paddingLeft: spacing.desktopGutter,
    marginBottom: 8,
  },
};

export default React.createClass({
  mixins: [require('../util/baconmodelmixin')],

  getInitialState: function() {
    return this.props.model.get();
  },

  setPage: function(page) {
    this.props.instrumentPanel.setPage(page);
  },

  appendPage: function() {
    this.props.instrumentPanel.setPage(this.props.instrumentPanel.pages.length);
  },

  deletePage: function() {
    if (this.props.instrumentPanel.pages.length > 1 &&
      confirm("Are you sure you want to delete page " + (this.props.instrumentPanel.currentPage + 1))) {
      this.props.instrumentPanel.deleteCurrentPage();
    }
  },

  pages: function() {
    var pageButton = function(page, i) {
      return (
        <MenuItem key={i} primaryText={"Page " + (i + 1)} onTouchTap={this.setPage.bind(this, i)} />
      );
    };

    var deletePage = this.props.instrumentPanel.pages.length > 1
      ? <MenuItem onTouchTap={this.deletePage} primaryText="Delete Current Page" />
      : "";

    return (
      <div>
        <MenuItem onTouchTap={this.appendPage} primaryText="Add Page" />
        {this.props.instrumentPanel.pages.map(pageButton, this)}
        {deletePage}
      </div>
    );
  },

  render: function() {
    return (
      <Drawer open={this.state.drawerOpen} docked={false}
        onRequestChange={(drawerOpen) => this.setState({drawerOpen})}>
        <div style={styles.logo}>
          Instrument Panel
        </div>
        {this.pages()}
      </Drawer>
    );
  }
});
