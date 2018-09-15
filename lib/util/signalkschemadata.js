class SignalKSchemaData {
  constructor(host, ssl) {
    this.rootUrl = 'http' + (ssl ? 's' : '') + '://' + host;
    this.rootUrl += '/signalk/v1/api/vessels/self/';
    this.metaDataPaths = [];
  }

  getMetaForVesselPath(path) {
    return new Promise( metaReturn => {
      if (this.metaDataPaths[path] !== undefined) {
        metaReturn(this.metaDataPaths[path]);
      } else {
        fetch(this.rootUrl + path.replace(/\./g, '/') + '/meta/')
        .then(response => {
          return response.json();
        }).then(meta => {
          this.metaDataPaths[path] = meta;
          metaReturn(meta);
        }.bind(path))
        .catch(function (error) {
          var message;
          if (error.message.startsWith("Unexpected token")) {
            message = 'No such meta for '+path;
            this.metaDataPaths[path] = {};
          } else {
              message = 'getMetaForVesselPath:'+error.message;
            }
          console.warn(message);
          metaReturn({});
        }.bind(this));
      }
    });
  }
}

module.exports = SignalKSchemaData;