import {defaultLayoutName} from '../ui/settings/constants'

const referrerListAsDefaultLayout = [
  '',
  '/',
  '/admin/'
]

export function getUrlParameter(parameterName) {
  try {
    const parameterValue = new URL(window.location.href).searchParams.get(parameterName);
    if (parameterValue)
      return decodeURIComponent(parameterValue);
  } catch(error) {
      console.log('getUrlParameter(', parameterName, ') error:', error.message);
      return null;
    }
}

export function reloadWithLayout(layoutName) {
  var currentLocation = new URL(window.location.href);
  if (typeof layoutName !== 'undefined') {
    currentLocation.searchParams.set('layout', layoutName);
  } else {
      currentLocation.searchParams.delete('layout');
    }
  currentLocation.searchParams.delete('reset');
  currentLocation.hash = '';
  window.location.assign(currentLocation.href);
}

export function getLayoutName() {
  const urlLayout = getUrlParameter("layout");
  var layoutName = defaultLayoutName;
  if (urlLayout) {
    layoutName = urlLayout;
  } else { // check if referrer
    var referrerPath = '';
    try {
      const urlReferrer = new URL(document.referrer);
      referrerPath = encodeURI(urlReferrer.pathname);
    } catch(error) {
        console.log('referrer path value[', document.referrer, '] error:', error.message)
        referrerPath = '';
      }
    if (! referrerListAsDefaultLayout.includes(referrerPath))
      layoutName = referrerPath;
  }
  return layoutName;
}
