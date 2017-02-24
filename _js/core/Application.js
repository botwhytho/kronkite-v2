/*--- Application.js ---*/

Application.CORE = {};
Application.CORE.base = {};
Application.modules = {};

function Application() {
	var args = Array.prototype.slice.call(arguments),
	callback = args.pop(),
	container = new Application.Container(Application.CORE),
	modules = (args[0] && typeof args[0] === "string") ? args : args[0],
	i;

	if (!(this instanceof Application)) {
		return new Application(modules, callback);
	}

	// no modules or "*" both mean "use all modules" 
	if (!modules || modules === '*') {
		modules = [];
		for (i in Application.modules) {
			if (Application.modules.hasOwnProperty(i)) {
				modules.push(i); 
			}
		} 
	}

	// initialize required modules
	for (i = 0; i < modules.length; i += 1) {
		try {
			Application.modules[modules[i]](container); 

		} catch(e) {
			console.error({
				error: e, 
				module: modules[i],
				ApplicationModules: Application.modules
			});
		}
	}

	callback(container); 
}
