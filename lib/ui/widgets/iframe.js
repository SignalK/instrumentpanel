import React from 'react';
import { render } from 'react-dom';
import util from 'util'

import BaseWidget, {defaultComponentDidMount, defaultComponentWillUnmount} from './basewidget';

function Iframe(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.options.unit = '';

  class IframeComponent extends React.Component {
    constructor(props) {
      super(props);
      this.finalUnit = '';
      this.widgetLabel = '';
      this.onOptionsUpdate = this.onOptionsUpdate.bind(this);
      this.onOptionsUpdate(this.props.optionsBundle.getOptions());
      this.renderSVG = this.renderSVG.bind(this);
      this.renderIframe = this.renderIframe.bind(this);
      this.setDarkMode = this.setDarkMode.bind(this);
      this.state = {
        value: {
          src: ''
        },
        darkModeOn: this.props.instrumentPanel.getDarkMode()
      };
    }

    setDarkMode(darkMode) {
      this.setState({'darkModeOn': darkMode});
    }

    componentDidMount() {
      defaultComponentDidMount(this, undefined, undefined);
      this.props.functions['setDarkMode'] = this.setDarkMode;
      this.setDarkMode(this.props.instrumentPanel.getDarkMode());
    }

    componentWillUnmount() {
      this.props.functions['setDarkMode'] = undefined;
      defaultComponentWillUnmount(this);
    }

    onOptionsUpdate(options) {
      this.widgetLabel = options.label;
    }

    render() {
      return (this.props.instrumentPanel.model.get().settingsVisible) ? this.renderSVG() : this.renderIframe();
    }

    renderSVG() {
      return (
        <svg key={id} height="100%" width="100%" viewBox="0 0 20 33" stroke="none">
          <text x="10" y="6" textAnchor="middle" fontSize="8" dominantBaseline="middle">{this.widgetLabel}</text>
          <text x="10" y="16" textAnchor="middle" fontSize="8" dominantBaseline="middle">{this.props.optionsBundle.getOptions().path}</text>
          <text x="10" y="26" textAnchor="middle" fontSize="8" dominantBaseline="middle">rendered disabled in setting mode</text>
        </svg>
      )
    }

    renderIframe() {
      try {
        var fullSrc = this.state.value.src;
        var darkModeValue = (this.state.darkModeOn) ? this.state.value.darkValue : this.state.value.lightValue;
        var separator = (fullSrc.indexOf('?') !== -1) ? '&' : '?';
        if (fullSrc !== '' && this.state.value.themeKey &&
          this.state.value.themeKey !== '' &&
          darkModeValue &&
          darkModeValue !== '') {
            fullSrc += separator + this.state.value.themeKey + '=' + darkModeValue;
        }
        return (
          <iframe
            src={fullSrc}
            sandbox='allow-scripts allow-same-origin allow-forms'
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            style={(!this.props.instrumentPanel.model.get().isLocked)?({pointerEvents: "none", padding: "5px"}):({})}
          />
        );
      } catch (ex) {console.log(ex)}
      return (<div>safety mode</div>)
    }
  }

  IframeComponent.defaultProps = {
    functions: {}
  }

  this.widget = React.createElement(IframeComponent,{
    key: id,
    instrumentPanel: this.instrumentPanel,
    valueStream: this.valueStream,
    optionsBundle: this.optionsBundle
  });

}

util.inherits(Iframe, BaseWidget);

Iframe.prototype.getReactElement = function() {
  return this.widget;
}

Iframe.prototype.getSettingsElement = function(pushCellChange) {
  return this.getSettingsElementUnitOnly(pushCellChange);
}

Iframe.prototype.getType = function() {
  return "iframe";
}

Iframe.prototype.getInitialDimensions = function() {
  return {h: 2};
}

export default {
  constructor: Iframe,
  type: "iframe",
  paths: ['external.iframe.*']
}
