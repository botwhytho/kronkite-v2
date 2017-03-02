/*--- core.resolve-map.js ---*/

Container.modules["resolve-map"] = function(APP) {

	function getCachedArticles(hasArticles) {
		if (hasArticles) {
			//retrieves cached articles from object returned from the notification.
			var data = APP.broadcast.notify(["get-cached-articles"])()["get-cached-articles"]

			return Promise.resolve(data);
		} 
	}

	/*--- END Utility Functions ---*/

	function fetchTrendingSearches() {
		var url = APP["url-provider"].setAPIURL("search"),
		ajaxProvider = APP["ajax-provider"];

		function onFeedResponse({data}) {
			return data.rss.channel[0].item;
		}

		try {
			//try/catch ensures fresh data is fetched if articles-feed module has not launched yet.
			return getCachedArticles(APP.broadcast.notify(["check-has-articles"])());
		} catch(e) {
			//console.error(e);
			return ajaxProvider({url}).then(onFeedResponse);
		} 
	}

	function fetchArticle({id}) {
		var article = APP.broadcast.notify(["find-article"])(id)["find-article"];
		//console.log(article);
		return Promise.resolve(article);
	}

	APP["resolve-map"] = {fetchTrendingSearches, fetchArticle}
	return;
}
