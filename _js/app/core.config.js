/*--- module.config.js ---*/

Core.modules.config = function(CORE) {

	CORE.require = function(modules) {
		if (modules.length === 1) {
	    		return CORE[modules[0]];
	    	}
		
		return modules.reduce(function(moduleObject, nextModule) {
	    		moduleObject[nextModule] = CORE[nextModule];
	       		return moduleObject;
	    	},{});
	}
	
	function setEnvironment(config) {
		if (config.environment === "debug" || config.environment === "remoteDebug" ) {
	   		console.warn("DEBUG mode ENABLED. API calls routed to localhost.");
	   	}

		CORE.require(["url-provider"]).setEnvironment(config);
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
	
	CORE.require(["module-registry"]).register("config", start);
	return;
}
