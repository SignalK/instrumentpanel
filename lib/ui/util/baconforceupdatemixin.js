module.exports = {
  componentDidMount: function() {
    this.unsubscribe = this.props.forceUpdateStream.onValue(this.forceUpdate.bind(this));
  },
  componentWillUnmount: function() {
    if(this.unsubscribe) {
      this.unsubscribe();
     }   
  }
}