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
