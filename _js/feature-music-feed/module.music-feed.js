/*--- module.music-feed.js ---*/

/*globals Container */

Container.modules["music-feed"] = function({require, set}) {
	var Model,
	tracksList,
	broadcast = require(["broadcast"]),
	eventList = [
		{event: "check-has-music-feed", action: checkHasFeed},
		{event: "get-cached-music-feed", action: getCachedFeed},
		{event: "get-music-feed-item", action: findFeedItem}
	];

	function findFeedItem(id) {
		var item = tracksList.getModel()[id];
		return item;
	}

	function checkHasFeed(args) {
		return tracksList.getModel().length !== 0;
	}

	function getCachedFeed() {
		return tracksList.getModel();
	}

	function start(currentFeed) {
		require(["utils"]).setCurrentNavLinkOnRefresh(window.location.hash);
		Model = require(["constructor-model"]);
		tracksList = new Model(currentFeed);
		broadcast.listen(eventList);
		window.scrollTo(0,0);
		return;
	}

	return {moduleName: "music-feed", startFn: start};
};