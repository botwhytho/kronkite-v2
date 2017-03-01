/*--- Application.js ---*/

Core.modules = {};
Sandbox.modules = {};

function Core(initFn, {requiredModules, init, enclosingContainer})  {
	return initFn({container: Core, requiredModules, init, enclosingContainer});
}

function Sandbox(initFn, {requiredModules, init, enclosingContainer}) {
	return initFn({container: Sandbox, requiredModules, init, enclosingContainer});
}
