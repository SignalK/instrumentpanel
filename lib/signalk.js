var WebSocket = require('ws');
var debug = require('debug')('signalk:ws');
var browser = require('./ui/util/browser');
var Promise = require('bluebird');


function connectDelta(hostname, callback, onConnect, onDisconnect) {
  debug("Connecting to " + hostname);
  var url = "ws://" + hostname + "/signalk/stream/v1?stream=delta&context=self";
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
      var sub = '{"context":"vessels.self","subscribe":[{"path":"*"}]}';
      connection.send(sub);
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

function getSelf(host) {
  return new Promise(function(resolve, reject) {
    browser.ajax("http://" + host + "/signalk/api/v1/vessels/self", resolve, reject);
  });
}

function getSelfMatcher(host) {
  return getSelf(host).then(function(selfData) {
    var selfId = selfData.mmsi || selfData.uuid;
    if (selfId) {
      var selfContext = 'vessels.' + selfId;
      return function(delta) {
        return delta.context === 'self' || delta.context === 'vessels.self' || delta.context === selfContext;
      }
    } else {
      return function(delta) {
        return true;
      }
    }
  });
}

module.exports = {
  connectDelta: connectDelta,
  getSelf: getSelf,
  getSelfMatcher: getSelfMatcher
}