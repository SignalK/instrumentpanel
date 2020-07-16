/*
{
  "layouts": {
    "2020-04-03T19-40-58,421Z": { // date fill by device, dot replaced by comma
      "infos": {
        "screenSize": "600x800", // fill by device 
        "host": "barco.local", // fill by device 
        "name": "iPad settings" //fill by user
      },
      "instrumentpanelLayouts": {
        // same "instrumentpanelLayouts" as export to file
      }
    }
  },
  "instrumentpanelPreferredUnits": {
    "m/s": "kn",
    "m3/s": "l/h",
    "K": "C",
    ... // same "instrumentpanelPreferredUnits" as export to file
  }
}
*/

import Debug from 'debug'

const debug = Debug('instrumentpanel:server-storage')

import {
  layoutsKeyName,
  preferredUnitsKeyName
} from '../ui/settings/constants';

const configName = 'instrumentpanel'
const configVersion = '1.0'
const applicationDataUri = 'applicationData'

function buildUri(path, isUser) {
  return applicationDataUri + ((isUser)? '/user/' : '/global/') + configName + '/' + configVersion + path
}

export function retrieveLayoutsArray(SignalkClient, isUser, cb) {
  let currentUri = buildUri('/layouts?keys=true', isUser)
  SignalkClient.fetch(currentUri)
    .then(response => {
      debug("[retrieveLayoutsArray] response:" + response)
      cb(response, isUser);
    }).catch(err => {
      debug("[retrieveLayoutsArray] GET " + err)
      cb(null)
    })
}

export function retrieveLayoutsInfos(SignalkClient, isUser, date, cb) {
  let currentUri = buildUri('/layouts/' + date + '/infos', isUser)
  SignalkClient.fetch(currentUri)
    .then(infos => {
      debug("[retrieveLayoutsInfosArray] response OK for date:" + date)
      cb(date, infos, isUser);
    }).catch(err => {
      debug("[retrieveLayoutsInfosArray] GET " + err)
      cb(null)
    })
}

export function retrieveLayoutsData(SignalkClient, isUser, date, cb) {
  let currentUri = buildUri('/layouts/' + date + '/' + layoutsKeyName, isUser)
  SignalkClient.fetch(currentUri)
    .then(data => {
      debug("[retrieveLayoutsData] response OK for date:" + date)
      cb(date, data, isUser);
    }).catch(err => {
      debug("[retrieveLayoutsData] GET " + err)
      cb(null)
    })
}

export function storeHostLayouts(SignalkClient, isUser, date, hostLayouts, cb) {
  let currentUri = buildUri('/layouts/' + date.replace('.',','), isUser)
  let bodyContent = hostLayouts
  let opts = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyContent)
  }
  SignalkClient.fetch(currentUri, opts)
    .then(response => {
      debug("[storeHostLayouts] response OK")
      cb(true)
    }).catch(err => {
      debug("[storeHostLayouts] POST " + err)
      cb(false)
    })
}

export function deleteHostLayouts(SignalkClient, isUser, date, cb) {
  let currentUri = buildUri('', isUser)
  let deletePath = "/layouts/" + date
  let bodyContent = [{"op":"remove","path":deletePath}]
  let opts = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyContent)
  }
  SignalkClient.fetch(currentUri, opts)
    .then(response => {
      debug("[deleteHostLayouts] response OK")
      cb(true)
    }).catch(err => {
      debug("[deleteHostLayouts] POST " + err)
      cb(false)
    })
}

export function storePreferredUnits(SignalkClient, isUser, preferredUnits, cb) {
  let currentUri = buildUri('/' + preferredUnitsKeyName, isUser)
  let bodyContent = preferredUnits
  let opts = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyContent)
  }
  SignalkClient.fetch(currentUri, opts)
    .then(response => {
      debug("[storePreferredUnits] response OK")
      cb(true)
    }).catch(err => {
      debug("[storePreferredUnits] POST " + err)
      cb(false)
    })
}

export function retrievePreferredUnits(SignalkClient, isUser, cb) {
  let currentUri = buildUri('/' + preferredUnitsKeyName, isUser)
  SignalkClient.fetch(currentUri)
    .then(preferredUnits => {
      debug("[retrievePreferredUnits] response OK")
      cb(preferredUnits);
    }).catch(err => {
      debug("[retrievePreferredUnits] GET " + err)
      cb(null)
    })
}

export function isPreferredUnits(SignalkClient, isUser, cb) {
  let currentUri = buildUri('/' + preferredUnitsKeyName, isUser)
  SignalkClient.fetch(currentUri)
    .then(preferredUnits => {
      const isKey = (Object.keys(preferredUnits).length > 0);
      debug("[isPreferredUnits] keys for ", ((isUser)?"user":"global"), " is ", isKey)
      cb(isKey);
    }).catch(err => {
      debug("[isPreferredUnits] GET " + err)
      cb(false)
    })
}
