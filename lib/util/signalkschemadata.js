let defaultMetadataByPath = { // some default meta for beter dispaying
  'navigation.courseGreatCircle.bearingTrackTrue': {
    units: 'rad',
    displayName: 'course GC bearing Track True'
  },
  'navigation.courseGreatCircle.nextPoint.distance': {
    units: 'm',
    displayName: 'course GC distance to next point'
  },
  'navigation.courseGreatCircle.nextPoint.velocityMadeGood': {
    units: 'm/s',
    displayName: 'course GC VMG to next point'
  },
  'navigation.courseGreatCircle.nextPoint.bearingTrue': {
    units: 'rad',
    displayName: 'course GC bearing True to next point'
  },
  'navigation.courseGreatCircle.nextPoint.position': {
    displayName: 'course GC position of next point'
  },
  'navigation.courseOverGroundTrue': {
    displayName: 'COG(t)',
  },
  'navigation.courseOverGroundMagnetic': {
    displayName: 'COG(m)',
  },
  'navigation.headingMagnetic' : {
    displayName: 'Heading Magnetic',
  },
  'navigation.headingTrue' : {
    displayName: 'Heading True',
    timeout: 1
  },
  'sensors.ais.fromBow': {
    units: 'm',
  },
  'sensors.ais.fromCenter': {
    units: 'm',
  },
  'sensors.gps.fromCenter': {
    units: 'm',
  },
  'sensors.gps.fromBow': {
    units: 'm',
  },
  'environment.wind.angleApparent' : {
    displayName: 'Angle Apparent',
  },
  'environment.wind.angleTrue' : {
    displayName: 'Angle True',
  },
  'environment.wind.speedApparent' : {
    displayName: 'AWS',
  },
  'environment.wind.speedTrue' : {
    displayName: 'Speed True',
  },
  'environment.wind.directionMagnetic' : {
    displayName: 'Wind Dir Mag',
  },
  'environment.wind.directionTrue' : {
    displayName: 'TWD'
  }, // below for test only
  'SensESP.systemhz': {
    units: 'Hz',
    timeout: 2
  },
  'environment.inside.refrigerator.humidity': {
    timeout: 2
  },
  'environment.inside.refrigerator.temperature': {
    timeout: 2
  },
  'propulsion.mainEngine.coolantTemperature': {
    timeout: 2
  }
}

export default class SignalKSchemaData {
  constructor ({ host, port, tls }) {
    this.selfUrl = `http${tls ? 's' : ''}://${host}${port ? `:${port}` : ''}/signalk/v1/api/vessels/self/`
    this.metadataByPath = {}
    this.getSyncMetaForVesselPath = this.getSyncMetaForVesselPath.bind(this);
  }

  getMetaUrl (path) {
    return this.selfUrl + path.replace(/\./g, '/') + '/meta/'
  }

// return meta data directly from cache
  getSyncMetaForVesselPath (path) {
    if (typeof this.metadataByPath[path] === 'undefined') { // not in cache
      this.mergeMetaInCache({path: path, value: defaultMetadataByPath[path]}); // merge default in cache
    }
    return this.metadataByPath[path];
  }

// return promise with meta data from: cache if onlyFromCache === true else from fetching SK server
  getAsyncMetaForVesselPath (path, onlyFromCache) {
    if (typeof this.metadataByPath[path] === 'undefined') { // not in cache
      this.mergeMetaInCache({path: path, value: defaultMetadataByPath[path]}); // merge default in cache
    }
    if (onlyFromCache) {
      return Promise.resolve(this.metadataByPath[path]);
    }

    return new Promise((resolve, reject) => {
      fetch(this.getMetaUrl(path))
       .then(response => {
         if (response.status === 200) {
           response.json().then(meta => {
             this.mergeMetaInCache({path: path,value: meta})
             resolve(this.metadataByPath[path])
           })
         } else if (response.status === 404) {
             console.warn('No such meta for '+path)
             resolve(this.metadataByPath[path])
         } else {
           throw new Error('Error fetching metadata: ' + response.status)
         }
       }).catch(err => {
        reject(err)
       })
    })
  }

  mergeMetaInCache(pathMeta) {
    this.metadataByPath[pathMeta.path] = {...{}, ...this.metadataByPath[pathMeta.path], ...pathMeta.value};
    pathMeta.value = this.metadataByPath[pathMeta.path];
    return pathMeta;
  }
}
