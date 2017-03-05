/*--- core.route-table.js ---*/

Container.modules["route-table"] = function(APP) {

	APP.set("route-table")([
		{
			path: "/",
			templateFilePath: "index.ejs",
			middleware: function() { 
				APP["router-middleware"]["/"]();
			},
			resolve: APP.require(["resolve-map"]).fetchTrendingSearches,
			controller: function(modules, data) {
				APP.start(["articles-feed"])(data);
				console.log("modules", modules);
			}
		},
		{
			path: "/article",
			templateFilePath: "article-view.ejs",
			middleware: function(){
				APP["router-middleware"]["/article"]();	
			},
			resolve: APP.require(["resolve-map"]).fetchArticle,
			controller: function(modules, data) {
				
			}
		},
		{
			path: "/videos",
			templateFilePath: "videos-view.ejs",
			middleware: null,
			resolve: APP.require(["resolve-map"]).fetchTrendingVideos,
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
	]);
	return;
}