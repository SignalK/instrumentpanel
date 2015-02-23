var WebSocket = require('ws');
var debug = require('debug')('signalk:ws');


function connectDelta(hostname, callback, onConnect, onDisconnect) {
  debug("Connecting to " + hostname);
  var url = "ws://" + hostname + "/signalk/stream?stream=delta&context=self";
  if (typeof Primus != 'undefined') {
    debug("Using Primus");
    var signalKStream = Primus.connect(url, {
      reconnect: {
        maxDelay: 15000,
        minDelay: 500,
        retries: Infinity
      }
    });
    signalKStream.on('data', callback);
    return {
      disconnect: function() {
        signalKStream.destroy();
        debug('Disconnected');
      }
    }
  } else {
    debug("Using ws");
    var connection = new WebSocket(url);
    connection.onopen = function(msg) {
      debug("open");
      onConnect();
    };

    connection.onerror = function(error) {
      debug("error:" + error);
    };
    connection.onmessage = function(msg) {
      callback(JSON.parse(msg.data));
    };
    return {
      disconnect: function() {
        connection.close();
        debug('Disconnected');
      }
    }
  }
}

module.exports = {
  connectDelta: connectDelta
}