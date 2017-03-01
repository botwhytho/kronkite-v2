/*--- APP.router-service.js ---*/

/* globals Container, EJS */

Container.modules["router-service"] = function(APP) {

	function fetchTrendingSearches() {
		//APP.require(["url-provider, ajax-provider, broadcast"])
		var url = APP["url-provider"].setAPIURL("search"),
		ajaxProvider = APP["ajax-provider"];
				
		return ajaxProvider({url, async: true}).then(function({data}) {
			return data.rss.channel[0].item;
		});
	}

	APP["router-service"] = { 
		templateEngine: (function() {
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
	}()),
	routeTable: [
		{
			path: "/",
			templateFilePath: "index.ejs",
			middleware: APP["router-middleware"]["/"],
			resolve: fetchTrendingSearches,
			controller: function(moduleLoader, data) {
				APP.start(["articles-feed"])(data);
			}
		},
		{
			path: "/article",
			templateFilePath: "article-view.ejs",
			middleware: APP["router-middleware"]["/article"],
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
	]};
	return;
};
	
