export const old_layoutKeyName = 'signalkGrid3';
export const layoutsKeyName = 'instrumentpanelLayouts';
export const preferredUnitsKeyName = 'instrumentpanelPreferredUnits';
export const colorSchemeKeyName = 'instrumentpanelColorScheme';
export const widgetActiveModeKeyName = 'instrumentpanelWidgetActiveMode';
export const backupSettingsKeyName = 'instrumentpanelBackupSettings';
export const versionKeyName = 'instrumentpanelVersion';
export const tokenKeyName = 'instrumentpanelToken';
export const enPathSubscriptionKeyName = 'instrumentpanelEnPathSubscription';
export const notificationLevelNameAboveKeyName = 'instrumentpanelNotificationLevelAbove';
export const defaultLayoutName = 'default';
export const CS_BY_MAINBAR = "mainbar";
export const CS_BY_OS = "os";
export const CS_BY_SKPATH = "skpath";
export const CS_LIGHT = "light";
export const CS_DARK = "dark";
export const notificationPageId = -1;
export const WA_BASE_DATA = "base data";
export const WA_ALL = "all";
export const WA_NO = "no";
export const saveDisplayKey = "save";
export const loadDisplayKey = "load";
export const defaultNotificationLevelNameAbove = "alert"
export const colorsToHTML = {
  none: null,
  green: '#008000',
  blue: '#0000FF',
  yellow: '#FFFF00',
  red: '#FF0000',
  orange: '#FF8C00',
  purple: '#FF00F7',
  black: '#000000'
};
export const defaultStatesColor = {
  nominal: 'green',
  normal: 'none',
  alert: 'yellow',
  warn: 'orange',
  alarm: 'red',
  emergency: 'purple'
};
export const defaultNotificationColors = {
  0: "#C0C0C0", //nominal
  1: "#C0C0C0", //normal
  2: "#FFFF00", //alert
  3: "#FF8000", //warn
  4: "#FF4000", //alarm
  5: "#FF00F7" //emergency
};
export const notificationLevels = {
  "nominal": 0,
  "normal": 1,
  "alert": 2,
  "warn": 3,
  "alarm": 4,
  "emergency": 5
};
export function notificationLevelToText(level) {
  for (var levelName in notificationLevels) {
    if (notificationLevels[levelName] === level) {
      return levelName
    }
  }
  return 'unknown'
}
export const reactGridLayoutReduceWidth = 20
export const gridBreakpoints = { xss: 0, xs: 400, sm: 560, md: 720, lg: 880, xl: 1040, xxl: 1200, xxxl: 1360, x4l: 1520, x5l: 1680, x6l: 1840, x7l: 2000, x8l: 2160, x9l: 2320, x10l: 4820 }
export const gridBreakpointsUnlock = {}
export const gridCols = { xss: 2, xs: 3, sm: 4, md: 5, lg: 6, xl: 7, xxl: 8, xxxl: 9, x4l: 10, x5l: 11, x6l: 12, x7l: 13, x8l: 14, x9l: 15, x10l: 16 }
Object.entries(gridBreakpoints).forEach(([key, value]) => { gridBreakpointsUnlock[key] = (value > reactGridLayoutReduceWidth) ? value - reactGridLayoutReduceWidth : value })
