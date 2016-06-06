var debug = require('debug')('signalk:browser');

const GRIDKEY = 'signalKGrid';
const HOSTSKEY = 'signalKHosts';

module.exports = {

  ajax: function(url, success, error, data) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function(event) {
      success(xhr.response);
    }
    xhr.onerror = error;
    xhr.send(data);
  },

  getUrlParameter: function(parameterName) {
    let name = parameterName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);

    return results === null ? "" :
      decodeURIComponent(results[1].replace(/\+/g, " "));
  },

  saveGrid: function(host, data) {
    var storedData = getStoredData(GRIDKEY);
    storedData[host] = data;
    saveStoredData(GRIDKEY, storedData);
  },

  retrieveGrid: function(host) {
    return getStoredData(GRIDKEY)[host];
  },

  saveHost: function(host) {
    let hosts = getStoredData(HOSTSKEY);

    if(!hosts) {
      hosts = [host];
    } else if(hosts.indexOf(host) === -1) {
      hosts.push(host);
    }

    saveStoredData(HOSTSKEY, hosts);
  },

  removeHost: function(host) {
    let hosts = getStoredData(HOSTKEY);

    if(hosts) {
      hosts = hosts.filter(function(i) { return i !== host; });
      saveStoredData(HOSTSKEY, hosts);
    }

    return hosts;
  },

  retrieveHosts: function() {
    let hosts = getStoredData(HOSTSKEY);

    if(!hosts) {
      hosts = [];
    }

    return hosts;
  },

  retrieveLastHost: function() {
    let hosts = retrieveHosts();

    if(hosts) {
      return hosts[0];
    }

    return undefined;
  },

  clearStorage: function() {
    window.localStorage.removeItem[HOSTSKEY];
    window.localStorage.removeItem[GRIDKEY];
  }
}

function getStoredData(key) {
  let storedData = null;
  try {
    const fromLocal = window.localStorage[key];
    if (fromLocal) {
      storedData = JSON.parse(fromLocal);
    }
  }
  catch (ex) {
    debug('getStoredData:' + ex);
  }
  return storedData;
}

function saveStoredData(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (ex) {
    debug('saveStoredData:' + ex);
  }
}
