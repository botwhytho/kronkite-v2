/*--- APP.router-service.js ---*/

/* globals Container, EJS */

Container.modules["router-service"] = function(APP) {

	APP["router-service"] = (function() {
		function render(route, container, APP, params) {
			var timer = setTimeout(()=> { showLoading(); }, 2500);

			if (container && route.controller) {
				try { 
					loadRoute(route, container, timer, 
						APP, params);	
				} catch (error) {
			    		console.error("ROUTER ERROR: ", error);
			    	}
			}
			return;
		}

		function renderTemplate(pathToPartial, containerId, templateData, middleware) {

			if (pathToPartial.includes("null")) { return; }

			if (middleware) { middleware(); }

			var template = new EJS({url: pathToPartial}).render(
			containerId, {data: templateData});
			document.getElementById(containerId).innerHTML = template;
			return;
		}

		function loadRoute(route, container, timer, APP, params) {
			if ( typeof(route.resolve) !== "function" )  {
				executeRoute(route, container, APP, timer);
				return;
			}

			route.resolve(params).then(function(data) {
				executeRoute(route, container, APP, timer, data);
			}).catch((error) => {throw error;});
			return;
		}

		function executeRoute(route, container, APP, timer, data) {
			renderTemplate(route.templateFilePath, container, data, route.middleware);
			route.controller(APP.stage, data);
			clearTimeout(timer);
			hideLoading();
			return;
		}

		function showLoading() {
			console.warn("LOADING...");
			return;
		}

		function hideLoading() {
			//console.warn("FINISHED LOADING.");
			return;
		}

		return {render};
	}())
	
	return;
};
	
