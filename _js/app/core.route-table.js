/*--- core.route-table.js ---*/

Container.modules["route-table"] = function({require, set}) {

	set("route-table")([
		{
			path: "/",
			templateFilePath: "index.ejs",
			middleware: function() { 
				require(["router-middleware"])["/"]();
			},
			resolve: function() {
				return require(["resolve-map"]).fetchFeed("search");
			},
			controller: function(modules, data) {
				require(["start"])(["articles-feed"])(data);
				console.log("modules", modules);
			}
		},
		{
			path: "/article",
			templateFilePath: "article-view.ejs",
			middleware: function(){
				require(["router-middleware"])["/article"]();
			},
			resolve: require(["resolve-map"]).fetchArticle,
			controller: function(modules, data) {
				
			}
		},
		{
			path: "/videos",
			templateFilePath: "videos-view.ejs",
			middleware: null,
			resolve: function() {
				return require(["resolve-map"]).fetchFeed("videos");
			},
			controller: function(data) {
							
			}
		},
		{
			path: "/video",
			templateFilePath: "video-view.ejs",
			resolve: null,
			controller: function(data) {

			}
		}
	]);
	return;
}