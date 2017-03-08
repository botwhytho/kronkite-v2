/*--- module.videos-feed.js ---*/

/*globals Container */

Container.modules["videos-feed"] = function({require, set}) {
	var Model,
	videosList,
	broadcast = require(["broadcast"]),
	eventList = [
		{event: "check-has-videos-feed", action: checkHasFeed},
		{event: "get-cached-videos-feed", action: getCachedFeed},
		{event: "get-videos-feed-item", action: findFeedItem}
	];
	
	function findFeedItem(id) {
		var item = videosList.getModel()[id];
		return item;
	}

	function checkHasFeed(args) {
		return videosList.getModel().length !== 0;
	}

	function getCachedFeed() {
		return videosList.getModel();
	}

	function start(currentFeed) {
		Model = require(["constructor-model"]);
		videosList = new Model(currentFeed);
		broadcast.listen(eventList);
		window.scrollTo(0,0);
		return;
	}

	return {moduleName: "videos-feed", startFn: start};
};
