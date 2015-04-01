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

- [ ] reset to server
- [ ] reset to discover mode

- [ ] good widgets for 'normal' data set (position, current, date & time)

- [ ] alternative units
- [ ] true values in windmeter

- [ ] 'discovery mode' manual activation/deactivation
- [ ] delete obsolete data items, delete all
- [ ] manual addition of widgets, multiple alternative widgets
- [ ] configuration mode for widgets
- [ ] history graph widget (simple)
- [ ] history graph widget 
- [ ] configurable number of grid columns
- [ ] multiple layouts
- [ ] server configuration storage
- [ ] sailgauge widget
- [ ] ais tracker widget
- [ ] map widget
- [ ] ui cleanup
- [ ] bootstrapping from server for history graph


