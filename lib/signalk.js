var WebSocket = require('ws');
var debug = require('debug')('signalk:ws');


function connectDelta(hostname, callback) {
  var url = "ws://" + hostname + "/signalk/stream?stream=delta&context=self";
  if (typeof Primus != 'undefined') {
    var signalKStream = Primus.connect(url, {
      reconnect: {
        maxDelay: 15000,
        minDelay: 500,
        retries: Infinity
      }
    });
    signalKStream.on('data', callback);
  } else {
    connection = new WebSocket(url);
    connection.onopen = function(msg) {
      debug("open");
    };

    connection.onerror = function(error) {
      debug("error:" + error);
    };
    connection.onmessage = function(msg) {
      callback(JSON.parse(msg.data));
    };
  }
}

module.exports = {
  connectDelta: connectDelta
}