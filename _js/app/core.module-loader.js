/*--- APP.module-loader.js ---*/

/*globals Container */

/*Container.modules["module-loader"] = function(APP) { 
	var stagedModules; 
	
	function start(modules) {
		return function(args) {
			stagedModules = APP["module-registry"].stagedModules;
			modules.forEach((module) => {
				stagedModules[module](args);
			}); 
			return;
		};
	} 
	
	function startALL(args) { 
		stagedModules = APP["module-registry"].stagedModules;
		for (var module in stagedModules) {
			stagedModules[module](args);
		}	
		
		return;	
	}	
	

	function stop(moduleID) { 
		
	} 
		
	function stopALL() { 
		
	}
		 
	APP["module-loader"] = {start, stop, startALL, stopALL};
	return;
};*/
