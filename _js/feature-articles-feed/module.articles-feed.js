/*--- module.articles-feed.js ---*/

/*globals Container */

Container.modules["articles-feed"] = function(APP) {
	var Model,
	articlesList;

	function findArticle(id) {
		return articlesList.getModel()[id];
	}

	function checkHasArticles() {
		return articlesList.getModel().length !== 0;
	}

	function getCachedFeed() {
		return articlesList.getModel();
	}

	function start(currentFeed) {
		console.log("starting articles feed...");
		Model = APP.require(["constructor-model"]);
		articlesList = new Model(currentFeed);
		//CORE.listen("check-articles-feed", fn);
		return;
	}

	return {moduleName: "articles-feed", startFn: start};
};