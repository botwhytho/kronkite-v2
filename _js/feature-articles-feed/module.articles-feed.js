/*--- module.articles-feed.js ---*/


Application.modules.articlesFeed = function (container) {
	
	function start() {
		console.log("starting articles-feed...")
		var routerSupport = container.get("router-service");

		
	}

	container.get("module-registry").register("articles-feed", start);
	return;
}