import React from 'react';
import {Modal, Button} from 'react-bootstrap';

export default class ChangelogComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state =  {
      htmlContent: '',
      show: true
    };
    this.handleClose = this.handleClose.bind(this);
    this.popupTitle = "What's new ";
    if (this.props.lastUsedVersion === '') {
      this.popupTitle += 'in Instrument Panel'
    } else {
      this.popupTitle += 'since version ' + this.props.lastUsedVersion;
    }
  }

  handleClose() {
    this.setState(
      { show: false }
    );
    this.props.model.lens("changelogVisible").set(false)
  }

  render() {
    return (
      <div className="help">
        <Modal show={this.state.show} backdrop="static" onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{this.popupTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>You can find this changelog later in the help</div>
            <div className="" dangerouslySetInnerHTML={ {__html: this.state.htmlContent} } />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  componentDidMount() {
    let that = this;
    let errorMessage = 'Error when loading the changelog content. <BR/>Please close popup...'
    fetch('./CHANGELOG.html')
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
    this.setState({htmlContent: 'Loading the changelog content...'})
  }
};

