/*--- core.module-loader.js ---*/

Application.CORE["module-loader"] = (function(CORE) { 
	var stagedModules; 
	
	function start(modules) {
		stagedModules = CORE["module-registry"].stagedModules;
		modules.forEach((module) => {
			stagedModules[module]();
		}); 
		return
		 
	} 
		
	function startALL() { 
		stagedModules = CORE["module-registry"].stagedModules;
		for (module in stagedModules) {
			stagedModules[module]();
		}	
		return;	
	}

	function stop(moduleID) { 
		
	} 
		
	function stopALL() { 
		
	}
		 	
 	return {start, stop, startALL, stopALL}

}).call(null, Application.CORE);
