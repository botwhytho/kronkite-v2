/*--- start.js ---*/

/* globals Container */

new Container(["*"], function start(APP) {
	APP.start(["config", "router", "model"])({
		environment: "debug",
		remoteDebug: false,
		routeMap: {
			debug: "http://localhost:8080/",
			remoteDebug: "http://192.168.254.4:8080/",
			production: "http://kronkite-server.herokuapp.com"
		}	
	});
});

