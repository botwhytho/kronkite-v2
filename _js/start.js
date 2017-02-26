/*--- start.js ---*/

new Application(function(SANDBOX) {
	console.log("starting application...")

	SANDBOX.get(["module-loader"]).start(["router", "config"])({
		environment: "debug",
		remoteDebug: false,
		routeMap: {
			debug: "http://localhost:8080/",
			remoteDebug: "http://192.168.254.4:8080/",
			production: "http://kronkite-server.herokuapp.com"
		} 
	});
});

