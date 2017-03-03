/*--- module.articles-feed.js ---*/

/*globals Container */

Container.modules["articles-feed"] = function({require, set}) {
	var Model,
	articlesList,
	broadcast = require(["broadcast"]),
	eventList = [
		{event: "checkHasArticles", action: checkHasArticles},
		{event: "getCachedArticles", action: getCachedArticles},
		{event: "getArticleMetadata", action: findArticle}
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
		Model = require(["constructor-model"]);
		articlesList = new Model(currentFeed);
		broadcast.listen(eventList);
		return;
	}

	return {moduleName: "articles-feed", startFn: start};
};