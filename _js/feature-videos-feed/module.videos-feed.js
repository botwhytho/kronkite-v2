/*--- module.videos-feed.js ---*/

/*globals Container */

Container.modules["videos-feed"] = function({require, set}) {
	var Model,
	videosList,
	broadcast = require(["broadcast"]),
	eventList = [
		{event: "checkHasFeed", action: checkHasFeed},
		{event: "getCachedFeed", action: getCachedFeed},
		{event: "getFeedItem", action: findFeedItem}
	];
	
	function start(currentFeed) {
		Model = require(["constructor-model"]);
		videosList = new Model(currentFeed);
		console.log(videosList.getModel());
		//broadcast.listen(eventList);
		return;
	}

	return {moduleName: "videos-feed", startFn: start};
};
