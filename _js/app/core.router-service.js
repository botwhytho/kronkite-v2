/*--- core.router-service.js ---*/

/* globals Container, EJS */

Container.modules["router-service"] = function({require, set}) {

	set("router-service")((function() {
		function render(route, container, require, params) {
			var timer = setTimeout(()=> { showLoading(); }, 2500);

			if (container && route.controller) {
				try { 
					loadRoute(route, container, timer, 
						require, params);	
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

		function loadRoute(route, container, timer, require, params) {
			if ( typeof(route.resolve) !== "function" )  {
				executeRoute(route, container, require, timer);
				return;
			}

			route.resolve(params).then(function(data) {
				executeRoute(route, container, require, timer, data);
			}).catch((error) => {throw error;});
			return;
		}

		function executeRoute(route, container, require, timer, data) {
			renderTemplate(route.templateFilePath, container, data, route.middleware);
			route.controller(require(["stage"]), data);
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
	}()))
	
	return;
};
	
