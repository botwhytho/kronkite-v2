/*--- core.route-table.js ---*/

Container.modules["route-table"] = function({require, set}) {

var routeTable = [
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
		resolve: require(["resolve-map"]).fetchResource({
			feedType: "search", 
			resource: "article"
		}),
		controller: function(modules, data) {
			
		}
	},
	{
		path: "/videos",
		templateFilePath: "videos-view.ejs",
		middleware: function() {
			require(["router-middleware"])["/videos"]()	
		},
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
		middleware: function() {
			require(["router-middleware"])["/video"]();
			window.scrollTo(0,0);
		},
		resolve: require(["resolve-map"]).fetchResource({
			feedType: "videos",
			resource: "videos"
		}),
		controller: function(data) {

		}
	},
	{
		path: "/music",
		templateFilePath: "tracks-view.ejs",
		middleware: function() {
			require(["router-middleware"])["/music"]();
			window.scrollTo(0,0);
		},
		resolve: function() {
			return require(["resolve-map"]).fetchFeed("music");
		}, 
		controller: function(modules, data) {
			require(["start"])(["music-feed"])(data);
		}
	}];

set("route-table")(routeTable);
return;

}