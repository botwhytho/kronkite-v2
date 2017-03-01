/*--- module.articles-feed.js ---*/

Sandbox.modules.articlesFeed = function(SANDBOX, CORE) {

	function start(args) {
		console.log("starting articles-feed...")
		console.log(CORE.require(["constructor-model"]));
		console.log(args);
	}

	CORE.require(["module-registry"]).register("articles-feed", start);
	return;
}