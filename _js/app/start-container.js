/*--- start-container.js ---*/

function startContainer({requiredModules, init, container,         enclosingContainer}) {
        
        if (requiredModules.length === 0) {return;}

        if (!requiredModules || requiredModules[0] === "*") {
            requiredModules = [];
            for (i in container.modules) {
                if (container.modules.hasOwnProperty(i)) {
                    requiredModules.push(i); 
                }
            } 
        }
        
    	for (i = 0; i < requiredModules.length; i++) {
    		try {
    			container.modules[requiredModules[i]](container, enclosingContainer);
    		} catch(e) {
    			console.error({
				error: e, 
				module: requiredModules[i],
				ContainerModules: container.modules
			});
    		}
    	}
    init(container);
}
