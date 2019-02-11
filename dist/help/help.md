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
    border-color: black;
    border-style: solid;
    max-width: 600px
  }
  .help hr {
    border-color: black;
    margin-top: 0px;
  }
  .help blockquote {
    border-left: none;
  }
</style>
#### Welcome in SignalK Instrument Panel help page
___
**Instrument panel** is implemented as a grid with draggable &amp; resizable widgets.  
Widgets are added dynamically eg.
 when the panel receives data it hasn't seen before a new cell is added to the grid from the bottom.  
>
>![demo](./dist/help/main-page.png#maxwidth)  
>
  
When the help page is displayed all buttons are disabled.  
You must close the help page by clicking on the ![help-on](./dist/help/help-on-icon.png)
 button to reactivate them.  
  
**1. Connect to your SignalK server:**  
___
>
>![connect](./dist/help/connect.png#maxwidth)  
>
When you open the main page of Instrument Panel,
 you have to enter the address of your SignalK server (1).
 In most cases, the address is the same as URL of Instrument Panel or automatically filled in by mdns.  
Then click on the connect button(2) to join your SignalK server.  
  
**2. Discover your main page:**  
___
During the first login, an initial first page is auto generated with all paths known in your SignalK Server.
SignalK paths are displayed in different cells with dedicated widgets depending on their types.
Widget are arranged on a virtual grid with vertical compaction.  
**Units** on widget are set to default and fetched from your SignalK Server metadata if provided.  
>
>![main-page](./dist/help/main-page-default.png#maxwidth)  
>
  
To the right of the main bar, ![disconnect](./dist/help/disconnect-icon.png) is the button
 to disconnect from your SignalK server and to return to the connect page.  
To the left of the disconnect button, a ![heart](./dist/help/heartbeat-icon.png) icon blinking every second.
 This indicates that you are connected to your SignalK server and that data is being received.
 If the heart is not blinking, your connexion is broken and values displayed in your widgets may be obsolete.  
In future version an auto-reconnect feature will be implemented.  
  
**2.1. Change display page:**  
___
>
>![multi-page](./dist/help/multi-page.png#maxwidth)  
>
You can have up to 10 pages with specific widget organizations.  
To switch pages, just click on the page number.  
  
**2.2. Change display options of widgets:**  
___
Some widgets have the ability to change their display modes directly.  
They are identified by a ![clickme-icon](./dist/help/clickme-icon.png) icon in the top left corner.
 Click on this icon to change display mode.  
New display mode is automatically saved in your personal settings.  
  
**2.3. Arrange your page design:**  
___
Use the ![lock](./dist/help/button-lock.png) button on the main bar to unlock your grid,  
then you can organize your widget placement as you want.  
When the grid is unlocked, widget background changes to gold color and features are hidden.  
>
>![widget-unlock](./dist/help/widget-gold.png#maxwidth)  
>
To return to normal mode and to lock your grid, click on ![unlock](./dist/help/button-unlock.png) button  
  
**2.3.1. Move and resize your widget:**  
___
On a unlocked grid:  
**Resize** a widget by dragging the anchor located on the bottom right of it.  
>
>![resize](./dist/help/widget-resize.png#maxwidth)  
>
  
**Move** a widget by draging it on the grid.  
>
>![drag](./dist/help/widget-drag.png#maxwidth)  
>
  
**2.3.2. Notes for iOS users:**  
___
On an unlocked grid, to drag or to resize a widget,
 first click once or twice in the center of the widget
 to bring focus to it and then you can drag or resize the widget with grid's scroll locked.
 If you don't click first in the center of the widget,
 the grid starts scrolling before you can drag or resize the widget.  
To scroll the grid, it's easierth to do it from the left side even
 if the vertical scroll bar is to the right side.
 Using the vertical scrollbar to the the right side,
 you risk resizing a widget instead of scrolling the grid.  
  
**2.4. Display sourceID of widget's stream:**  
___
To display the source Id of one widget's data stream,
 click on to the top right corner of widget.  
>
>![sourceID-hidden](./dist/help/widget-sourceID-hidden.png#maxwidth)  
>
To hide the source Id, just click in the displayed source Id field.  
>
>![sourceID-visible](./dist/help/widget-sourceID-visible.png#maxwidth)  
>
  
**2.5. Widget Wind Meter:**  
___
The widget Wind Meter display by default apparent wind.  
>
>![widget-windmeter](./dist/help/widget-windmeter.png#maxwidth)  
>
This widget can also display True Wind over Ground and True Wind through Water
 if your SignalK server provide them (see: 2.2. Change display options of widgets).  
If not, an alert message is raised when you try to display these values.  
>
>![windmeter-alert](./dist/help/widget-windmeter-alert.png#maxwidth)  
>
As described, you can build these values with the **Derived Data** plugin available in SignalK server AppStore:  
>
>![DerivedData-appStore](./dist/help/plugin-DerivedData-appStore.png#maxwidth)  
>
Install the pluging and restart your SignalK server.  
Then locate the pluging in the **Server/Plugin Config**:  
>
>![skServer-PluginConfig](./dist/help/skServer-PluginConfig.png#maxwidth)  
>
Activate the plugin:  
>
>![DerivedData-active](./dist/help/plugin-DerivedData-active.png#maxwidth)  
>
Enable the options for True Wind over Ground and True Wind through Water:  
>
>![DerivedData-options](./dist/help/plugin-DerivedData-options.png#maxwidth)  
>
And then click on the ![DerivedData-submit](./dist/help/plugin-DerivedData-submit.png) button to save theses options.  
  
**3. Switch to settings:**  
___
Use this button ![settings](./dist/help/settings-icon.png) to switch to settings.
 The grid displays each widget with its setting options.  
In setting mode, use view button ![view](./dist/help/view-icon.png) to return to the main view.  
  
**3.1. Add /delete page:**  
___
>
>![multi-page](./dist/help/add-page-before.png#maxwidth)  
>
You can have up to 10 pages with a specific widget organization.  
To add a new page, just click on ![button-plus](./dist/help/button-plus.png) button.
 The new page is automatically selected  
>
>![add-page-after](./dist/help/add-page-after.png#maxwidth)  
>
To delete an unnecessary page, click on the page number and
 then on ![button-delCurrent](./dist/help/button-delCurrent.png) button  
  
**3.2. Hide / Show widget:**  
___
A common option for all widgets is the **visible** option  
>
>![visible](./dist/help/widget-settings-visible.png#maxwidth)  
>
Unselect/Select checkbox to hide/show the widget on the main page.  
By default, all new widgets are visible.  
  
**3.3. Set unit setting:**  
___
Most widgets have an unit setting.  
Select your preferred unit in listbox.  
>
>![unit](./dist/help/widget-settingUnit.png#maxwidth)  
>
To make the unit change active, please disconnect and reconnect.  
  
**3.4. Widgets settings:**  
___
Each widget type has specific settings (details below)  
  
**3.4.1. Universal widget settings:**  
___
This widget has 2 display views possible (digital/analog).  
Choose your prefered view by selecting the radio button.  
- **digital view**  
![universal-digital](./dist/help/widget-settings-digital.png#maxwidth)  
- **analog view** has more settings.  
You can set the minimal and maximal values displayed.  
And also set the red line value.  
![universal-analog](./dist/help/widget-settings-analog.png#maxwidth)  
  
**3.4.2. Compass widget settings:**  
___
This widget has 3 displays view possible (rose/reading/digital).  
Choose your preferred view by selecting the radio button.  
- **Rose view**  
![compass-rose](./dist/help/widget-settings-compass-rose.png#maxwidth)  
- **Reading view**  
![compass-reading](./dist/help/widget-settings-compass-reading.png#maxwidth)  
- **Digital view**  
![compass-digital](./dist/help/widget-settings-compass-digital.png#maxwidth)  
  
**3.4.3. Windmeter widget settings:**  
___
This widget has only an unit option setting.  
Apparent Wind, True Wind over Ground and True Wind through Water values are automatically bound on widget.  
>
>![settings-windmeter](./dist/help/widget-settings-windmeter.png#maxwidth)  
>
  
**3.4.4. Digitaldatetime widget settings:**  
___
This widget has just a timezone option setting.  
In timezone list, **DST** means Daylight Saving Time and displays time automatically in the same timezone
 set on the device running your browser.  
>
>![settings-digitaldatetime](./dist/help/widget-settings-digitaldatetime.png#maxwidth)  
>
  
**4. Trouble?**  
___
InstrumentPanel stores some of its settings in the browser's local storage.  
In case you have invalid stuff displayed, you can reset it
 by adding the following query parameter **?reset=true** to the url.  
  
Units and labels are also stored in the browser's local storage and
 are fetched from the signalK's server only during startup.  
If you change an unit or a display label on the server,
 you can clear the cache without destroying your layout
 by modifying the url with the following query parameter  
 **?flushCache=true**.  
