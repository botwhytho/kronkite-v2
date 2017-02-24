/*--- core.module-registry.js ---*/

Application.CORE["module-registry"] = (function(mode) { 
    var stagedModules = {}; 
  
 	(function debug(mode) { 
	   if (mode === "debug") {
	   	console.warn("DEBUG mode ENABLED. API calls routed to localhost.")
	   }
	}()); 
	
	function register(moduleName, startFn) {
		stagedModules[moduleName] = startFn;
		return;
	}
			
	function registerEvents(evts, mod) { 
		
	}

	function dispatchEvent(evt) { 
		
	} 
	 	
 	return {register, registerEvents, dispatchEvent, stagedModules}

}("debug"));
