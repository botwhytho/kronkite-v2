/*--- core.router-service.js ---*/

/* globals Container, EJS, */

Application.CORE["router-service"] = (function(CORE) {

	function fetchTrendingSearches() {
		var url = CORE["url-provider"].setAPIURL("search"),
		ajaxProvider = CORE["ajax-provider"];

		return ajaxProvider({url, async: true}).then(function({data}) {
			//console.log("response data:", data.rss.channel[0].item);
			return data.rss.channel[0].item;
		});
	}

	return { 

		templateEngine: (function() {
		function render(route, container, SANDBOX, params) {
			var timer = setTimeout(()=> { showLoading() }, 2500);

			if (container && route.controller) {
				try { 
					loadRoute(route, container, timer, SANDBOX, params);	
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

		function loadRoute(route, container, timer, SANDBOX, params) {
			if ( typeof(route.resolve) !== "function" )  {
				executeRoute(route, container, SANDBOX, timer);
				return;
			}

			route.resolve(params).then(function(data) {
				executeRoute(route, container, SANDBOX, timer, data)
			}).catch((error) => {throw error});
			return;
		}

		function executeRoute(route, container, SANDBOX, timer, data) {
			renderTemplate(route.templateFilePath, container, data);
			route.controller(SANDBOX.get(["module-loader"]), data);
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

		return {render}
	}()),
	routeTable: [
		{
			path: "/",
			templateFilePath: "index.ejs",
			resolve: fetchTrendingSearches,
			controller: function(moduleLoader, data) {
				moduleLoader.start(["articles-feed"])();
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
	]}

}).call(null, Application.CORE)
	
