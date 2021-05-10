<style
  type="text/css">
  img[src*="#maxwidth"] {
    max-width: 100%;
  }
  .help {
    width: 100%;
    margin: 2px;
    padding: 5px;
    border-width: 1px;
    border-radius: 5px;
    border-color: var(--border-color);
    border-style: solid;
    max-width: 600px
  }
  .help hr {
    border-color: var(--border-color);
    margin-top: 0px;
  }
  .help blockquote {
    border-left: none;
  }
  ul {
    margin-left: 20px;
    padding-left: 0;
  }
  ul ul {
    margin-left: 10px;
    padding-left: 0;
  }
</style>
#### Help and Instructions
___
+ [0. Introduction](#0)  
+ [1. Connect to your Signal K Server](#1)  
+ [2. Top Bar Buttons](#2)  
    - [2.1. Change Page](#2_1)  
        - [2.1.1. Alarms Page](#2_1_1)  
    - [2.2. Layout](#2_2)  
        - [2.2.1. Modify Layout](#2_2_1)  
        - [2.2.2. Moving and Resizing Widgets](#2_2_2)  
        - [2.2.3. Notes for iOS users](#2_2_3)  
    - [2.3. Settings](#2_3)  
        - [2.3.1. Customise Display screen](#2_3_1)  
            - [2.3.1.1 Rule for displaying new widget](#2_3_1_1)  
            - [2.3.1.2 Hide or Show widget](#2_3_1_2)  
            - [2.3.1.3 Delete widget](#2_3_1_3)  
            - [2.3.1.4 Unit selection](#2_3_1_4)  
            - [2.3.1.5 Widget Specific Settings](#2_3_1_5)  
                - [2.3.1.5.1 Universal Widget](#2_3_1_5_1)  
                - [2.3.1.5.2 Compass Widget](#2_3_1_5_2)  
                - [2.3.1.5.3 Windmeter Widget](#2_3_1_5_3)  
                - [2.3.1.5.4 Digital DateTime Widget](#2_3_1_5_4)  
            - [2.3.1.6 Widget managed paths](#2_3_1_6)  
            - [2.3.1.7 Alarms Settings](#2_3_1_7)  
            - [2.3.1.8 Add or Delete Pages](#2_3_1_8)  
        - [2.3.2. Preferred Units screen](#2_3_2)  
        - [2.3.3. Dark Mode Screen](#2_3_3)  
        - [2.3.4. Reset settings screen](#2_3_4)  
        - [2.3.5. Save settings screen](#2_3_5)  
        - [2.3.6. Load settings screen](#2_3_6)  
+ [3. Options Available on the Widgets](#3)  
    - [3.1. Widget in full screen](#3_1)  
    - [3.2. Changing Display Mode](#3_2)  
    - [3.3. Wind Widget Modes](#3_3)  
    - [3.4. Digital Position Modes](#3_4)  
    - [3.5. Display SourceID](#3_5)  
    - [3.6. Timeout indicator on path](#3_6)  
+ [4. Full Screen mode & App mode](#4)  
    - [4.1. Full Screen mode](#4_1)  
    - [4.2. App mode](#4_2)  
        - [4.2.1. On iPad or iPhone](#4_2_1)  
        - [4.2.2. On Android](#4_2_2)  
+ [5. Advanced options](#5)  
+ [6. Trouble?](#6)  
  
<a id="0"></a>
**0. Introduction** [Back to main menu](#content)  
___
**Signal K InstrumentPanel** is implemented as a grid with draggable &amp; resizable cells.  
Each cell also called widget is in charge of displaying the value(s) of a Signal K path.  
When a new path is discovered, a new dedicated widget is created and attached to this path. It automatically becomes visible or not on the grid according to a configurable rule.  
For some data, like wind, there is a composite gauge that displays several items in the same time widget.  
The cells are grouped into three columns:
- navigation
- environment
- everything else (electrical, propulsion etc)
  
>
>![demo](./help/main-page.png#maxwidth)  
>
<a id="0_help"></a>
When the help page is displayed all buttons are disabled.  
You must close the help page by clicking on the ![help-on](./help/help-on-icon.png)
 button to reactivate them.  
  
<a id="1"></a>
**1. Connect to your Signal K Server** [Back to main menu](#content)  
___
The Signal K server address is directly derived from your web page and InstrumentPanel automatically connects to the server.  
>
>![connect](./help/connecting.png#maxwidth)  
>
  
If the _Reconnecting_ reappears, it means that the connection
 to the Signal K server is broken and that InstrumentPanel
 is trying to reconnect automatically.  
  
For advanced users, you can manually specify the address and
 the protocol to connect to your Signal K server
 (See: [Advanced options](#5)).  
  
<a id="2"></a>
**2. Top Bar Buttons** [Back to main menu](#content)  
___
After connecting an initial first page is auto generated with all paths known in your SignalK Server.
Signal K data items are displayed in different cells with dedicated widgets depending on their types.
Widgets are arranged on a virtual grid with vertical compaction.  
**Units** on widgets are set to default and fetched from the server metadata.  
>
>![main-page](./help/main-page-default.png#maxwidth)  
>
  
- ![lock](./help/button-lock.png) button: Click to unlock your layout  
 Organize your widget placement as you want.  
(See: [Moving and Resizing Widgets](#2_2_1))  
- ![settings](./help/settings-icon.png) button: Click to switch to settings.  
(See: [Settings](#2_3))  
- ![multi-page](./help/multi-page.png#maxwidth) buttons: 
To switch pages, just click on the page number.  
(See:[Change Page](#2_1))  
- ![button-notif-warn](./help/button-notif-warn.png#maxwidth) buttons: 
Click on it to see a list of your current alarms. 
 The bell can have different colors depending on the current alert level (Emergency, Alarm, Warning, etc...).  
(See:[Alarm Page](#2_1_1))  
- ![help](./help/help-icon.png) button: Cick to display the help page.  
(See: [notes](#0_help))  
- ![dark mode day](./help/darkmode-day-icon.png) ![dark mode night](./help/darkmode-night-icon.png) button: Cick to activate /desactivate dark mode.  
(See: [dark mode](#2_3_3))  
- ![heart](./help/heartbeat-icon.png) icon: It's data indicator icon.  
When data is received it blinks every second.
 If the indicator is not blinking, either your connection is broken
 or the server is not sending any data and values displayed in your widgets may be obsolete.  
- ![fullscreen](./help/fullscreen-icon.png) buttons: Click to switch to full screen mode.
 This feature is not available on all devices.(See:[Full Screen mode ...](#4)).  
  
After 15 seconds without user activity, the menu will automatically hide to free up space on the screen.  
A small heart and a bell (when you have active notifications) are displayed at the top right of the screen.  
>
>![menu-hidden](./help/menu-hidden.png#maxwidth)  
>
To make the menu reappear click on the center of the Instrumentpanel screen.  
  
If you want the menu to disappear before the 15 seconds, depending on the size of your screen, click in the green zone:  
>![hide-menu-zone_1](./help/hide-menu-zone_1.png#maxwidth)  
>![hide-menu-zone_2](./help/hide-menu-zone_2.png#maxwidth)  
  
The colored dot at the top right indicates the timeout status on the path handle by the widget (See:[Timeout indicator on path ...](#3_6)) .  
>![widget-timeout](./help/widget-timeout.png#maxwidth)  
  
<a id="2_1"></a>
**2.1. Change Page** [Back to up menu](#2)  
___
>
>![multi-page](./help/multi-page.png#maxwidth)  
>
You can have up to 10 pages, each with a separate selection, configuration and layout of widgets.  
To switch pages, just click on the page number or doing a horizontal swipe on the screen.  
To create a new page, see:[Add or Delete Pages](#2_3_1_8).  
  
<a id="2_1_1"></a>
**2.1.1. Alarms Page** [Back to up menu](#2_1)  
___
By clicking on the ![button-notif-warn](./help/button-notif-warn.png) button,
 you display the list of current alarms. They are sorted by alarm level and
 date when available (Emergency, Alarm, Warn, Alert, Normal, Nominal).  
When you stay on the page, the alarms are no longer sorted.  
To sort again, click the ![button-notif-warn](./help/button-notif-warn.png) button again.  
When the alarm level is higher than **Nominal** the border of all widgets takes the color of the highest alarm.
>
>![main-page-alarm](./help/main-page-alarm.png#maxwidth)  
>
Color code by alarm level:
- ![button-notif-nominal](./help/button-notif-nominal.png): Nominal alarm level.  
- ![button-notif-nominal](./help/button-notif-nominal.png): Normal alarm level.  
- ![button-notif-alert](./help/button-notif-alert.png): Alert alarm level.  
- ![button-notif-warn](./help/button-notif-warn.png): Warning alarm level.  
- ![button-notif-alarm](./help/button-notif-alarm.png): Alarm alarm level.  
- ![button-notif-emergency](./help/button-notif-emergency.png): Emergency alarm level.  
  
You can hide some alarms in the settings page.
 In this case, the alarm button can also display a second information.
 The color of the dotted border of the ![button-notif-nominal-mixed](./help/button-notif-nominal-mixed.png) indicates that there are hidden alarms
 and the maximum level of hidden alarms.  
(See: [Alarms Settings](#2_3_1_7)  
  
<a id="2_2"></a>
**2.2. Layout** [Back to up menu](#2)  
___
InstrumentPanel supports several layouts. The choice of layout is selected according to 3 criteria in the following order:  
- By adding the following query parameter **?layout=myLayoutName** to the url.  
- By the source that opened InstrumentPanel (http referrer). 
e.g. if you open InstrumentPanel embedded in freeboard-sk, the layout name will be **/@signalk/freeboard-sk/**.  
- If no parameters are specified, the layout name will be **default**.  
  
You can view the name of the layout by switching to [Settings](#2_3) mode 
![settings](./help/settings-icon.png)  
in the **Widget** settings screen.  
  
>
>![layout-name](./help/layout-name.png#maxwidth)  
>
  
In the example above an layout dedicated to freeboard-sk has been automatically selected.  
  
<a id="2_2_1"></a>
**2.2.1. Modify Layout** [Back to up menu](#2_2)  
___
Use the ![lock](./help/button-lock.png) button on the main bar to unlock the layout. 
When the layout is unlocked, widget background changes to yellow and features are hidden.  
>
>![widget-unlock](./help/widget-gold.png#maxwidth)  
>
To return to normal mode and to lock & save the layout,
 click on the ![unlock](./help/button-unlock.png) button.  
  
<a id="2_2_2"></a>
**2.2.2. Moving and Resizing Widgets** [Back to up menu](#2_2)  
___
On a unlocked layout:  
- **resize** a widget by dragging the anchor located at the bottom right.  
>
>![resize](./help/widget-resize.png#maxwidth)  
>
  
- **Move** a widget by dragging.  
>
>![drag](./help/widget-drag.png#maxwidth)  
>
The layout adjusts automatically to changes, compacting the widgets vertically.
  
<a id="2_2_3"></a>
**2.2.3. Notes for iOS users** [Back to up menu](#2_2)  
___
On an unlocked grid, to drag or to resize a widget,
 first click once or twice in the center of the widget
 to bring focus to it and then you can drag or resize the widget with the screen's scroll locked.  
If you don't click first in the center of the widget,
 the page starts scrolling before you can drag or resize the widget.  
  
<a id="2_3"></a>
**2.3. Settings** [Back to up menu](#2)  
___
Use the ![settings](./help/settings-icon.png) button to switch to settings.  
In settings mode, at the top left, you will find a dropdown-list, click on the arrow to list the choices :
>
>![settings-dropdown-list](./help/settings-dropdown-list.png#maxwidth)  
>
- The ["Customise Display"](#2_3_1) entry allows you to change how the values will be displayed on the grid and tunning their individual settings. This page display all widgets, hidden or shown.  
- The ["Preferred Units"](#2_3_2) entry allows you to set the unit values applied to widgets when they are created.  
- The ["Dark Mode"](#2_3_3) entry allows you to change how the dark mode will be activated.  
- The ["Save settings"](#2_3_5) entry allows you to save your settings on the server or in a json file.  
- The ["Load settings"](#2_3_6) entry allows you to load saved settings from the server or a json file.  
- The ["Reset settings"](#2_3_4) entry allows you to clear settings stored in local storage browser.  
  
In setting mode, use the ![view](./help/view-icon.png) button to return to the main view.  
  
<a id="2_3_1"></a>
**2.3.1. Customise Display screen** [Back to up menu](#2_3)  
___
In this settings page, to access widget's parameters, click on 'edit'.  
You can set:
- ["Rules for new widgets"](#2_3_1_1) who validating the display on your grid of new the widgets created when a new path is discovered.  
- ["Hide or show"](#2_3_1_2) parameter individually or all your widgets on your grid.  
- ["Delete widget"](#2_3_1_3) linked to a Signal K path that no longer exists.  
- ["Unit selection"](#2_3_1_4) of the displayed value.  
- ["Widget Specific Settings"](#2_3_1_5) some widgets have specific parameters.  
- ["Widget managed paths"](#2_3_1_6) to discover the list of paths managed by this widget type.  
- ["Alarms Settings"](#2_3_1_7) to hide or show discovered alarms / notifications.  
- ["Add or Delete Pages"](#2_3_1_8) To manage multiple grid pages.  
  
<a id="2_3_1_1"></a>
**2.3.1.1. Rule for displaying new widget** [Back to up menu](#2_3_1)  
___
![newPaths](./help/settings-newPaths.png#maxwidth)  
With this setting you can select if a new widget created will be shown or not on your grid.  
three choices are available:  
- **Base paths shown**, automatically shows on the grid a limited list of paths, this is the default value and help to not overhead your first grid with a lot of unusefull widgets.  
  The list of paths is :  
  environment.wind.angleApparent  
  environment.wind.angleTrueGround  
  environment.wind.angleTrueWater  
  environment.wind.speedApparent  
  environment.wind.speedOverGround  
  environment.wind.speedTrue  
  navigation.position  
  navigation.courseOverGroundTrue  
  navigation.courseOverGroundMagnetic  
  navigation.headingMagnetic  
  navigation.headingTrue  
  environment.depth  
  navigation.datetime  
- **Shown**, all new widget are shown on the grid.  
- **Hidden**, all new widget are hidden on the grid.  
  
<a id="2_3_1_2"></a>
**2.3.1.2. Hide or Show widget:** [Back to up menu](#2_3_1)  
___
A common option for all widgets is the **Shown on grid** option  
>
>![visible](./help/widget-settings-visible.png#maxwidth)  
>
Unselect/Select checkbox to hide/show the widget on the page.  
- ![button-hideAll](./help/button-hideAll.png) button: Hides all widgets on the current page in one operation.  
- ![button-ShowAll](./help/button-ShowAll.png) button: Shows all widgets on the current page in one operation.  
  
<a id="2_3_1_3"></a>
**2.3.1.3. Delete widget** [Back to up menu](#2_3_1)  
___
By checking **Delete** you delete an existing widget associated with a Signal K path and source.  
In order to delete a widget, it must first not be **Displayed on the grid**.  
If you delete a widget that is associated to a Signal K path still present in your server, it will be automatically recreated when reloading Instrumentpanel. 
>
>![delete](./help/widget-delete.png#maxwidth)  
>
- ![button-deleteAll](./help/button-deleteAll.png) button: Deletes all widgets whose "show on grid" checkbox is not checked.  
  
<a id="2_3_1_4"></a>
**2.3.1.4. Unit selection** [Back to up menu](#2_3_1)  
___
Most widgets have a unit selection.  
Select your preferred unit from the listbox.  
>
>![unit](./help/widget-settingUnit.png#maxwidth)  
>
To make the unit change active, InstrumentPanel must be reloaded. This will be done automatically when you leave settings screens.  
You will be informed by a message at the top of the screen.  
  
<a id="2_3_1_5"></a>
**2.3.1.5. Widget Specific Settings** [Back to up menu](#2_3_1)  
___
Each widget type has specific settings.  
  
<a id="2_3_1_5_1"></a>
**2.3.1.5.1. Universal Widget** [Back to up menu](#2_3_1_5)  
___
This widget has alternative digital and analog views.  
>
>![universal-digital](./help/widget-settings-digital.png#maxwidth)  
>
The analog view can display colored zones for value ranges.  
The ranges can be based on local settings in or zones fetched from the server.  
  
Local settings are configured in InstrumentPanel settings and stored in the browser.  
The configuration is limited: a single red zone from redline value to maximum value and you can set the minimum value for the gauge.  
> 
>![universal-analog-local](./help/widget-settings-analog-local.png#maxwidth)  
>
On the server the zones are configured by modifying the **defaults.json** file in you the server settings directory.  
You can configure multiple zones, each associated with a state that has its own color.  
Only colors are configured in InstrumentPanel.  
Changes there take effect after server restart.  
>
>![universal-analog-server](./help/widget-settings-analog-server.png#maxwidth)  
> 
**batteries 1** sample **defaults.json**:
  
```
"vessels": { //<= this key already exist do not insert
 "self": { //<= this key already exist do not insert
  "electrical": { //<= if this key exists, insert the following key below it
   "batteries": { //<= if this key exists, insert the following key below it
    "1": { //<= if this key exists, insert the following key below it
     "voltage": { //<= if this key exists, insert the following key below it
      "meta": {
       "displayName": "battery 1",
       "zones": [
        {"upper": 11.8, "state": "alarm"},
        {"upper": 12, "lower": 11.8, "state": "warn"},
        {"upper": 14.6, "lower": 12, "state": "nominal"},
        {"lower": 14.6, "state": "alarm"}
       ],
       "displayScale": {
        "lower": 11.5,
        "upper": 15.5
       }
      }
     }
    }
   }
  }
 }
}
```
**Make sure the content is valid JSON**.  
Using an editor that validates the format is a great help !  
  
For more information on zones see [the Signal K Specification](https://signalk.org/specification/1.5.0/doc/data_model_metadata.html#metadata-for-a-data-value)  
and [Server FAQ](https://github.com/SignalK/signalk-server/wiki/FAQ:-Frequently-Asked-Questions#how-to-add-missing-units-in-instrumentpanel)  
  
<a id="2_3_1_5_2"></a>
**2.3.1.5.2. Compass Widget** [Back to up menu](#2_3_1_5)  
___
This widget has 3 displays view possible (rose/reading/digital).  
Choose your preferred view by selecting the radio button.  
- **Rose view**  
![compass-rose](./help/widget-settings-compass-rose.png#maxwidth)  
- **Reading view**  
![compass-reading](./help/widget-settings-compass-reading.png#maxwidth)  
- **Digital view**  
![compass-digital](./help/widget-settings-compass-digital.png#maxwidth)  
  
<a id="2_3_1_5_3"></a>
**2.3.1.5.3. Windmeter Widget:** [Back to up menu](#2_3_1_5)  
___
This widget has only the unit selection.  
Apparent Wind, True Wind over Ground and True Wind through Water values are automatically bound on widget.  
>
>![settings-windmeter](./help/widget-settings-windmeter.png#maxwidth)  
>
  
<a id="2_3_1_5_4"></a>
**2.3.1.5.4. Digital DateTime Widget:** [Back to up menu](#2_3_1_5)  
___
This widget has only a timezone selection.  
In timezone list, **DST** means Daylight Saving Time and displays time automatically in the timezone
 set on the device running your browser.  
>
>![settings-digitaldatetime](./help/widget-settings-digitaldatetime.png#maxwidth)  
>
  
<a id="2_3_1_6"></a>
**2.3.1.6. Widget managed paths:** [Back to up menu](#2_3_1)  
___
A widget type (compass in screenshot) can handle multiple paths.  
![widget-settings-pathsList](./help/widget-settings-pathsList.png)
  
You can discover the list of these paths by clicking on the **[+]** sign.
  
![widget-settings-pathsList-expand](./help/widget-settings-pathsList-expand.png)
  
In bold, are displayed the paths that are managed by this cell.  
For each path listed, a new cell will be created with this widget type only if the path exists on your Signal K server.  
Clic on the list to return to the default vue.  
  
<a id="2_3_1_7"></a>
**2.3.1.7. Alarms Settings:** [Back to up menu](#2_3_1)  
___
In setting mode, on the ![button-notif-warn](./help/button-notif-warn.png) page
 you can hide alarms from the main view by unchecking the **Show on grid** option.
 The ![button-notif-nominal-mixed](./help/button-notif-nominal-mixed.png) button
 reminds you that alarms are hidden by a dotted border around the bell.  
The color code for dotted lines is the same as for non-hidden alarms.
 The color indicates the highest value of hidden alarms.  
The alarm settings are not saved when you exit the GUI.  
  
<a id="2_3_1_8"></a>
**2.3.1.8. Add or Delete Pages** [Back to up menu](#2_3_1)  
___
You can have up to 10 pages with a specific widget organization.  
>
>![multi-page](./help/add-page-before.png#maxwidth)  
>
To create a new page, click on ![button-plus](./help/button-plus.png) button.  
The new page is automatically selected.  
>
>![add-page-after](./help/add-page-after.png#maxwidth)  
>
To delete a page, activate the page by clicking on the page number and
 then on the ![button-delCurrent](./help/button-delCurrent.png) button.  
  
<a id="2_3_2"></a>
**2.3.2. Preferred Units screen** [Back to up menu](#2_3)  
___
In this screen, you choose which default units will be displayed on your widgets.
 In 90% of cases the default values you choose here will correspond to your display habit.  
For widgets on which the default units are not suitable,
 you can change them individually on each widget in the **Widget** settings screen.  
The application on widgets of the default units is done at the time of widget creation.
 If your grid is already made up with widgets,
 you can use the button ![button-apply-preferred-units](./help/button-apply-preferred-units.png)
 at the top right to apply the default units
 to your already created widgets.  
Use the ![button-reset-preferred-units](./help/button-reset-preferred-units.png) button
 at the top right to reset the default units to their initial values.  
>
>![screen-preferred-units](./help/screen-preferred-units.png#maxwidth)  
>
  
<a id="2_3_3"></a>
**2.3.3. Dark Mode Screen** [Back to up menu](#2_3)  
___
In this screen, you can select how the dark mode will be activated:.  
You have 3 choices available :  
>
>![dark-mode-settings](./help/dark-mode-settings.png#maxwidth)  
>
- In **By main bar icon**, the dark mode is set by icon in main bar.  
- In **By OS settings**, the dark mode follows your OS settings. This option need a page reload to be active.  
- In **By Signal K Mode**, the dark mode follows the value of Signal K path: **/vessels/self/environment/mode**  
  
Display in dark mode:  
>
>![main-page-dark](./help/main-page-default-dark.png#maxwidth)  
>
  
<a id="2_3_4"></a>
**2.3.4. Reset settings screen** [Back to up menu](#2_3)  
___
In this screen, you can clear settings stored in local storage browser.  
This settings are :  
- Layouts: Delete all layouts.
- Previous layout: Clean previous layouts, if a layout existed in version 0.12.0 and earlier, it is used as a template to build the default layout.
- Start connected: Reset the automatic connection at startup.
- Preferred units: Delete all preferred units.
- Dark Mode: Delete dark mode settings.
- Backup settings: Delete the settings backup and remove top message about imported configuration.
>
>![reset-settings](./help/reset-settings.png#maxwidth)  
>
Select at least one checkbox and click on reset button.  
The page will reload and the selected parameters will be erased.  
  
<a id="2_3_5"></a>
**2.3.5. Save settings screen** [Back to up menu](#2_3)  
___
In this screen, you can save your settings on the server or in a json file.  
>
>![settings-save](./help/settings-save.png#maxwidth)  
>
Save on the server is only available on the Signal K server version > **1.27.0**  
The content of this screen follows the access level of the user who is logged in:  
- Everyone (logged in or not): You can save to a json file.
- User not logged in or with **Read Only** access: You can save only to json file. A message prompts you to connect in order to be able to save on the server.
- User logged in with **Read Write** access: You can save to the server but the save only readable by your account.
- User logged in with **Admin** access: You can save to the server for global settings readable for all users or by only your account.
  
The ![button-settings-savelayout](./help/button-settings-savelayout.png) button save all your page layouts on the server.  
The ![button-settings-saveprefunit](./help/button-settings-saveprefunit.png) button save your preferred units on the server.
If you are logged in with **Admin** access and you select **save for global settings** these preferred units will be loaded on new devices by default.  
The ![button-settings-saveptofile](./help/button-settings-savetofile.png) button make a backup of all your Instrumentpanel configuration.
  
<a id="2_3_6"></a>
**2.3.6 Load settings screen** [Back to up menu](#2_3)  
___
In this screen, you can load your previously saved settings from the server or from a json file.  
>
>![settings-load](./help/settings-load.png#maxwidth)  
>
Load from the server is only available on the Signal K server version > **1.27.0**  
As in the previous save screen, the screen content follows the access level of the user who is logged in:  
- Everyone (logged in or not): You can load a json file.
- User not logged in or with **Read Only** access: You can load a json file, load layouts and preferred units.
- User logged in with **Read Write** access: Same as **Read Only** access with the addition that you can delete your personal layouts.
- User logged in with **Admin** access: Same as **Read Write** access with the addition that you can delete global layouts.
  
After loading a layout, Instrumentpanel restarts with a warning screen at the top of the page  
>
>![warning-imported-config](./help/warning-imported-config.png#maxwidth)  
>
Click on ![button-enable-green](./help/button-enable-green.png) button to definitively validate your imported configuration.  
This action will remove the warning message at the top of the page.  
Make sure everything is working properly before **enable**  
  
Click on ![button-restore-orange](./help/button-restore-orange.png) button if something doesn't work, you can reload your old configuration  
  
Click on ![button-reset-red.png](./help/button-reset-red.png) to load the [reset screen](#2_3_4), it will allow you to erase parameters and return to a healthy configuration.  
  
<a id="3"></a>
**3. Options Available on the Widgets** [Back to main menu](#content)  
___
  
<a id="3_1"></a>
**3.1. Widget in full screen** [Back to up menu](#3)  
___
- you can display a widget in full screen by clicking in the center of the widget.  
- To return to normal view, click anywhere on the widget.  
  
<a id="3_2"></a>
**3.2. Changing Display Mode** [Back to up menu](#3)  
___
Some widgets have the ability to change their display mode directly.  
They are identified by a ![clickme-icon](./help/clickme-icon.png) icon in the top left corner.  
Click on this icon to change the display mode.  
New display mode is automatically saved.  
  
<a id="3_3"></a>
**3.3. Wind Widget Modes** [Back to up menu](#3)  
___
The wind widget displays by default apparent wind.  
>
>![widget-windmeter](./help/widget-windmeter.png#maxwidth)  
>
This widget can also display True Wind over Ground and True Wind through Water,
 if your Signal K server provides them. You can change the mode by clicking
 on the ![clickme-icon](./help/clickme-icon.png) icon inside the widget.  
If there is no data, an alert message is raised when you try to display these values.  
>
>![windmeter-alert](./help/widget-windmeter-alert.png#maxwidth)  
>
You can have your server automatically calculate these values with the **Derived Data** plugin available in Signal K server AppStore:  
>
>![DerivedData-appStore](./help/plugin-DerivedData-appStore.png#maxwidth)  
>
Install the plugin and restart your Signal K server.  
Then locate the pluging in the **Server/Plugin Config**:  
>
>![skServer-PluginConfig](./help/skServer-PluginConfig.png#maxwidth)  
>
Activate the plugin:  
>
>![DerivedData-active](./help/plugin-DerivedData-active.png#maxwidth)  
>
Enable the options for True Wind over Ground and True Wind through Water:  
>
>![DerivedData-options](./help/plugin-DerivedData-options.png#maxwidth)  
>
And then click on the ![DerivedData-submit](./help/plugin-DerivedData-submit.png) button to save and activate these options.  
  
<a id="3_4"></a>
**3.4. Digital Position Modes** [Back to up menu](#3)  
___
The Digital Position Widget can display your position in different formats:  
- Dir D.ddddd° (N 38.99177°)  
- Dir +/-D.ddddd° (N +38.99177°)  
- Dir D°M'S''ddd (N 38°59'30"357)  
- DDirM'S''ddd (38N59'30"357)  
  
You can change the display format by clicking on the ![clickme-icon](./help/clickme-icon.png) icon.  
The first click, displays the display format then the others clicks change the display format.  
You have 5 seconds to repeat your clicks, after that the widget automatically displays its original label.  
  
<a id="3_5"></a>
**3.5. Display SourceID** [Back to up menu](#3)  
___
To display the source Id of a widget's data stream,
 click on to the top right corner of widget.  
>
>![sourceID-hidden](./help/widget-sourceID-hidden.png#maxwidth)  
>
To hide the source Id, just click in the displayed source Id field.  
>
>![sourceID-visible](./help/widget-sourceID-visible.png#maxwidth)  
>
  
<a id="3_6"></a>
**3.6. Timeout indicator on path** [Back to up menu](#3)  
___
The colored dot at the top right indicates the timeout status on the path handle by the widget.  
>
>![widget-timeout](./help/widget-timeout.png#maxwidth)  
>
The timeout value is retrieved in the metadata of the path.  
If your server does not provide this timeout key, you can set it in its configuration file **~/.signalk/baseDeltas.json** .  
Some help on the **baseDeltas.json** file can be found here: [how-to-add-missing-units-and-static-data](https://github.com/SignalK/signalk-server/wiki/FAQ:-Frequently-Asked-Questions#how-to-add-missing-units-and-static-data)  
Every **10 seconds**, InstrumentPanel checks if the received data conform to this timeout value.  
When launching InstrumentPanel, you have to wait at least these 10 seconds to get a correct state.  
After these 10 seconds, the icon indicating the timeout status can take one of the values below:  
  
- ![widget-timeout](./help/LedEmpty.png) This widget has never received any data, it is probably a widget registered in your layout but whose path is no longer available in your server  
- ![widget-timeout](./help/LedBlue.png) This widget does not handle timeout, this indicates that the timeout key is not available in the metadata of this path  
- ![widget-timeout](./help/LedGreen.png) This widget handles timeout, a timeout key is available in the path meta data and the last value received is more recent than the specified timeout  
- ![widget-timeout](./help/LedRed.png) This widget manages the timeout, a timeout key is present in the path meta data and the last value received is at least less recent than the specified timeout. You can consider the displayed values as outdated or wrong  
  
When the navigation bar disappears, only the useful information remains in the widget: ![widget-timeout](./help/LedEmpty.png) & ![widget-timeout](./help/LedRed.png).  
  
<a id="4"></a>
**4. Full Screen mode & App mode** [Back to main menu](#content)  
___
You can switch to full screen mode to make the URL bar disappear and save display space.  
  
<a id="4_1"></a>
**4.1 Full Screen mode** [Back to up menu](#4)  
___
Click on the ![fullscreen](./help/fullscreen-icon.png) buttons in the main bar to switch to full screen mode.
 This feature is not available on all devices (not works on all IOS devices, see:[App mode ...](#4_2)).  
  
<a id="4_2"></a>
**4.2 App mode** [Back to up menu](#4)  
___
You can **add to Home Screen** InstrumentPanel on most mobile devices to use it as a mobile app.  
  
<a id="4_2_1"></a>
**4.2.1 On iPad or iPhone** [Back to up menu](#4)  
___
1) Launch **Safari** app.  This does not work from the **Chrome** app.  
2) Open **InstrumentPanel** URL in **Safari**.  
3) Tap the icon featuring a right-pointing arrow coming out of a box along the top of the Safari window to open a drop-down menu.  
4) Tap **Add to Home Screen** The Add to Home dialog box will appear, with the icon that will be used for this website on the left side of the dialog box.  
5) Enter the name for the shortcut using the on-screen keyboard and tap **Add.** Safari will close automatically and you will be taken to where the icon is located on your iPad’s desktop.  
  
<a id="4_2_2"></a>
**4.2.2 On Android** [Back to up menu](#4)  
___
1) Launch **Chrome** app.  
2) Open **InstrumentPanel** URL in Chrome.  
3) Tap the menu icon (3 dots in upper right-hand corner) and tap **Add to homescreen** .  
4) You’ll be able to enter a name for the shortcut and then Chrome will add it to your home screen.  
  
<a id="5"></a>
**5. Advanced options** [Back to main menu](#content)  
___
For advanced users, you can manually specify the address and the protocol to connect to your Signal K server.
Be careful if you mix secure and unsecured protocols, your browser may refuse the connection.  
To manually specify the address and the protocol of the Signal K server,
 add the following query parameter **?signalkServer=wss://mysignalk.local:3443** to the url.  
Use **wss://** for secure websocket or **ws://** for unsecure websocket.  
  
<a id="6"></a>
**6. Trouble?** [Back to main menu](#content)  
___
InstrumentPanel stores some of its settings in the browser's local storage.  
In case you have invalid stuff displayed, you can reset it
 by adding the following query parameter **?reset=true** to the url.  
If you only want to reset a few parameters, use the GUI instead:  
 See [Reset settings screen](#2_3_4)  
  
If you see **ERROR in unit retrieval** on the upper of a widget, there is a problem to contact your Signal K server.  
Be careful, the values displayed may be wrong.  
Try to add the options to the URL described above.  
Check your browser logs and ask for help on slack: http://slack-invite.signalk.org/  
Maybe you discovered a bug.  

If you see **NaN** inside a widget, it means that the value returned by your Signal K server is incorrect
 and that InstrumentPanel cannot interpret it
 