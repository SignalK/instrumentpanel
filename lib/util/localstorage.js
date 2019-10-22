/* window.localStorage layout design
Key=instrumentpanelLayouts
Value= {
  hostName: { // Host where connected
    layoutName: { // value of URL parameter ?layout=myLayout | referrer pathName | default
      pages: [
        {
          layout: [{...}, {...}], // layout from react-grid-layout
          widgets: [], // widgets options
          knownKeys: {} // empty and populated when running
        }
      ]
    }
  }
}

Key=instrumentpanelStartConnected
Value= true | false

Key=instrumentpanelPreferredUnits
Value= {
  srcUnit: dstUnit, /record present only if srcUnit != dstUnit
  ...
}
*/

export const defaultLayoutName = 'default'
export const old_layoutKeyName = 'signalkGrid3';
export const layoutsKeyName = 'instrumentpanelLayouts';
export const startConnectedKeyName = 'instrumentpanelStartConnected'
export const preferredUnitsKeyName = 'instrumentpanelPreferredUnits'

export function saveGrid(host, layoutName, data) {
  if ((typeof layoutName === 'undefined') || (layoutName === '')) {
    layoutName = defaultLayoutName;
  }
  var storedData = getStoredData(layoutsKeyName);
  if (typeof storedData[host] === 'undefined') { storedData[host] = {}; }
  storedData[host][layoutName] = data;
  try {
    window.localStorage.setItem(layoutsKeyName, JSON.stringify(storedData));
  } catch (ex) {
      console.error(ex)
    }
}

export function retrieveGrid(host, port, layoutName) {
  var storedLayout = getStoredData(layoutsKeyName)[host];
  if (typeof storedLayout === 'object') {
    storedLayout = (storedLayout[layoutName])?storedLayout[layoutName]:{};
  } else {
      // back to the old configuration if it exists
      storedLayout = getStoredData(old_layoutKeyName)[host + ':' + port];
    }
  return storedLayout;
}

export function retrieveStartConnected() {
  try {
    return (window.localStorage[startConnectedKeyName] === 'true')? true : false
        this.props.instrumentPanel.SignalkClient.get('hostname') + ':' +
        this.props.instrumentPanel.SignalkClient.get('port');
      window.localStorage['signalKHostConnected'] = true;
  } catch (ex) {
      console.error(ex);
      return false;
    }
}

export function saveStartConnected(value) {
  window.localStorage[startConnectedKeyName] = value;
}

export function retrievePreferredUnits() {
  try {
    const savedPreferredUnitsListJSON = window.localStorage.getItem(preferredUnitsKeyName);
    const savedPreferredUnitsList = savedPreferredUnitsListJSON && JSON.parse(savedPreferredUnitsListJSON);
    return savedPreferredUnitsList;
  } catch (ex) {
      console.error(ex);
      return null;
    }
}

export function savePreferredUnits(preferredUnits) {
  try {
    window.localStorage.setItem(preferredUnitsKeyName, JSON.stringify(preferredUnits));
  } catch (ex) {
      console.error(ex);
      window.localStorage.setItem(preferredUnitsKeyName, '{}');
    }
}

export function removeKeysByName(arrayKeys) {
  if (Array.isArray(arrayKeys)) {
    arrayKeys.forEach(function(keyToDelete) {
      window.localStorage.removeItem(keyToDelete);
    });
  }
}

function getStoredData(keyName) {
  var storedData = {};
  try {
    var fromLocal = window.localStorage[keyName];
    if (fromLocal) {
      storedData = JSON.parse(fromLocal);
    }
  } catch (ex) {
      console.error(ex);
    }
  return storedData;
}
