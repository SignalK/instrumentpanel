var React = require('react');
var d3 = require('d3');

var gaugeComponents = require('./gaugecomponents');
var getShadow = gaugeComponents.getShadow;
var getHand = gaugeComponents.getHand;
var BaseWidget = require('./basewidget');

var size = 400;
var half = size / 2;
var strokeWidth = 25;

module.exports = React.createClass({
  getInitialState: function() {
    return {
      value: 0,
      label: this.props.label,
      minValue: this.props.minValue || 0,
      maxValue: this.props.maxValue || 10
    };
  },

  renderTicks: function(scale) {
    var yOffset = 0;
    return scale.ticks().map(function(i) {
      return (
    <g key={"text-" + i} transform={'rotate(' + scale(i) + ' 200 0)'}>
      <text x={-half} y={yOffset + 10} textAnchor="middle" dominantBaseline="central" style={{"fontSize":"28px"}}
        transform={"rotate(" + -scale(i) + ")"}>{i}</text>
    </g>
)
    });
  },

  render: function() {
    try {
    var scale = d3.scale.linear()
       .domain([this.state.minValue, this.state.maxValue])
       .range([0, size]).clamp(true);
    var logScale = d3.scale.log()
    .base(Math.E)
    .domain([Math.max(this.state.minValue, 0.00001), this.state.maxValue])
    .range([0, size]).clamp(true)


    return (
      <svg height="100%" width="100%" viewBox={"0 0 " + size/4 + " " + size}>
        <g stroke="black">
        <rect x="0" y="0" width="100" height={scale(this.state.value)} transform="translate(0,400) scale(1,-1)"/>
        <rect x="100" y="0" width="100" height={logScale(this.state.value)} transform="translate(0,400) scale(1,-1)"/>
        </g>
      </svg>
    )
  } catch (ex) {
    console.log(ex)
  }
  return (<div>failsafe</div>)
  },

  componentDidMount: function() {
    if (this.unsubscribes) {
      this.unsubscribes.forEach(function(unsubscribe) {
        unsubscribe()
      });
    }
    this.unsubscribes = [];
    if (this.props.valueStream) {
      this.unsubscribes.push(this.props.valueStream.onValue(function(value) {
        if (typeof value === 'number') {
          this.setState({
            value: value
          });
        }
      }.bind(this)));
    }
    this.unsubscribes.push(this.props.maxValueStream.onValue(function(value) {
      this.setState({
        maxValue: value
      });
    }.bind(this)));
    this.unsubscribes.push(this.props.minValueStream.onValue(function(value) {
      this.setState({
        minValue: value
      });
    }.bind(this)));
    this.unsubscribes.push(this.props.redLineStream.onValue(function(value) {
      this.setState({
        redLine: value
      });
    }.bind(this)));
  },


  componentWillUnmount: function() {
    this.unsubscribes.forEach(function(unsubscribe) {
      unsubscribe()
    });
  }
});
