class SignalKSchemaData {
  constructor ({ host, port, ssl }) {
    this.selfUrl = `http${ssl ? 's' : ''}://${host}${port ? `:${port}` : ''}/signalk/v1/api/vessels/self/`
    this.metadataByPath = {}
  }

  getMetaUrl (path) {
    return this.selfUrl + path.replace(/\./g, '/') + '/meta/'
  }

  getMetaForVesselPath (path) {
    if (this.metadataByPath[path]) {
      return Promise.resolve(this.metadataByPath[path])
    }

    return new Promise((resolve, reject) => {
      fetch(this.getMetaUrl(path))
       .then(response => {
         if (response.status === 200) {
           response.json().then(meta => {
             this.metadataByPath[path] = meta
             resolve(meta)
           })
         } else if (response.status === 404) {
             console.warn('No such meta for '+path)
             this.metadataByPath[path] = {}
             resolve({})
         } else {
           throw new Error('Error fetching metadata: ' + response.status)
         }
       }).catch(err => {
        reject(err)
       })
    })
  }

  addMetaInCache(path, meta) {
    if (typeof this.metadataByPath[path] === "undefined") {
      this.metadataByPath[path] = meta
    }
  }

}

module.exports = SignalKSchemaData;
