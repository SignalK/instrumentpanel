var BaconModelMixin = {
  componentDidMount: function() {
    this.unsubscribe = this.props.model.onValue(this.setState.bind(this));
  },
  componentWillUnmount: function() {
    if(this.unsubscribe) {
      this.unsubscribe();
     }   
  }
}