/*--- core.resolve-map.js ---*/

Container.modules["resolve-map"] = function({require, set}) {

var ajaxProvider = require(["ajax-provider"]),
broadcast = require(["broadcast"]);

function pushEvent(event) {
	return function(data) {
		return broadcast.notify([event])(data)[event];
	}
}

function resourceXHR(url) {
	return function({params, feedItemData}) {
		return ajaxProvider({url, data: params}).then(({data}) => {
			return parseResponse(data, feedItemData);
		});
	}
}

function getFeed(hasFeed) {
	return function(feedType) {
		var getCachedFeed = `get-cached-${feedType}-feed`, data;

		if (hasFeed) {
			//retrieves cached feed from object returned from the notification.
			data = pushEvent([getCachedFeed])();
			return Promise.resolve(data);
		} 
	}
}

function parseResponse(data, feedItemData) {
	var objectExtend = require(["utils"]).objectExtend,
	responseObject = objectExtend(feedItemData.getALL())(data)();
	return responseObject;
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

	return fn({params: resourceMap[type](data), feedItemData: data});
}

/*--- END Utility Functions ---*/

function fetchFeed(feedType) {
	var url = require(["url-provider"]).setAPIURL(feedType),
	responseMap = {
		search: function({data}) {
				return data.rss.channel[0].item;
			},
		videos: function({data}) {
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

function fetchResource({feedType, resource}) {
	return function({id}) {
		var getFeedItem = `get-${feedType}-feed-item`,
		url = require(["url-provider"]).setAPIURL(resource),
		feedItemData = pushEvent([getFeedItem])(id);
			
		return validateRequestedResource({
			type: feedType,
			data: feedItemData,
			fn: resourceXHR(url)
		});	
	}
}

set("resolve-map")({fetchFeed, fetchResource})
return;

}
