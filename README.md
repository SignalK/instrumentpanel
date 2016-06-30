Signal K Instrument Panel
=========================
Instrument panel implemented as a grid with draggable &amp; resizable components. Components are added dynamically eg.
when the panel receives data it hasn't seen before a new cell is added to the grid.

![Signal K Instrument Panel](./index.png)
![Signal K Instrument Panel Menu](./menu.png)
![Signal K Instrument Panel Settings](./settings.png)

Keyboard Shortcuts
==================
Looking for comments on these:
- c &mdash; Show connection dialog
- d &mdash; Disconnect
- f &mdash; Fullscreen mode
- n &mdash; Toggle day/night mode
- r &mdash; Reconnect to last server
- s &mdash; Toggle settings page
- u &mdash; Unlock/lock layout for moving widgets

Trouble?
========
InstrumentPanel stores some of the settings in the browser's localstorage. In case there is some garbage there you can
get it cleared by using a url with query parameter `?reset=true`.

For Developers
==============
- install development dependencies with `npm install`
- build & watch with `npm start`
- building js bundle for distribution: `npm run build` (and push changes to dist/ui.js). This builds minified ui.js.

To Do
=====
- [x] activate/deactivate individual widgets
- [x] connect to multiple servers
- [x] minify
- [x] react-grid-styles: bower packaging
- [x] 'Receiving indicator' (circle/circle-o)
- [x] allow bootstrap of grid configuration from server: settings panel shows json that can be retrieved from the
      server with ?useGridFromServer=true url parameter
- [x] visible grid cell background
- [x] per server layout persisted in localstorage
- [x] last known servers & connection status in localstorage
- [ ] good widgets for 'normal' data set (position, current, date & time)
- [ ] true/both values in windmeter, change by click
- [ ] alternative/configurable units (knots/mps/mph)
- [ ] configurable display format (position: deg+min.dec, deg.min.sec / precision)
- [ ] history graph widget (simple)
- [ ] sailgauge widget
- [ ] 'discovery mode' manual activation/deactivation
- [ ] possibility to delete obsolete data items
- [ ] manual addition of widgets, multiple alternative widgets
- [ ] configuration mode for widgets
- [x] full screen mode for widgets
- [ ] history graph widget (maybe https://github.com/mapbox/react-tangle for scaling)
- [ ] configurable number of grid columns
- [ ] multiple alternate layouts
- [ ] server configuration storage (button to store on the server)
- [ ] ais tracker widget
- [ ] map widget
- [ ] bootstrapping from server for history graph
- [ ] subscription support: fetch items list from server, only subscribe when widget activated
- [ ] use Primus/reconnect support
- [ ] enable theme support in widgets
