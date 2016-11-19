var React = require('react');

var BaseWidget = require('./basewidget');
require('util').inherits(DigitalPosition, BaseWidget);


function DigitalPosition(id, options, streamBundle, instrumentPanel) {
  BaseWidget.call(this, id, options, streamBundle, instrumentPanel);
  this.widget = React.createElement(React.createClass({
    contextTypes: {
      muiTheme: React.PropTypes.object.isRequired
    },
    getInitialState: function() {
      return {}
    },
    componentDidMount: function() {
        this.unsubscribe = streamBundle.getStreamForSourcePath(options.sourceId, options.path).onValue(function(value) {
          this.setState(value);
        }.bind(this));
    },
    componentWillUnmount: function() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    },

    render: function() {
      const {textColor} = this.context.muiTheme.palette;
      return (
        <svg key={id} height="100%" width="100%" viewBox="0 0 20 40">
          <text x="10" y="19" textAnchor="middle" fontSize="16" dominantBaseline="middle" fill={textColor}>
            {getPrefixedValue(this.state.longitude, 'E', 'W') + '\u00b0'}
          </text>
          <text x="10" y="35" textAnchor="middle" fontSize="16" dominantBaseline="middle" fill={textColor}>
            {getPrefixedValue(this.state.latitude, 'N', 'S') + '\u00b0'}
          </text>
          <text x="10" y="4" textAnchor="middle" fontSize="5" dominantBaseline="middle" fill={textColor}>
            {"Position " + options.sourceId}
          </text>
        </svg>
      )
    }
  }),{
    key: id
  });
}

function getPrefixedValue(value, positivePrefix, negativePrefix) {
  if (value) {
    return (value >= 0 ? positivePrefix : negativePrefix) + " " + Math.abs(value.toFixed(4))
  } else {
    return '--.--'
  }
}

DigitalPosition.prototype.getReactElement = function() {
  return this.widget;
}

DigitalPosition.prototype.getType = function() {
  return "digitalposition";
}

DigitalPosition.prototype.getOptions = function() {
  return this.options;
}

DigitalPosition.prototype.getInitialDimensions = function() {
  return {w:2, h:3};
}


module.exports = {
  constructor: DigitalPosition,
  type: "digitalposition",
  paths: ['navigation.position']
}
