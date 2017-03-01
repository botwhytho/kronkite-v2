/*--- start.js ---*/

new Core(startContainer, {
	requiredModules: ["module-registry", 
		"module-loader",
		"config",
		"model",
		"router-middleware",
		"router-service", 
		"router",
		"ajax-provider",
		"url-provider"
	],
    	init: function(CORE) {
    		new Sandbox(startContainer, {
			requiredModules: ["*"],
			enclosingContainer: CORE,
			init: initSandbox(CORE)
       		})
    	}
});

function initSandbox(CORE) {
return function(SANDBOX) {
	CORE.require(["module-loader"]).start(["router", "config", "model"])({
		environment: "debug",
		remoteDebug: false,
		routeMap: {
			debug: "http://localhost:8080/",
			remoteDebug: "http://192.168.254.4:8080/",
			production: "http://kronkite-server.herokuapp.com"
		} 
	})
}}
