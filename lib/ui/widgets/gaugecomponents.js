var React = require('react');

module.exports =  {
  getShadow: function() {
    return ({ __html:
      '<filter id="f1">' +
      '<feGaussianBlur in="SourceAlpha" stdDeviation="2" />' +
      '<feOffset dx="2.4" dy="1.6" />' +
      '<feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>' +
      '</filter>'
    });
  },
  getHand: function(length, angle) {
    var halfMaxWidth = (length / 20).toFixed(0);
    var points = "";
    points += '0,' + -length + ' ';
    points += -halfMaxWidth + ',' + 0 + ' ';
    points += '0,' + halfMaxWidth + ' ';
    points += halfMaxWidth + ',' + 0 + ' ';
    return (
      <polygon points={points}
            fill="rgba(221, 221, 221, 0.6)" stroke="#333" strokeWidth="1"
            transform={'rotate(' + angle + ')'} style={{"filter":"url(#f1)"}} />
    )
  }
}