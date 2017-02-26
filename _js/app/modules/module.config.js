/*--- module.config.js ---*/

Application.modules.config = function (SANDBOX) {
	
	function setEnvironment(config) {
		if (config.environment === "debug" || config.environment === "remoteDebug" ) {
	   		console.warn("DEBUG mode ENABLED. API calls routed to localhost.");
	   	}

		SANDBOX.get(["url-provider"]).setEnvironment(config);
		return;
	}

	function startErrorReporter() {
		window.addEventListener("error", function(e) {
			var stack = e.error.stack;
			var message = e.error.toString();
			
			if (stack) {message += '\n' + stack;}
			console.error({message, stack});
		});
		return;
	};
	
	function start(args) {
		startErrorReporter();
		setEnvironment(args);
	
	}

	SANDBOX.get(["module-registry"]).register("config", start);
	return;
}
