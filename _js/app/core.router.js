/*--- __router.js  
  * Configures and bootstraps the router. ---*/

/*globals Container */

Container.modules.router = function({require, set}) {
	
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
				render(route, domContainer, require, params, middleware);
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
		return; 
	}

	function start(args) {
		var routerSupport = require(["router-service", 
			"route-table"]);

		new Router({
			routeTable: routerSupport["route-table"],
			templateEngine: routerSupport["router-service"],
			templateDirectory: "./views/"
		});
	}

	return {moduleName: "router", startFn: start};
};


