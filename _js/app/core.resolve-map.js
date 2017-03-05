/*--- core.resolve-map.js ---*/

Container.modules["resolve-map"] = function({require, set}) {
	var ajaxProvider = require(["ajax-provider"]),
	broadcast = require(["broadcast"]);

	function pushEvent(event) {
		return function(data) {
			return broadcast.notify([event])(data)[event];
		}
	}

	function getFeedData(hasArticles) {
		if (hasArticles) {
			//retrieves cached feed from object returned from the notification.
			var data = pushEvent(["getCachedFeed"])();
			return Promise.resolve(data);
		} 
	}

	/*--- END Utility Functions ---*/

	function fetchTrendingSearches() {
		var url = require(["url-provider"]).setAPIURL("search");

		function onFeedResponse({data}) {
			return data.rss.channel[0].item;
		}

		try {
			//try/catch ensures fresh data is fetched if articles-feed module has not launched yet.
			return getFeedData(pushEvent(["checkHasFeed"])());
		} catch(e) {
			//console.error(e);
			return ajaxProvider({url}).then(onFeedResponse);
		} 
	}

	function fetchTrendingVideos() {
		//var url = require(["url-provider"]).setAPIURL("videos");
		var url = "./sample-youtube-data.json";

		return ajaxProvider({url}).then(function({data}) {
			console.log("data:", data);
			return data;
		});
	}

	function fetchArticle({id}) {
		var feedItemData = pushEvent(["getFeedItem"])(id),
		//url = require(["url-provider"]).setAPIURL("article"),
		url = "./sample-data.json",
		objectExtend = require(["utils"]).objectExtend,
		params = {url: feedItemData.getURL()};
		
		return ajaxProvider({url}).then(({data}) => {
			console.log({data});
			return data;
		});

		/*return ajaxProvider({url}).then(({data}) => {
			var articleObject = objectExtend(metadata)(data)();
			console.log({articleObject})
			return articleObject;
		});*/
	}

	set("resolve-map")({fetchTrendingSearches, 
			fetchTrendingVideos,
			fetchArticle
	})

	return;
}
