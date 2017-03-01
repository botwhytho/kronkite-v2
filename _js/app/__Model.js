/*--- Model.js ---*/

/*globals Container */

Container.modules.model = function(APP) {
	function Model(data){
                var modelData = data,
                model = {},
                eventManifest,
                componentList;

                model.init = function(manifest) {
                        eventManifest = manifest;
                };

                model.getManifest = function() {
                        return model.eventManifest;
                };

                model.update = function(event, args) {
                        return attempt(function() {
                              return broadcastUpdate(event, 
                                eventManifest[event].call(modelData, args));
                        /*push errors to error reporting module/service*/   
                        })();
                };

                model.registerComponents = function(componentArray) {
                        componentList = componentArray;
                };

                model.getComponentList = function() {
                        return componentList;
                };

                model.getModel = function() {
                        return modelData;
                };

                model.patch = function(patchObject) {
                    modelData = patchObject;
                    return;
                };

                function onErrorFn(error) {
                        console.log(error);
                } 

                function broadcastUpdate(event, args) {
                        componentList.forEach(function(component) {
                            component.update(model.getModel());
                        });        
                }
                
                function attempt(tryFn) {
                    return function(onErrorFn) {
                        if (!onErrorFn) {
                            try { return tryFn(); } catch(e) {}
                        } else {
                            try { return tryFn(); } catch(e) { 
                                return onErrorFn(e); 
                            }
                        }
                    };
                }

                return model;
	} 
	
	function start(args) {
		APP["constructor-model"] = Model;
		return;
	}

  	return {moduleName: "model", startFn: start};
};

