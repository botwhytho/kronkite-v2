/*--- Router.js
 * Configures and bootstraps the router. ---*/

Core.modules.router = function(CORE) {
	function Router({routeTable, templateDirectory, templateEngine, middleware}) {
		var routes = {};

		function router() {
		 	var domContainer = "template-container",
		 	url = location.hash.slice(1) || "/",
		 	render = templateEngine.render,
		 	baseUrl = stripParams(url),
		 	params = getParams(url),
		 	route = routes[baseUrl];

		   	if (validateRoute(baseUrl) === false) { 	
			   	return;
		   	} else {
				render(route, domContainer, CORE, params, middleware);
			} 

			return;	
		}

		function regRoute(path, templateFilePath, controller, resolve, middleware, authRequired) {
			routes[path] = {	
				path: path,
				templateFilePath: templateDirectory + templateFilePath,
				controller: controller,
				resolve: resolve,
				middleware: middleware,
				authRequired: authRequired 
			};

			return;
		}
		
		function validateRoute(url) {
			if (routes[url] === undefined) {
			   	console.error("ROUTER ERROR: current route '" +
			   	url + "' not defined.");
			   	return false;
		   	}
		}

		function getParams(url) {
			var slicePt,
			queryStr,
			parsedParams = {};

			if (!url.includes('?')) { return false; } 

			slicePt = url.indexOf('?') + 1;
			queryStr = url.slice(slicePt);
			queryStr.split('&').forEach(function (qstr) {
				var slicePt = qstr.indexOf('=');
				parsedParams[qstr.slice(0, slicePt)] = qstr.slice(slicePt + 1);
			});
			return parsedParams;
		}

		function stripParams(url) {
			var strippedUrl,
			slicePt = url.indexOf('?');

			slicePt <= 0? strippedUrl = url : strippedUrl = url.slice(0, slicePt);
			
			return strippedUrl;
		}

		window.addEventListener("load", router);
		window.addEventListener("hashchange", router);  

		routeTable.forEach(function(route) {

			regRoute(route.path, 
				route.templateFilePath, 
				route.controller, 
				route.resolve,
				route.middleware,
				route.authRequired
			);
		});
		return 
	}

	function start(args) {
		var routerSupport = CORE.require(["router-service"]);

		new Router({
			routeTable: routerSupport.routeTable,
			templateEngine: routerSupport.templateEngine,
			templateDirectory: "./views/"
		});
	}

	CORE.require(["module-registry"]).register("router", start);
	return start;
}


