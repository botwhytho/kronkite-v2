/*--- core.resolve-map.js ---*/

Container.modules["resolve-map"] = function(APP) {

	function getCachedArticles(hasArticles) {
		if (hasArticles) {
			var data = APP.broadcast.notify(["get-cached-articles"])()["get-cached-articles"]

			return Promise.resolve(data);
		} 
	}

	function fetchTrendingSearches() {
		var url = APP["url-provider"].setAPIURL("search"),
		ajaxProvider = APP["ajax-provider"];

		function onFeedResponse({data}) {
			return data.rss.channel[0].item;
		}

		try {
			return getCachedArticles(APP.broadcast.notify(["check-has-articles"])());
		} catch(e) {
			//console.error(e);
			return ajaxProvider({url}).then(onFeedResponse);
		} 
	}

	APP["resolve-map"] = {fetchTrendingSearches}
	return;
}
