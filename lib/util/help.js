import React from 'react';

export default class HelpComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state =  {
      htmlContent: 'Retrieving the help content...'
    };
  }

  render() {
    return (
      <div className="help" dangerouslySetInnerHTML={ {__html: this.state.htmlContent} } />
    );
  }

  componentDidMount() {
    let that = this;
    let errorMessage = 'Error when loading the help content. <BR/>Please close the help and try again...'
    fetch('./help/help.html')
    .then(response => {
      if (response.status === 200) {
        return response.text();
      } else {
        return '[' + response.status + '] ' + errorMessage;
      }
    }).catch(err => {
      return '[' + err + '] ' + errorMessage;
    }).then( content => {
      that.setState({htmlContent: content})
    });
    this.setState({htmlContent: 'Loading the help content...'})
  }
};

