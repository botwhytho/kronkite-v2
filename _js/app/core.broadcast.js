/*--- core.broadcast.js ---*/

/*globals Container */

Container.modules.broadcast = function(APP) { 
	
	function notify(evt) { 
		/*if(core.is_obj(evt) && evt.type) { 
			core.triggerEvent(evt); 
		} */
	}

	function listen(evts) { 
		//core.registerEvents(evts, module_selector); 
	}

	function ignore(evts) { 
		/*if (core.is_arr(evts)) { 
			core.removeEvents(evts, module_selector); 
		} */         
	}

	APP.broadcast = {notify, listen, ignore};
};
