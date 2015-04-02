Signalk K Instrument Panel
===============

Instrument panel implemented as a grid with draggable &amp; resizable components. Components are added dynamically eg. when the panel receives data it hasn't seen before a new cell is added to the grid.

![image](https://cloud.githubusercontent.com/assets/1049678/5593080/9657b632-91fc-11e4-9585-53e90c101149.png)


Building
================
Developing: build & watch with `npm run watch`

Building js bundle for distribution: `npm run dist` (and push changes to dist/ui.js).


To Do
=================
- [x] activate/deactivate individual widgets
- [x] connect to multiple servers
- [X] minify 
- [x] react-grid-styles: bower packaging  
- [x] 'Receiving indicator' (circle/circle-o)
- [X] allow bootstrap of grid configuration from server
- [x] visible grid cell background
- [x] bug: start with no localstorage, unlock, drag, lock => changes not saved
- [x] better label handling
- [x] per server layout

- [ ] doesn't work with java server
- [ ] only self messages in client /discard ais stuff
- [ ] good widgets for 'normal' data set (position, current, date & time)

=> master

- [ ] true/both values in windmeter, change by click
- [ ] history graph widget (simple)

- [ ] sailgauge widget

- [ ] reset

- [ ] 'discovery mode' manual activation/deactivation
- [ ] delete obsolete data items
- [ ] manual addition of widgets, multiple alternative widgets
- [ ] configuration mode for widgets
- [ ] history graph widget https://github.com/mapbox/react-tangle
- [ ] configurable number of grid columns
- [ ] multiple layouts
- [ ] server configuration storage
- [ ] ais tracker widget
- [ ] map widget
- [ ] ui cleanup
- [ ] bootstrapping from server for history graph

- [ ] subscription support
