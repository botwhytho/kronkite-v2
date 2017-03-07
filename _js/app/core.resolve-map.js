/*--- core.resolve-map.js ---*/

Container.modules["resolve-map"] = function({require, set}) {
	var ajaxProvider = require(["ajax-provider"]),
	broadcast = require(["broadcast"]);

	function pushEvent(event) {
		return function(data) {
			return broadcast.notify([event])(data)[event];
		}
	}

	function getFeed(hasFeed) {
		return function(feedType) {
			var getCachedFeed = `get-cached-${feedType}-feed`,
			data;

			if (hasFeed) {
				//retrieves cached feed from object returned from the notification.
				data = pushEvent([getCachedFeed])();
				return Promise.resolve(data);
			} 
		}
	}

	function validateRequestedResource({type, data, fn}) {
		var resourceXHRList = ["search"],
		resourceMap = {
			search: function(metadata) {
				return {url: metadata.getURL()}
			}	
		};	
		
		if (!resourceXHRList.includes(type)) {
			return Promise.resolve(data);
		}

		return fn(resourceMap[type](data));
	}
	
	/*--- END Utility Functions ---*/

	function fetchFeed(feedType) {
		var url = require(["url-provider"]).setAPIURL(feedType),
		responseMap = {
			search: function({data}) {
					return data.rss.channel[0].item;
				},
			videos: function({data}) {
					//console.log("data:", data);
					return data;
				}
		},
		checkHasFeed = `check-has-${feedType}-feed`;

		try {
			//try/catch ensures fresh data is fetched if articles-feed module has not launched yet.
			return getFeed(pushEvent([checkHasFeed])())(feedType);
		} catch(e) {
			//console.error(e);
			return ajaxProvider({url}).then(responseMap[feedType]);
		}
	}

	function fetchResource(resourceType) {
		return function({id}) {
			var getFeedItem = `get-${resourceType}-feed-item`,
			//url = require(["url-provider"]).setAPIURL(resourceType),
			feedItemData = pushEvent([getFeedItem])(id),
			/*remove in production*/
			mockResourceMap = {
				search: "./sample-data.json",
				videos: "./sample-youtube-data.json"
			};
			/*remove in production*/
			console.log("Mock resource(s) in use. Remove in production.")

			function resourceXHR(data) {
				return ajaxProvider({
					url: mockResourceMap[resourceType],
					data
				}).then(({data}) => {
				console.log({data});
				return data;
			});


			}


			return validateRequestedResource({
				type: resourceType,
				data: feedItemData,
				fn: resourceXHR
			});	
		}
	}

	function fetchArticle({id}) {
		var feedItemData = pushEvent(["get-search-feed-item"])(id),
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

	function fetchVideo({id}) {

	}

	set("resolve-map")({fetchFeed, fetchArticle, fetchResource})

	return;
}
