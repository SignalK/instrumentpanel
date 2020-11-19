Signal K Instrument Panel
=========================
Instrument panel implemented as a grid with draggable &amp; resizable components. Components are added dynamically eg.
when the panel receives data it hasn't seen before a new cell is added to the grid.

![main-page](public/help/main-page.png)

Online demo: [http://demo.signalk.org/@signalk/instrumentpanel](http://demo.signalk.org/@signalk/instrumentpanel)  
InstrumentPanel help: [http://demo.signalk.org/@signalk/instrumentpanel#help](http://demo.signalk.org/@signalk/instrumentpanel#help)  

Trouble?
========
First consult the online help, link above or click on **?** icon inside the GUI.  
InstrumentPanel stores some of the settings in the browser's localstorage. In case there is some garbage there you can
get it cleared by using a url with query parameter `?reset=true`.  

For iOS user:
=============
On an unlocked grid, to drag or to resize a widget,
 first click once or twice in the center of the widget
 to bring focus to it and then you can drag or resize the widget with the screen's scroll locked.  
If you don't click first in the center of the widget,
 the page starts scrolling before you can drag or resize the widget.  

For Developers
==============
- clone repository: `git clone https://github.com/SignalK/instrumentpanel.git`
- install development dependencies with: `npm install`
- build & watch with: `npm start` (run an instrumentpanel http server on port 3001)
- building js bundle for distribution: `npm run prepublishOnly` will publish in `public\ui.js`. This builds minified ui.js.
  
The address of the signal K server is directly derived from your web page.  
You can manually specify the address and the protocol to connect to your signal K server.  
Be careful if you mix secure and unsecured protocols, your browser may refuse the connection.  
To manually specify the address and the protocol of the signal K server,  
 add the following query parameter **?signalkServer=wss://mysignalk.local:3443** to the url.  
Use **wss://** for secure websocket or **ws://** for unsecure websocket.  

Changelog
=====
[CHANGELOG](CHANGELOG.md)

To Do
=====
Please open a github issue if you want a new feature.
