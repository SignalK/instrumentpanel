import React, {Component} from 'react';
import ClearFix from 'material-ui/internal/ClearFix';
import spacing from 'material-ui/styles/spacing';
import {darkWhite, lightWhite, grey900} from 'material-ui/styles/colors';

export default class Footer extends Component {
  getStyles() {
    const styles = {
      footer: {
        backgroundColor: grey900,
        textAlign: 'center',
        padding: spacing.desktopGutter,
        position: 'fixed',
        width: '100%',
        bottom: 0
      },
      a: {
        color: darkWhite,
      },
      p: {
        margin: '0 auto',
        padding: 0,
        color: lightWhite,
        maxWidth: 356,
      }
    }

    return styles;
  }

  render() {
    const styles = this.getStyles();

    return (
      <ClearFix>
        <footer style={styles.footer}>
          <p style={styles.p}>
            <a style={styles.a} href='https://github.com/signalk/instrumentpanel'>Signal K Instrument Panel</a>
          </p>
        </footer>
      </ClearFix>
    );
  }
}
