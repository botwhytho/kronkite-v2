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
	
	function start(currentFeed) {
		Model = require(["constructor-model"]);
		videosList = new Model(currentFeed);
		console.log("videosList:", videosList.getModel());
		//broadcast.listen(eventList);
		return;
	}

	return {moduleName: "videos-feed", startFn: start};
};
