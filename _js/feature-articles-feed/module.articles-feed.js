/*--- module.articles-feed.js ---*/

/*globals Container */

Container.modules["articles-feed"] = function(APP) {
	var Model,
	articlesList,
	eventList = [
		{event: "check-has-articles", action: checkHasArticles},
		{event: "get-cached-articles", 	action: getCachedArticles},
		{event: "get-article-metadata", action: findArticle}
	];

	function findArticle(id) {
		return articlesList.getModel()[id];
	}

	function checkHasArticles(args) {
		return articlesList.getModel().length !== 0;
	}

	function getCachedArticles() {
		return articlesList.getModel();
	}

	function start(currentFeed) {
		Model = APP.require(["constructor-model"]);
		articlesList = new Model(currentFeed);
		APP.broadcast.listen(eventList);
		return;
	}

	return {moduleName: "articles-feed", startFn: start};
};