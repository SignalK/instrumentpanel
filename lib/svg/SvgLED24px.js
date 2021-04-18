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
    this.halfSize = this.props.size / 2;
    this.radius = this.halfSize - 2;
    this.state = {
      color: "red",
      stroke: "black"
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.isValid.onValue( isValid => {
      this.setState({
        color: isValid ? "green" : "red"
      })
    }
    )
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <div className="led">
        <svg height={this.props.size} width={this.props.size}>
          <circle cx={this.halfSize} cy={this.halfSize} r={this.radius} stroke={this.state.stroke} strokeWidth="2" fill={this.state.color} />
        </svg>
      </div>
    );
  }
}