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
    this.state = this.ledNone;
  }

  componentDidMount() {
    this.unsubscribe = this.props.isValid.onValue( isValid => {
      this.setState((isValid>=0) ? ((isValid===1) ? this.ledGreen : this.ledRed) : this.ledBlue)
    })
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <div className="led">
        <svg height={this.props.size} width={this.props.size}>
          <circle cx={this.state.cx} cy={this.state.cy} r={this.state.radius} stroke={this.state.stroke} strokeWidth={this.state.strokeWidth} fill={this.state.color} />
        </svg>
      </div>
    );
  }
}