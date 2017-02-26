/*--- core.module-loader.js ---*/

Application.CORE["module-loader"] = (function(CORE) { 
	var stagedModules; 
	
	function start(modules) {
		return function(args) {
			stagedModules = CORE["module-registry"].stagedModules;
			modules.forEach((module) => {
				stagedModules[module](args);
			}); 
			return;
		}
	} 
	
	function startALL(args) { 
		stagedModules = CORE["module-registry"].stagedModules;
		for (module in stagedModules) {
			stagedModules[module](args);
		}	
		
		return;	
	}	
	

	function stop(moduleID) { 
		
	} 
		
	function stopALL() { 
		
	}
		 	
 	return {start, stop, startALL, stopALL}

}).call(null, Application.CORE);
