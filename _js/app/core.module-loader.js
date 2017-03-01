/*--- core.module-loader.js ---*/

Core.modules["module-loader"] = function(CORE) { 
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
		 
	CORE["module-loader"] = {start, stop, startALL, stopALL}
	return;
}
