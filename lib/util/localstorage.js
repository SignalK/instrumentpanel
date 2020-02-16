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

Key=instrumentpanelColorScheme
Value= {
  colorSchemeSetBy: "mainbar" | "os" | "skpath",
  colorSchemeCurrent: "light" | "dark"
}

Key=instrumentpanelWidgetActiveMode
Value= "base data" | "all" | "no"
*/

import {
  defaultLayoutName,
  old_layoutKeyName,
  layoutsKeyName,
  startConnectedKeyName,
  preferredUnitsKeyName,
  colorSchemeKeyName,
  widgetActiveModeKeyName,
  CS_BY_MAINBAR,
  CS_BY_OS,
  CS_BY_SKPATH,
  CS_LIGHT,
  CS_DARK,
  WA_BASE_DATA,
  WA_ALL,
  WA_NO
} from '../ui/settings/constants';

const colorSchemeSetByValues = [CS_BY_MAINBAR, CS_BY_OS, CS_BY_SKPATH];
const colorSchemeCurrentValues = [CS_LIGHT, CS_DARK];
const widgetActiveModes = [WA_BASE_DATA, WA_ALL, WA_NO];

export function storeGrid(host, layoutName, data) {
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

export function storeStartConnected(value) {
  window.localStorage[startConnectedKeyName] = value;
}

export function retrievePreferredUnits() {
  try {
    const storedPreferredUnitsListJSON = window.localStorage.getItem(preferredUnitsKeyName);
    const storedPreferredUnitsList = storedPreferredUnitsListJSON && JSON.parse(storedPreferredUnitsListJSON);
    return storedPreferredUnitsList;
  } catch (ex) {
      console.error(ex);
      return null;
    }
}

export function storePreferredUnits(preferredUnits) {
  try {
    window.localStorage.setItem(preferredUnitsKeyName, JSON.stringify(preferredUnits));
  } catch (ex) {
      console.error(ex);
      window.localStorage.setItem(preferredUnitsKeyName, '{}');
    }
}

export function retrieveColorScheme() {
  try {
    const storedColorSchemeJSON = window.localStorage.getItem(colorSchemeKeyName) || '{}';
    var storedColorScheme = storedColorSchemeJSON && JSON.parse(storedColorSchemeJSON);
    if ((typeof storedColorScheme.colorSchemeSetBy === 'undefined') ||
      (! colorSchemeSetByValues.includes(storedColorScheme.colorSchemeSetBy))) {
        storedColorScheme['colorSchemeSetBy'] = CS_BY_MAINBAR;
    }
    if ((typeof storedColorScheme.colorSchemeCurrent === 'undefined') ||
      (! colorSchemeCurrentValues.includes(storedColorScheme.colorSchemeCurrent))) {
        storedColorScheme['colorSchemeCurrent'] = CS_LIGHT;
    }
    return storedColorScheme;

  } catch (ex) {
      console.error(ex);
      return ({
        colorSchemeSetBy: colorSchemeSetByMAINBAR,
        colorSchemeCurrent: colorSchemeLIGHT
      });
    }
}

export function storeColorScheme(value) {
  try {
    window.localStorage.setItem(colorSchemeKeyName, JSON.stringify(value));
  } catch (ex) {
      console.error(ex);
    }
}

export function retrieveWidgetActiveMode() {
  try {
    var storedWidgetActiveMode = window.localStorage[widgetActiveModeKeyName];
    if (widgetActiveModes.indexOf(storedWidgetActiveMode) >= 0) {
      return storedWidgetActiveMode;
    } else {
      storeWidgetActiveMode(WA_BASE_DATA);
      return WA_BASE_DATA;
    }
  } catch (ex) {
      console.error(ex);
      return WA_BASE_DATA;
    }
}

export function storeWidgetActiveMode(value) {
  try {
    if (widgetActiveModes.indexOf(value) >= 0) {
      window.localStorage[widgetActiveModeKeyName] = value;
    } else {
        window.localStorage[widgetActiveModeKeyName] = WA_BASE_DATA;
      }
  } catch (ex) {
      console.error(ex);
    }
}

export function removeKeysByName(arrayKeys) {
  if (Array.isArray(arrayKeys)) {
    arrayKeys.forEach(function(keyToDelete) {
      try {
        window.localStorage.removeItem(keyToDelete);
      } catch (ex) {
          console.error(ex);
        }
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
