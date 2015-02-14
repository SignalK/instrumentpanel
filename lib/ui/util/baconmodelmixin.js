module.exports = {
  componentDidMount: function() {
    this.unsubscribe = this.props.model.log().onValue(this.setState.bind(this));
  },
  componentWillUnmount: function() {
    if(this.unsubscribe) {
      this.unsubscribe();
     }   
  }
}
