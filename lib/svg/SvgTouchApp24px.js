import React from "react";

const SvgTouchApp24px = props => (
  <svg x="0" y="0" width="1em" height="1em" viewBox="0 0 24 24" {...props} >
    <path d="M18.12 14.44l-3.24-1.62c1.29-1 2.12-2.56 2.12-4.32C17 5.47 14.53 3 11.5 3S6 5.47 6 8.5c0 2.13 1.22 3.98 3 4.89v3.26l-1.84-.39-.1-.02c-.1-.02-.2-.03-.32-.03-.53 0-1.03.21-1.41.59l-1.4 1.42 5.09 5.09c.43.44 1.03.69 1.65.69h6.3c.98 0 1.81-.7 1.97-1.67l.8-4.71c.22-1.3-.43-2.58-1.62-3.18zm-.35 2.85l-.8 4.71h-6.3c-.09 0-.17-.04-.24-.1l-3.68-3.68 4.25.89V8.5c0-.28.22-.5.5-.5s.5.22.5.5v6h1.76l3.46 1.73c.4.2.62.63.55 1.06zM8 8.5C8 6.57 9.57 5 11.5 5S15 6.57 15 8.5c0 .95-.38 1.81-1 2.44V8.5C14 7.12 12.88 6 11.5 6S9 7.12 9 8.5v2.44c-.62-.63-1-1.49-1-2.44z" />
  </svg>
);

export default SvgTouchApp24px;

export class TouchAppComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { navBarVisible: true };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    try {
      this.props.widget.reactWidget.props.functions.changeDisplayMode();
    } catch (e) { }
  }

  componentDidMount() {
    var that = this;
    this.unsubscribe = this.props.widget.reactWidget.props.instrumentPanel.navBarVisible.onValue((navBarVisible) => {
      that.setState({ navBarVisible })
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    return (
      this.state.navBarVisible ? <div className="widget-clickme" onClick={this.handleClick}>
        <SvgTouchApp24px width="18px" height="18px" />
      </div> : null
    )
  }
}
