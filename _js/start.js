/*--- start.js ---*/

/* globals Container */

new Container(["*"], function start(APP) {
	APP.start(["config", "router", "model", "core-events"])({
		environment: "production",
		remoteDebug: false,
		routeMap: {
			debug: "http://localhost:8080/",
			remoteDebug: "http://192.168.254.4:8080/",
			production: "https://kronkite-server.herokuapp.com/"
		}	
	});
});

