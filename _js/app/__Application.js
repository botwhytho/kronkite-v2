/*--- __application.js ---*/

/* globals Container */

Container.modules = {};

function Container(requiredModules, init) {
        Container.stage = {};

        if (requiredModules.length === 0) {return;}
                
        loadModules.call(Container, {
        	modules: parseRequiredModules(Container)(requiredModules),
        	fn: stageModules(Container.stage)
        });

       	init(Container);
}

function stageModules(stage) {
	return function(module) {
		if (module === undefined) { return;};
		stage[module.moduleName] = module.startFn;
	};	
}

function parseRequiredModules(container) {
	return function(requiredModules) {
		if (!requiredModules || requiredModules[0] === "*") {
	            requiredModules = [];
	            for (var i in container.modules) {
	                if (container.modules.hasOwnProperty(i)) {
	                    requiredModules.push(i); 
	                }
	            } 
	        }
	        return requiredModules;
	};
}

function loadModules({modules, fn}) {
	var container = this;
	for (var i = 0; i < modules.length; i++) {
    		try {
    			fn(container.modules[modules[i]](container));
    		} catch(e) {
    			console.error({
				error: e, 
				module: modules[i],
				ContainerModules: container.modules,
				container
			});
    		}
    	}
}
