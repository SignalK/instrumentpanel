import React from "react";

const SvgLED24px = props => (
  <svg height="100" width="100">
    <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
  </svg>
);

export default SvgLED24px;

export class LedComponent extends React.Component {
  constructor(props) {
    super(props);
    this.renderLed = this.renderLed.bind(this);
    this.ledRed = {
      cx: this.props.size / 2,
      cy: this.props.size / 2,
      radius: this.props.size / 4,
      color: "red",
      stroke: "",
      strokeWidth: 1
    };
    this.ledGreen = {
      cx: 6,
      cy: this.props.size -6,
      radius: 4,
      color: "green",
      stroke: "",
      strokeWidth: 0
    };
    this.ledBlue = {
      cx: 6,
      cy: this.props.size -6,
      radius: 4,
      color: "blue",
      stroke: "",
      strokeWidth: 0
    };
    this.ledNone = {
      cx: this.props.size / 2,
      cy: this.props.size / 2,
      radius: this.props.size / 4,
      color: "none",
      stroke: "",
      strokeWidth: 1
    }
    this.state = {
      isValid: -2,
      navbarVisible: true
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.isValid.onValue( ([isValid, navbarVisible]) => {
      this.setState({
        isValid: isValid,
        navbarVisible: navbarVisible
      })
    })
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  renderLed(params) {
    return (
      <div className="led">
        <svg height={this.props.size} width={this.props.size}>
          <circle cx={params.cx} cy={params.cy} r={params.radius} stroke={params.stroke} strokeWidth={params.strokeWidth} fill={params.color} />
        </svg>
      </div>
    );
  }

  render() {
    if (this.state.isValid === 0) {
      return this.renderLed(this.ledRed);
    } else if (this.state.navbarVisible) {
      if (this.state.isValid===-2) {
        return this.renderLed(this.ledNone)
      } else if (this.state.isValid===-1) {
         return this.renderLed(this.ledBlue)
      }
      return this.renderLed(this.ledGreen)
    }
    return null;
  }
}