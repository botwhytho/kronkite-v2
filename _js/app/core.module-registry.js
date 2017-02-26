/*--- core.module-registry.js ---*/

Application.CORE["module-registry"] = (function() { 
    var stagedModules = {}; 
  	
	function register(moduleName, startFn) {
		stagedModules[moduleName] = startFn;
		return;
	}
			
	function registerEvents(evts, mod) { 
		
	}

	function dispatchEvent(evt) { 
		
	} 
	 	
 	return {register, registerEvents, dispatchEvent, stagedModules}

}());
