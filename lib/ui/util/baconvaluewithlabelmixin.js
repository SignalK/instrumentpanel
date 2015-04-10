var React = require('react');

module.exports = {
  getInitialState: function() {
    return {
      value: '-',
      label: this.props.label,
      unit: this.props.unit
    };
  },
  componentDidMount: function() {
    if (this.props.value) {
      this.unsubscribe = this.props.value.onValue(function(value) {
        this.setState({
          value: this.displayValue(value) || this.state.value,
          label: this.state.label,
          unit: this.state.unit
        });
      }.bind(this));
    }
  },
  componentWillUnmount: function() {
    if(this.unsubscribe) {
      this.unsubscribe();
    }
  }     
}