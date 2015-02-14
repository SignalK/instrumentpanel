module.exports = {
  componentDidMount: function() {
    var that = this;
    this.unsubscribe = this.props.forceUpdateStream.onValue(function(){
      that.forceUpdate();
    });
  },
  componentWillUnmount: function() {
    if(this.unsubscribe) {
      this.unsubscribe();
     }   
  }
}