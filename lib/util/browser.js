var debug = require('debug')('signalk:browser');

const GRID = 'skGrid';
const HOSTS = 'skHosts';
const LAST_HOST = 'skLastHost';
const CONNECTED = 'skConnected';

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
    var storedData = getStoredData(GRID) || {};
    storedData[host] = data;
    saveStoredData(GRID, storedData);
  },

  retrieveGrid: function(host) {
    return getStoredData(GRID)[host];
  },

  saveHost: function(host) {
    let hosts = getStoredData(HOSTS) || [];
    let i = hosts.indexOf(host);

    if(i === -1) {
      hosts.push(host);
      i = 0;
    }

    saveStoredData(LAST_HOST, i);
    saveStoredData(HOSTS, hosts);
  },

  removeHost: function(host) {
    let hosts = getStoredData(HOSTS);
    let lastHost = getStoredData(LAST_HOST);

    if(hosts) {
      lastHost = hosts[lastHost];

      if(host === lastHost) {
        window.localStorage.removeItem[LAST_HOST];
      }

      hosts = hosts.filter(function(i) { return i !== host; });

      saveStoredData(HOSTS, hosts);
    }

    return hosts;
  },

  retrieveHosts: function() {
    let hosts = getStoredData(HOSTS);

    if(!hosts) {
      hosts = [];
    }

    return hosts;
  },

  retrieveLastHost: function() {
    let hosts = this.retrieveHosts();

    if(hosts) {
      return hosts[0];
    }

    return undefined;
  },

  isConnected: function(connected) {
    if(typeof connected !== 'undefined') {
      saveStoredData(CONNECTED, connected);
    }

    return getStoredData(CONNECTED);
  },

  clearStorage: function() {
    window.localStorage.removeItem[CONNECTED];
    window.localStorage.removeItem[LAST_HOST];
    window.localStorage.removeItem[HOSTS];
    window.localStorage.removeItem[GRID];
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
