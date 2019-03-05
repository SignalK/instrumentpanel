Signal K Instrument Panel
=========================
Instrument panel implemented as a grid with draggable &amp; resizable components. Components are added dynamically eg.
when the panel receives data it hasn't seen before a new cell is added to the grid.

![image](https://cloud.githubusercontent.com/assets/1049678/7094488/616bab4c-dfca-11e4-9c0b-eb1d4398f097.png)

Online demo: [http://demo.signalk.org/@signalk/instrumentpanel](http://demo.signalk.org/@signalk/instrumentpanel)  
InstrumentPanel help: [http://demo.signalk.org/@signalk/instrumentpanel#help](http://demo.signalk.org/@signalk/instrumentpanel#help)  

Trouble?
========
InstrumentPanel stores some of the settings in the browser's localstorage. In case there is some garbage there you can
get it cleared by using a url with query parameter `?reset=true`.  
The units and labels are also stored in the browser's localstorage and fetched from the signalK's server only the first time.
If you change a unit or a display label on the server, you can clear the cache without destroying your layout by using a url with query parameter  `?flushCache=true`.  

For iOS user:
=============
On an unlocked grid, to drag or to resize a widget,
 first click once or twice in the center of the widget
 to bring focus to it and then you can drag or resize the widget with the screen's scroll locked.  
If you don't click first in the center of the widget,
 the page starts scrolling before you can drag or resize the widget.  
To scroll the grid, it's easiest to do it from the left side even
 if the vertical scroll bar is to the right side.  
Using the vertical scrollbar on the right side,
 you risk resizing a widget instead of scrolling the page.  

For Developers
==============
- install development dependencies with `npm install`
- build & watch with `npm start`
- building js bundle for distribution: `npm run build` (and push changes to dist/ui.js). This builds minified ui.js.

Changelog
=====
- Remove primus.js usage. Primus is useful only with Signal K Node server and the requests for the client library cause unneeded confusion.

To Do
=====
- [x] activate/deactivate individual widgets
- [x] connect to multiple servers
- [x] minify
- [x] react-grid-styles: bower packaging
- [x] 'Receiving indicator' (circle/circle-o)
- [x] allow bootstrap of grid configuration from server: settings panel shows json that can be retrieved from the server with ?useGridFromServer=true url parameter)
- [x] visible grid cell background
- [x] per server layout persisted in localstorage
- [x] last known servers & connection status in localstorage
- [ ] good widgets for 'normal' data set (position, current, date & time)
- [x] true/both values in windmeter, change by click
- [ ] alternative/configurable units (knots/mps/mph)
- [x] configurable display format (position: deg+min.dec, deg.min.sec / precision)
- [ ] history graph widget (simple)
- [ ] sailgauge widget
- [ ] 'discovery mode' manual activation/deactivation
- [ ] possibility to delete obsolete data items
- [ ] manual addition of widgets, multiple alternative widgets
- [ ] configuration mode for widgets
- [ ] full screen mode for widgets
- [ ] history graph widget (maybe https://github.com/mapbox/react-tangle for scaling)
- [ ] configurable number of grid columns
- [x] multiple alternate layouts
- [ ] server configuration storage (button to store on the server)
- [ ] ais tracker widget
- [ ] map widget
- [ ] ui cleanup...
- [ ] bootstrapping from server for history graph
- [ ] subscription support: fetch items list from server, only subscribe when widget activated
- [ ] use Primus/reconnect support
