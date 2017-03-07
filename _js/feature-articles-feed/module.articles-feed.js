/*--- module.articles-feed.js ---*/

/*globals Container */

Container.modules["articles-feed"] = function({require, set}) {
	var Model,
	articlesList,
	broadcast = require(["broadcast"]),
	eventList = [
		{event: "check-has-search-feed", action: checkHasFeed},
		{event: "get-cached-search-feed", action: getCachedFeed},
		{event: "get-search-feed-item", action: findFeedItem}
	];

	function findFeedItem(id) {
		var item = articlesList.getModel()[id];
		
		function getURL() {
			return item["ht:news_item"][0]["ht:news_item_url"][0];
		}

		function getALL() {
			return item;
		}

		return {getURL, getALL}
	}

	function checkHasFeed(args) {
		return articlesList.getModel().length !== 0;
	}

	function getCachedFeed() {
		return articlesList.getModel();
	}

	function start(currentFeed) {
		Model = require(["constructor-model"]);
		articlesList = new Model(currentFeed);
		console.log({articlesList});
		broadcast.listen(eventList);
		return;
	}

	return {moduleName: "articles-feed", startFn: start};
};