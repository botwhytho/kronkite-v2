/*--- core.module-registry.js ---*/

Core.modules["module-registry"] = function(CORE) { 
    var stagedModules = {}; 
  	
	function register(moduleName, startFn) {
		stagedModules[moduleName] = startFn;
		return;
	}
			
	function registerEvents(evts, mod) { 
		
	}

	function dispatchEvent(evt) { 
		
	} 
	
	CORE["module-registry"] = {register, registerEvents, dispatchEvent, stagedModules}
	return;
}
