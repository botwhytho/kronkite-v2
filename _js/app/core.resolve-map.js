/*--- core.resolve-map.js ---*/

Container.modules["resolve-map"] = function(APP) {
	var ajaxProvider = APP["ajax-provider"],
	utils = APP["utils"];

	function pushEvent(event) {
		return function(data) {
			return APP.broadcast.notify([event])(data)[event];
		}
	}

	function getCachedArticles(hasArticles) {
		if (hasArticles) {
			//retrieves cached articles from object returned from the notification.
			var data = pushEvent(["get-cached-articles"])();
			return Promise.resolve(data);
		} 
	}

	/*--- END Utility Functions ---*/

	function fetchTrendingSearches() {
		var url = APP["url-provider"].setAPIURL("search");

		function onFeedResponse({data}) {
			return data.rss.channel[0].item;
		}

		try {
			//try/catch ensures fresh data is fetched if articles-feed module has not launched yet.
			return getCachedArticles(pushEvent(["check-has-articles"])());
		} catch(e) {
			//console.error(e);
			return ajaxProvider({url}).then(onFeedResponse);
		} 
	}

	function fetchArticle({id}) {
		var metadata = pushEvent(["get-article-metadata"])(id),
		//url = APP["url-provider"].setAPIURL("article"),
		url = "./sample-data.json",
		objectExtend = APP["utils"].objectExtend,
		params = {url: metadata["ht:news_item"][0]["ht:news_item_url"][0]};

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

	APP["resolve-map"] = {fetchTrendingSearches, fetchArticle}
	return;
}
