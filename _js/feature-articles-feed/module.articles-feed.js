/*--- module.articles-feed.js ---*/


Application.modules.articlesFeed = function (SANDBOX) {
	
	function start(args) {
		console.log("starting articles-feed...")
	
	}

	SANDBOX.get(["module-registry"]).register("articles-feed", start);
	return;
}