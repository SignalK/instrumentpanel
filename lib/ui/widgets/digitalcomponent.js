var React = require('react');

module.exports = React.createClass({
  contextTypes: {
    muiTheme: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      value: '-'
    };
  },

  componentDidMount: function() {
    if (this.props.valueStream) {
      this.unsubscribe = this.props.valueStream.onValue(function(value) {
        this.setState({
          value: displayValue(value) || this.state.valueStream
        });
      }.bind(this));
    }
  },

  componentWillUnmount: function() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },

  render: function() {
    const {textColor} = this.context.muiTheme.palette;
    return (
      <svg height="100%" width="100%" viewBox="0 0 20 40">
        <text x="10" y="8" textAnchor="middle" fontSize="5" dominantBaseline="middle" fill={textColor}>
          {this.props.label + " " + this.props.sourceId}
        </text>
        <g transform="translate(10, 0)">
          <text textAnchor="middle" y="32" fontSize="26" dominantBaseline="middle" fill={textColor}>
            {this.state.value.toString()}
          </text>
          <text textAnchor="end" x="40" y="32" fontSize="8" dominantBaseline="middle" fill={textColor}>
            {this.props.convertTo ? this.props.convertTo : this.props.unit}
          </text>
        </g>
      </svg>
    )
  }
});

function displayValue(value) {
  if(typeof value === 'number') {
    var v = Math.abs(value);
    if(v >= 50) {
      return value.toFixed(0);
    } else if(v >= 10) {
      return value.toFixed(1);
    } else {
      return value.toFixed(2);
    }
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value;
}
