/*--- Container.js ---*/

Application.Container = function(core, module_selector) { 
                   	
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

	function get(dependency) {
		return core[dependency];
	}

        return {notify, listen, ignore, get}; 
	     
};
