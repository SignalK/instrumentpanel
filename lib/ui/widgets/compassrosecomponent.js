var React = require('react');

var size = 400;
var half = size / 2;

module.exports =  React.createClass({
  getInitialState: function() {
    return {
      value: 10,
    };
  },

  renderTicks: function() {
    var ticks = [],
        tick;
    for (var i = 0; i < 180; i += 5) {
      if(i % 10 == 0) {
        tick = 0.1 * half;
      } else {
        tick = 0.07 * half;
      }

      if(i % 45 != 0) {
        ticks.push(
          <path key={i} d={["M", half, "0 L", half, tick, "M", half,
            size - tick, "L", half, size].join(" ")} strokeWidth="1"
            transform={centerRotate(i)} />
        );
      }
    }

    return ticks;
  },

  renderDirName: function() {
    var a = this.state.value;

    var dirs = {
      0: 'North',
      1: 'North by East',
      2: 'North Northeast',
      3: 'Northeast by North',
      4: 'Northeast',
      5: 'Northeast by East',
      6: 'East Northeast',
      7: 'East by North',
      8: 'East',
      9: 'East by South',
      10: 'East Southeast',
      11: 'Southeast by East',
      12: 'Southeast',
      13: 'Southeast by South',
      14: 'South Southeast',
      15: 'South by East',
      16: 'South',
      17: 'South by West',
      18: 'South Southwest',
      19: 'Southwest by South',
      20: 'Southwest',
      21: 'Southwest by West',
      22: 'West Southwest',
      23: 'West by South',
      24: 'West',
      25: 'West by North',
      26: 'West Northwest',
      27: 'Northwest by West',
      28: 'Northwest',
      29: 'Northwest by North',
      30: 'North Northwest',
      31: 'North by West'
    };

    a = Math.round(a / 11.25);

    return dirs[a];
  },

  renderRoseStyle1: function() {
    return (
      <g>
        <g transform="scale(1.25) translate(-40 -40)">
          <g id="layer1" fill="none" strokeWidth="1" stroke="black">
            <path d="M 190,190 200,65 210,190" />
            <path d="M 190,190 110,200 190,210" />
            <path d="M 210,190 290,200 210,210" />
            <path d="M 190,210 200,290 210,210" />
            <path d="M 200,65 200,290" />
            <path d="M 110,200 290,200" />
          </g>

          <g id="layer2" fill="none" strokeWidth="1" stroke="black" transform="rotate(45 200 200) translate(50 50) scale(0.75)">
            <path d="M 190,190 200,110 210,190" />
            <path d="M 190,190 110,200 190,210" />
            <path d="M 210,190 290,200 210,210" />
            <path d="M 190,210 200,290 210,210" />
            <path d="M 200,110 200,290" />
            <path d="M 110,200 290,200" />
          </g>

          <g id="layer3" fill="none" strokeWidth="1" stroke="black" transform="rotate(25 200 200) translate(100 100) scale(0.5)">
            <path d="M 190,190 200,110 210,190" />
            <path d="M 190,190 110,200 190,210" />
            <path d="M 210,190 290,200 210,210" />
            <path d="M 190,210 200,290 210,210" />
            <path d="M 200,110 200,290" />
            <path d="M 110,200 290,200" />
          </g>

          <g id="layer4" fill="none" strokeWidth="1" stroke="black" transform="rotate(-25 200 200) translate(100 100) scale(0.5)">
            <path d="M 190,190 200,110 210,190" />
            <path d="M 190,190 110,200 190,210" />
            <path d="M 210,190 290,200 210,210" />
            <path d="M 190,210 200,290 210,210" />
            <path d="M 200,110 200,290" />
            <path d="M 110,200 290,200" />
          </g>

          <circle cx="200" cy="200" r="30" fill="white" stroke="black" strokeWidth="1" />
          <circle cx="200" cy="200" r="25" fill="white" stroke="black" strokeWidth="1" />
          <circle cx="200" cy="200" r="20" fill="white" stroke="black" strokeWidth="1" />
        </g>
        <text x="200" y="350" textAnchor="middle" fontSize="38">{this.state.value}</text>
      </g>
    );
  },

  renderRoseStyle2: function() {
    return (
      <g id="layer1" fill="none" strokeWidth="0" stroke="none" transform="translate(200,200) scale(1.25)">
        <path d="M -7.701 -7.071 0 -150 7.071 -7.071 100 0 7.071 7.071 0 100 -7.071 7.071 -100 0 Z" fill="url(#g1)" />
        <path d="M -53.033 -53.033 0 -10 53.033 -53.033 10 0 53.033 53.033 0 10 -53.033 53.033 -10 0 Z" fill="url(#g1)" />
        <path d={"M -46.194 -19.134 -7.071 -7.071 -19.134 -46.194 0 -10 19.134 -46.194 7.071 -7.071 46.194 -19.134 10 0 " +
                 "46.194 19.134 7.071 7.071 19.314 46.194 0 10 -19.314 46.194 -7.071 7.071 -46.194 19.134 -10 0 Z"} fill="url(#g1)" />
      </g>
    );
  },

  renderGradient: function() {
    return (
      <svg dangerouslySetInnerHTML={{__html:
        '  <linearGradient id="g1">' +
        '    <stop offset="0%" stop-color="rgba(10,10,40,0.5)" />' +
        '    <stop offset="100%" stop-color="rgba(200,240,200,0.5)" />' +
        '  </linearGradient>'
      }} />
    );
  },

  render: function() {
    return (
      <svg height="100%" width="100%" viewBox="0 0 400 400">
      {this.renderGradient()}
      <g transform="scale(0.8) translate(50 50)">
        <g stroke="black" transform={centerRotate(-this.state.value)}>
          {this.renderTicks()}
          {mainDirs}
          {minorDirs}
          {this.renderRoseStyle2()}
        </g>
      </g>
        <text x="200" y="24" textAnchor="middle" fontSize="20">{this.props.label + " " + this.props.sourceId}</text>
        <text x="200" y="325" textAnchor="middle" fontSize="28">{this.state.value.toFixed(0)}</text>
        <text x="200" y="390" textAnchor="middle" fontSize="20">{this.renderDirName()}</text>
        <polygon points="200,60 195,90 205,90" fill="url(#g1)" />
        <polygon points="200,60 195,80 205,80" fill="url(#g1)" transform="rotate(45 200 200)" />
        <polygon points="200,60 195,80 205,80" fill="url(#g1)" transform="rotate(315 200 200)" />
      </svg>
    )
  },

  renderr: function() {
    return (
      <svg height="100%" width="100%" viewBox="0 0 400 400">
        {this.renderGradient()}
        <g transform="scale(0.8) translate(50 50)">
          <g stroke="black" transform={centerRotate(-this.state.value)}>
            {this.renderTicks()}
            {mainDirs}
            {minorDirs}
            {this.renderRoseStyle2()}
          </g>
        </g>
        <text x="200" y="24" textAnchor="middle" fontSize="20">{this.props.label + " " + this.props.sourceId}</text>
        <text x="200" y="325" textAnchor="middle" fontSize="28">{this.state.value.toFixed(0)}</text>
        <text x="200" y="390" textAnchor="middle" fontSize="20">{this.renderDirName()}</text>
        <polygon points="200,60 195,90 205,90" fill="url(#g1)" />
        <polygon points="200,60 195,80 205,80" fill="url(#g1)" transform="rotate(45 200 200)" />
        <polygon points="200,60 195,80 205,80" fill="url(#g1)" transform="rotate(315 200 200)" />
      </svg>
    )
  },
  componentWillReceiveProps: function(nextProps) {
    if(nextProps.value !== this.props.value) {
      if (nextProps.value) {
        if (this.unsubscribe) {
          this.unsubscribe();
        }
        this.unsubscribe = nextProps.value.onValue(function(value) {
          this.setState({
            value: value
          });
        }.bind(this));
      }
    }
  },
  componentDidMount: function() {
    if (this.props.value) {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      this.unsubscribe = this.props.value.onValue(function(value) {
        this.setState({
          value: value,
        });
      }.bind(this));
    }
  },

  componentWillUnmount: function() {
    if(this.unsubscribe) {
      this.unsubscribe();
    }
  }
});

function centerRotate(deg) {
  return "rotate(" + deg + " " + half + " " + half + ")";
}

function toMainDirText(dir, i) {
  return (
    <text key={i*90}
       x={half}
       y={0.06 * size * 0.8}
       textAnchor="middle"
       fontSize={(0.07 * size) + "px"}
       transform={centerRotate(i*90)}>{dir}</text>
  );
}

function toMinorDirText(dir, i) {
  return (
    <text key={i*90+45}
       x={half}
       y={0.045 * size * 0.8}
       textAnchor="middle"
       fontSize={(0.03 * size) + "px"}
       transform={centerRotate(i*90+45)}>{dir}</text>
  );
}

var mainDirs = ['N', 'E', 'S', 'W'].map(toMainDirText);
var minorDirs = ['NE', 'SE', 'SW', 'NW'].map(toMinorDirText);
