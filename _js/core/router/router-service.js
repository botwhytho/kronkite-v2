/*--- router-service.js ---*/

/* globals Container, EJS, */

Application.CORE["router-service"] = { 
	templateEngine: (function() {
		function render(route, container, params) {
			var timer = setTimeout(()=> { showLoading() }, 1500);

			if (container && route.controller) {
				try { 
					loadRoute(route, container, timer, params);	
				} catch (error) {
			    		console.error("ROUTER ERROR: ", error);
			    	}
			}
			return;
		}

		function renderTemplate(pathToPartial, containerId, templateData) {
			if (pathToPartial.includes("null")) { return; }

			var template = new EJS({url: pathToPartial}).render(
			containerId, {data: templateData});
			document.getElementById(containerId).innerHTML = template;
			return;
		}

		function loadRoute(route, container, timer, params) {
			if ( typeof(route.resolve) !== "function" )  {
				executeRoute(route, container, timer);
				return;
			}

			route.resolve(params).then(function(data) {
				executeRoute(route, container, timer, data);
			});
			return;
		}

		function executeRoute(route, container, timer, data) {
			renderTemplate(route.templateFilePath, container, data);
			route.controller(data);
			clearTimeout(timer);
			hideLoading();
			return;
		}

		function showLoading() {
			console.warn("LOADING...");
			return;
		}

		function hideLoading() {
			console.warn("FINISHED LOADING.");
			return;
		}

		return {render}
	}),
	routeTable: [
		{
			path: "/login",
			templateFilePath: null,
			resolve: null,
			controller: function(data) {
				
			}
		},
		{
			path: "/main-menu",
			templateFilePath: "main-menu-view.ejs",
			resolve: null,
			controller: function(data) {
				
			}
		},
		{
			path: "/lunch-order",
			templateFilePath: "lunch-order-view.ejs",
			resolve: null,
			controller: function(data) {
							
			}
		},
		{
			path: "/orders-view",
			templateFilePath: "orders-view.ejs",
			resolve: null,
			controller: function(data) {

			}
		}
	]
}
