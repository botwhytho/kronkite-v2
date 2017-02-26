/*--- Sandbox.js ---*/

Application.Sandbox = function(core, module_selector) { 
                   	
	function notify(evt) { 
		if(core.is_obj(evt) && evt.type) { 
			core.triggerEvent(evt); 
		} 
	}

	function listen(evts) { 
		core.registerEvents(evts, module_selector); 
	}

	function ignore(evts) { 
		if (core.is_arr(evts)) { 
			core.removeEvents(evts, module_selector); 
		}          
	}

	function get(modules) {
		if (modules.length === 1) {
    			return core[modules[0]];
    		}

		return modules.reduce(function(moduleObject, nextModule) {
    			moduleObject[nextModule] = core[nextModule];
       			return moduleObject;
    		},{});
	}

        return {notify, listen, ignore, get}; 
	     
};
