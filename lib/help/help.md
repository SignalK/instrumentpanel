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
        - [2.3.1. Display Value screen](#2_3_1)  
            - [2.3.1.1 Rule for displaying new widget](#2_3_1_1)  
            - [2.3.1.2 Hide or Show widget](#2_3_1_2)  
            - [2.3.1.3 Unit selection](#2_3_1_3)  
            - [2.3.1.4 Widget Specific Settings](#2_3_1_4)  
                - [2.3.1.4.1 Universal Widget](#2_3_1_4_1)  
                - [2.3.1.4.2 Compass Widget](#2_3_1_4_2)  
                - [2.3.1.4.3 Windmeter Widget](#2_3_1_4_3)  
                - [2.3.1.4.4 Digital DateTime Widget](#2_3_1_4_4)  
            - [2.3.1.5 Widget managed paths](#2_3_1_5)  
            - [2.3.1.6 Alarms Settings](#2_3_1_6)  
            - [2.3.1.7 Add or Delete Pages](#2_3_1_7)  
        - [2.3.2. Preferred Units screen](#2_3_2)  
        - [2.3.3. Dark Mode Screen](#2_3_3)  
        - [2.3.4. Reset settings screen](#2_3_4)  
+ [3. Options Available on the Widgets](#3)  
    - [3.1. Changing Display Mode](#3_1)  
    - [3.2. Wind Widget Modes](#3_2)  
    - [3.3. Digital Position Modes](#3_3)  
    - [3.4. Display SourceID](#3_4)  
+ [4. Advanced options](#4)  
+ [5. Trouble?](#5)  
  
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
>
>![connect](./help/connect-new.png#maxwidth)  
>
The address of the Signal K server is directly derived from your web page.  
Click on the button to connect to the server.  
The button's text changes to _Connecting_ indicate the connection status
 and once connected disappears. In most cases you won't see the _Connecting_ text at all.  
  
If the _Connecting_ button reappears, it means that the connection
 to the Signal K server is broken and that InstrumentPanel
 is trying to reconnect automatically.  
  
For advanced users, you can manually specify the address and
 the protocol to connect to your Signal K server
 (See: [Advanced options](#4)).  
  
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
- ![disconnect](./help/disconnect-icon.png) buttons: Click to disconnect from your Signal K server
 and to return to the initial state that allows you to specify the server to connect to (See:[Connect to ...](#1)).  
  
After 15 seconds without user activity, the menu will automatically hide to free up space on the screen.  
A small heart and a bell (when you have active notifications) are displayed at the top right of the screen.  
>
>![menu-hidden](./help/menu-hidden.png)  
>
To make the menu reappear click on the center of the Instrumentpanel screen.  
  
<a id="2_1"></a>
**2.1. Change Page** [Back to up menu](#2)  
___
>
>![multi-page](./help/multi-page.png#maxwidth)  
>
You can have up to 10 pages, each with a separate selection, configuration and layout of widgets.  
To switch pages, just click on the page number or doing a horizontal swipe on the screen.  
To create a new page, see:[Add or Delete Pages](#2_3_1_7).  
  
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
(See: [Alarms Settings](#2_3_1_6))  
  
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
- The ["Display Value"](#2_3_1) entry allows you to change how the values will be displayed on the grid and tunning their individual settings. This page display all widgets, hidden or shown.  
- The ["Preferred Units"](#2_3_2) entry allows you to set the unit values applied to widgets when they are created.  
- The ["Dark Mode"](#2_3_3) entry allows you to change how the dark mode will be activated.  
- The ["Reset settings screen"](#2_3_4) entry allows you to clear settings stored in local storage browser.  
  
In setting mode, use the ![view](./help/view-icon.png) button to return to the main view.  
  
<a id="2_3_1"></a>
**2.3.1. Display Value screen** [Back to up menu](#2_3)  
___
In this settings page, you can set:
- ["Rules for new widgets"](#2_3_1_1) who validating the display on your grid of new the widgets created when a new path is discovered.  
- ["Hide or show"](#2_3_1_2) parameter individually or all your widgets on your grid.  
- ["Unit selection"](#2_3_1_3) of the displayed value.  
- ["Widget Specific Settings"](#2_3_1_4) some widgets have specific parameters.  
- ["Widget managed paths"](#2_3_1_5) to discover the list of paths managed by this widget type.  
- ["Alarms Settings"](#2_3_1_6) to hide or show discovered alarms / notifications.  
- ["Add or Delete Pages"](#2_3_1_7) To manage multiple grid pages.  
  
<a id="2_3_1_1"></a>
**2.3.1.1. Rule for displaying new widget** [Back to up menu](#2_3_1)  
___
![newPaths](./help/settings-newPaths.png)  
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
**2.3.1.3. Unit selection** [Back to up menu](#2_3_1)  
___
Most widgets have a unit selection.  
Select your preferred unit from the listbox.  
>
>![unit](./help/widget-settingUnit.png#maxwidth)  
>
To make the unit change active, InstrumentPanel must be reloaded. This will be done automatically when you leave settings screens.  
You will be informed by a message at the top of the screen.  
  
<a id="2_3_1_4"></a>
**2.3.1.4. Widget Specific Settings** [Back to up menu](#2_3_1)  
___
Each widget type has specific settings.  
  
<a id="2_3_1_4_1"></a>
**2.3.1.4.1. Universal Widget** [Back to up menu](#2_3_1_4)  
___
This widget has 2 display views possible (digital/analog).  
Choose your preferred view by selecting the radio button.  
- **digital view**  
![universal-digital](./help/widget-settings-digital.png#maxwidth)  
- **analog view** has more settings.  
You can set the minimal and maximal values displayed.  
And also set the red line value.  
![universal-analog](./help/widget-settings-analog.png#maxwidth)  
  
<a id="2_3_1_4_2"></a>
**2.3.1.4.2. Compass Widget** [Back to up menu](#2_3_1_4)  
___
This widget has 3 displays view possible (rose/reading/digital).  
Choose your preferred view by selecting the radio button.  
- **Rose view**  
![compass-rose](./help/widget-settings-compass-rose.png#maxwidth)  
- **Reading view**  
![compass-reading](./help/widget-settings-compass-reading.png#maxwidth)  
- **Digital view**  
![compass-digital](./help/widget-settings-compass-digital.png#maxwidth)  
  
<a id="2_3_1_4_3"></a>
**2.3.1.4.3. Windmeter Widget:** [Back to up menu](#2_3_1_4)  
___
This widget has only the unit selection.  
Apparent Wind, True Wind over Ground and True Wind through Water values are automatically bound on widget.  
>
>![settings-windmeter](./help/widget-settings-windmeter.png#maxwidth)  
>
  
<a id="2_3_1_4_4"></a>
**2.3.1.4.4. Digital DateTime Widget:** [Back to up menu](#2_3_1_4)  
___
This widget has only a timezone selection.  
In timezone list, **DST** means Daylight Saving Time and displays time automatically in the timezone
 set on the device running your browser.  
>
>![settings-digitaldatetime](./help/widget-settings-digitaldatetime.png#maxwidth)  
>
  
<a id="2_3_1_5"></a>
**2.3.1.5. Widget managed paths:** [Back to up menu](#2_3_1)  
___
A widget type (compass in screenshot) can handle multiple paths.  
![widget-settings-pathsList](./help/widget-settings-pathsList.png)
  
You can discover the list of these paths by clicking on the **[+]** sign.
  
![widget-settings-pathsList-expand](./help/widget-settings-pathsList-expand.png)
  
In bold, are displayed the paths that are managed by this cell.  
For each path listed, a new cell will be created with this widget type only if the path exists on your Signal K server.  
Clic on the list to return to the default vue.  
  
<a id="2_3_1_6"></a>
**2.3.1.6. Alarms Settings:** [Back to up menu](#2_3_1)  
___
In setting mode, on the ![button-notif-warn](./help/button-notif-warn.png) page
 you can hide alarms from the main view by unchecking the **Show on grid** option.
 The ![button-notif-nominal-mixed](./help/button-notif-nominal-mixed.png) button
 reminds you that alarms are hidden by a dotted border around the bell.  
The color code for dotted lines is the same as for non-hidden alarms.
 The color indicates the highest value of hidden alarms.  
The alarm settings are not saved when you exit the GUI.  
  
<a id="2_3_1_7"></a>
**2.3.1.7. Add or Delete Pages** [Back to up menu](#2_3_1)  
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
- Layouts cache (units & labels).  
Delete all units & cells name (path or shortname) stored in layouts.  
On reload, the units & cells name will be retrieve from your Signal K server and stored in your layouts.  
This is useful if you have changed unit names in paths or the default.json file on your server.  
This operation is risk-free for your configuration.  
- Start connected: Reset the automatic connection at startup.
- Preferred units: Delete all preferred units.
- Previous layout: Clean previous layouts, if a layout existed in version 0.12.0 and earlier, it is used as a template to build the default layout.
>
>![reset-settings](./help/reset-settings.png#maxwidth)  
>
Select at least one checkbox and click on reset button.  
Confirm your choice in the dialog box  
To activate the changes, a **Reload is required**  
You will be informed by a message at the top of the screen.  
This will be done automatically when you leave settings screens.  
  
<a id="3"></a>
**3. Options Available on the Widgets** [Back to main menu](#content)  
___
  
<a id="3_1"></a>
**3.1. Changing Display Mode** [Back to up menu](#3)  
___
Some widgets have the ability to change their display mode directly.  
They are identified by a ![clickme-icon](./help/clickme-icon.png) icon in the top left corner.  
Click on this icon to change the display mode.  
New display mode is automatically saved.  
  
<a id="3_2"></a>
**3.2. Wind Widget Modes** [Back to up menu](#3)  
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
  
<a id="3_3"></a>
**3.3. Digital Position Modes** [Back to up menu](#3)  
___
The Digital Position Widget can display your position in different formats:  
- Dir D.ddddd° (N 38.99177°)  
- Dir +/-D.ddddd° (N +38.99177°)  
- Dir D°M'S''ddd (N 38°59'30"357)  
- DDirM'S''ddd (38N59'30"357)  
  
You can change the display format by clicking on the ![clickme-icon](./help/clickme-icon.png) icon.  
The first click, displays the display format then the others clicks change the display format.  
You have 5 seconds to repeat your clicks, after that the widget automatically displays its original label.  
  
<a id="3_4"></a>
**3.4. Display SourceID** [Back to up menu](#3)  
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
  
<a id="4"></a>
**4. Advanced options** [Back to main menu](#content)  
___
For advanced users, you can manually specify the address and the protocol to connect to your Signal K server.
Be careful if you mix secure and unsecured protocols, your browser may refuse the connection.  
To manually specify the address and the protocol of the Signal K server,
 add the following query parameter **?signalkServer=wss://mysignalk.local:3443** to the url.  
Use **wss://** for secure websocket or **ws://** for unsecure websocket.  
  
<a id="5"></a>
**5. Trouble?** [Back to main menu](#content)  
___
InstrumentPanel stores some of its settings in the browser's local storage.  
In case you have invalid stuff displayed, you can reset it
 by adding the following query parameter **?reset=true** to the url.  
If you only want to reset a few parameters, use the GUI instead:  
 See [Reset settings screen](#2_3_4)  
  
Units and labels are also stored in the browser's local storage and
 are fetched from the Signal K server only during startup.  
If you change a unit or a display label on the server,
 you can clear the cache without destroying your layout
 by modifying the url with the following query parameter  
 **?flushCache=true**  
 you can also use a dedicated menu in GUI:  
 Click on ![settings](./help/settings-icon.png) button  
 Then select settings for:**Reset Instrument Panel**  
 Check the box **Layouts cache (units & labels)**  
 See [Reset settings screen](#2_3_4)  
  
If you see **ERROR in unit retrieval** on the upper of a widget, there is a problem to contact your Signal K server.  
Be careful, the values displayed may be wrong.  
Try to add the options to the URL described above.  
Check your browser logs and ask for help on slack: http://slack-invite.signalk.org/  
Maybe you discovered a bug.  

If you see **NaN** inside a widget, it means that the value returned by your Signal K server is incorrect
 and that InstrumentPanel cannot interpret it
 