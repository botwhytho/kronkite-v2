/*--- Model.js ---*/

Application.modules.model = function (SANDBOX) {
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
                
                return model;
	}; 
	
	function start(args) {
		SANDBOX["constructor-model"] = Model;
		return;
	}

	SANDBOX.get(["module-registry"]).register("model", start);
	return;
}

