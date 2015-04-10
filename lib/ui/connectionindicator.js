var React = require('react');
var Icon = require('react-font-awesome').Icon;    

var ConnectionIndicator = React.createClass({
  getInitialState: function() {
    return {
      value: true
    };
  },
  render: function() {
    var cx = React.addons.classSet;
  var classes = cx({
    'fa': true,
    'fa-circle': this.state.value,
    'fa-circle-o': !this.state.value
  });
    return (
      <i className={classes} style={{"position": "absolute", "right": 2, "top": 2}}></i>
    );
  },
  componentDidMount: function() {
    var that = this;
    this.unsubscribe = this.props.allUpdates.debounceImmediate(1000).onValue(function(){
      that.setState({value: !that.state.value});
    }); 
  },
  componentWillUnmount: function() {
    this.unsubscribe();
  },
});

module.exports = ConnectionIndicator;