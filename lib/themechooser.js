import Bacon from 'baconjs';
import BaconModel from 'bacon.model';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

function ThemeChooser() {
  this.lightTheme = getMuiTheme();
  this.darkTheme = getMuiTheme(darkBaseTheme);
  this.themeModel = new Bacon.Model();
  this.setLightTheme();
}

ThemeChooser.prototype.getCurrentThemeModel = function() {
  return this.themeModel;
}

ThemeChooser.prototype.getCurrentTheme = function() {
  return this.themeModel.get();
}

ThemeChooser.prototype.setDarkTheme = function() {
  let b = document.getElementsByTagName('body')[0];
  b.style.background = this.darkTheme.palette.canvasColor;
  this.themeModel.set(this.darkTheme);
  this.isLight = false;
  this.label = 'Day Mode';
}

ThemeChooser.prototype.setLightTheme = function() {
  let b = document.getElementsByTagName('body')[0];
  b.style.background = this.lightTheme.palette.canvasColor;
  this.themeModel.set(this.lightTheme);
  this.isLight = true;
  this.label = 'Night Mode';
}

ThemeChooser.prototype.toggleTheme = function() {
  if(this.isLight) {
    this.setDarkTheme();
  } else {
    this.setLightTheme();
  }
}

module.exports = ThemeChooser;
