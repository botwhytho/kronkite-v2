/*--- Router.js
 * Configures and bootstraps the router. ---*/

Application.modules.router = function (container) {
	function Router({routeTable, templateDirectory, templateEngine}) {
		var routes = {},
		templateDir;

		function router() {
		 	var container = "view-container",
		 	url = location.hash.slice(1) || "/",
		 	render = templateEngine.render,
		 	baseUrl = stripParams(url),
		 	params = getParams(url),
		 	route = routes[baseUrl];

		   	if (validateRoute(baseUrl) === false) { 		
			   	return;
		   	} else {
				render(route, container, params);
			} 

			return;	
		}

		function regRoute(path, templateFilePath, controller, resolve, authRequired) {
			routes[path] = {	
				path: path,
				templateFilePath: templateDir + templateFilePath,
				controller: controller,
				resolve: resolve,
				authRequired: authRequired 
			};

			return;
		}
		
		function validateRoute(url) {
			if (this[url] === undefined) {
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
				route.authRequired
			);
		});

		return 
	}

	function start() {
		var routerSupport = container.get("router-service");

		console.log("starting Router...", {container, routerSupport});
		new Router({
			routeTable: routerSupport.routeTable,
			templateEngine: routerSupport.templateEngine,
			templateDirectory: "./views"
		});
	}

	container.get("module-registry").register("router", start);
	return;
}


