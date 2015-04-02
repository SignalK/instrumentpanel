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
    var name = (new RegExp('[?&]' + encodeURIComponent(parameterName) + '=([^&]*)')).exec(window.location.search);
    if (name)
      return decodeURIComponent(name[1]);
  },
  saveGrid: function(host, data) {
    var storedData = getStoredData();
    storedData[host] = data;
    window.localStorage.setItem('signalkGrid3', JSON.stringify(storedData));
  },
  retrieveGrid: function(host) {
    return getStoredData()[host];
  }
}

function getStoredData() {
  var storedData = {};
  try {
    var fromLocal = window.localStorage['signalkGrid3'];
    if (fromLocal) {
      storedData = JSON.parse(fromLocal);
    }
  } 
  catch (ex) {
    console.error(ex);
  }
  return storedData;
}