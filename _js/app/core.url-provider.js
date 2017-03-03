/*--- core.url-provider.js ---*/

/* globals Container */

Container.modules["url-provider"] = function({require, set}) { 
	var currentEnvironment,
	route,
	endpointMap = {
		search: "trending-search",
		videos: "trending-videos",
		music: "trending-music",
		article: "article"
	};

	function setEnvironment({environment, routeMap, remoteDebug}) {
		setRoute({environment, routeMap, remoteDebug}); 
		currentEnvironment = environment;
		return;
	}

	function setRoute({environment, routeMap, remoteDebug}) {
		if (!remoteDebug && environment === "debug") {
			route = routeMap.debug;
		} else if (remoteDebug && environment === "debug") {
			route = routeMap.remoteDebug;
		} else {
			route = routeMap.production;
		}
		return;
	}
	
	function setAPIURL(endpoint) {
		return route + endpointMap[endpoint];
	}
		
	set("url-provider")({setEnvironment, setAPIURL});
	return;
};
