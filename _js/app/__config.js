/*--- __config.js ---*/

/*globals Container */

Container.modules.config = function(APP) {

	APP.require = function(modules) {
		if (modules.length === 1) {
	    		return APP[modules[0]];
	    	}
		
		return modules.reduce(function(moduleObject, nextModule) {
	    		moduleObject[nextModule] = APP[nextModule];
	       		return moduleObject;
	    	},{});
	};

	APP.set = function(name) {
		return function(object) {
			APP[name] = object;
			return;
		};
	};

	APP.start = function(modules) {
		return function(configuration) {
			modules.forEach(function(module) {
				APP.stage[module](configuration);
			});
		}
	};
	
	function setEnvironment(config) {
		if (config.environment === "debug" || config.environment === "remoteDebug" ) {
	   		console.warn("DEBUG mode ENABLED. API calls routed to localhost.");
	   	}

		APP.require(["url-provider"]).setEnvironment(config);
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
	}
	
	function start(args) {
		startErrorReporter();
		setEnvironment(args);
	}

	return {moduleName: "config", startFn: start};
};
