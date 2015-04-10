module.exports = {
  componentDidMount: function() {
    this.unsubscribe = this.props.model.onValue(this.replaceState.bind(this));
  },
  componentWillUnmount: function() {
    if(this.unsubscribe) {
      this.unsubscribe();
     }   
  }
}
