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
			}
		},
		{
			path: "/article",
			templateFilePath: "article-view.ejs",
			middleware: function(){
				require(["router-middleware"])["/article"]();
			},
			resolve: require(["resolve-map"]).fetchResource("search"),
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
			controller: function(modules, data) {
				require(["start"])(["videos-feed"])(data);
			}
		},
		{
			path: "/video",
			templateFilePath: "video-view.ejs",
			resolve: require(["resolve-map"]).fetchResource("videos"),
			controller: function(data) {

			}
		}
	]);
	return;
}