
/*--- __application.js ---*/

/* globals Container */

Container.modules = {};

function Container(requiredModules, init) {
        Container.stage = {};

        if (requiredModules.length === 0) {return;}
                
        loadModules.call(Container, {
        	modules: parseRequiredModules(Container)(requiredModules),
        	fn: stageModules(Container.stage)
        });

       	init(Container);
}

function stageModules(stage) {
	return function(module) {
		if (module === undefined) { return;};
		stage[module.moduleName] = module.startFn;
	};	
}

function parseRequiredModules(container) {
	return function(requiredModules) {
		if (!requiredModules || requiredModules[0] === "*") {
	            requiredModules = [];
	            for (var i in container.modules) {
	                if (container.modules.hasOwnProperty(i)) {
	                    requiredModules.push(i); 
	                }
	            } 
	        }
	        return requiredModules;
	};
}

function loadModules({modules, fn}) {
	var container = this;
	for (var i = 0; i < modules.length; i++) {
    		try {
    			fn(container.modules[modules[i]](container));
    		} catch(e) {
    			console.error({
				error: e, 
				module: modules[i],
				ContainerModules: container.modules,
				container
			});
    		}
    	}
}

/*--- __config.js ---*/

/*globals Container */

Container.modules.config = function(APP) {

	APP.require = function(modules) {
		if (modules.length === 1) {
	    		return APP[modules[0]];
	    	}
		
		return modules.reduce(function(moduleObject, nextModule) {
	    		moduleObject[nextModule] = APP[nextModule];
	       		return moduleObject;
	    	},{});
	};

	APP.set = function(name) {
		return function(object) {
			APP[name] = object;
			return;
		};
	};

	APP.start = function(modules) {
		return function(configuration) {
			modules.forEach(function(module) {
				APP.stage[module](configuration);
			});
		}
	};
	
	function setEnvironment(config) {
		if (config.environment === "debug" || config.environment === "remoteDebug" ) {
	   		console.warn("DEBUG mode ENABLED. API calls routed to localhost.");
	   	}

		APP.require(["url-provider"]).setEnvironment(config);
		return;
	}

	function startErrorReporter() {
		window.addEventListener("error", function(e) {
			var stack = e.error.stack;
			var message = e.error.toString();
			
			if (stack) {message += '\n' + stack;}
			console.error({message, stack});
		});
		return;
	}
	
	function start(args) {
		startErrorReporter();
		setEnvironment(args);
	}

	return {moduleName: "config", startFn: start};
};

/*--- __model.js ---*/

/*globals Container */

Container.modules.model = function({require, set}) {
	function Model(data){
                var modelData = data,
                model = {},
                eventManifest,
                componentList;

                model.init = function(manifest) {
                        eventManifest = manifest;
                };

                model.getManifest = function() {
                        return model.eventManifest;
                };

                model.update = function(event, args) {
                        return attempt(function() {
                              return broadcastUpdate(event, 
                                eventManifest[event].call(modelData, args));
                        /*push errors to error reporting module/service*/   
                        })();
                };

                model.registerComponents = function(componentArray) {
                        componentList = componentArray;
                };

                model.getComponentList = function() {
                        return componentList;
                };

                model.getModel = function() {
                        return modelData;
                };

                model.patch = function(patchObject) {
                    modelData = patchObject;
                    return;
                };

                function onErrorFn(error) {
                        console.log(error);
                } 

                function broadcastUpdate(event, args) {
                        componentList.forEach(function(component) {
                            component.update(model.getModel());
                        });        
                }
                
                function attempt(tryFn) {
                    return function(onErrorFn) {
                        if (!onErrorFn) {
                            try { return tryFn(); } catch(e) {}
                        } else {
                            try { return tryFn(); } catch(e) { 
                                return onErrorFn(e); 
                            }
                        }
                    };
                }

                return model;
	} 
	
	function start(args) {
		set("constructor-model")(Model);
		return;
	}

  	return {moduleName: "model", startFn: start};
};


/*--- core.ajax-provider.js ---*/

/*globals Container */

Container.modules["ajax-provider"] = function({require, set}) { 
	function onError(e) {
		console.error(e);
		return;
	}

	function ajaxProvider({url, data, method, async}) {
		console.log("preparing AJAX request...", {url, data, method, async});

		var promise = new Promise(function(resolve, reject) {
			$.ajax({
				url: url,
				data: data || null,
				method: method || "GET",
		  		success: function (data, status, response) { 
		  			resolve({data: data, 
						status: status, 
						response: response
					});
		  		},
		  		error: function (response, status, error) { 
		  			reject({response: response, 
		  				status: status,
		  				error: error
		  			}); 
		  		}
			});
		}).catch(onError);				
		return promise;
	}

	set("ajax-provider")(ajaxProvider);
	return
};


/*--- core.broadcast.js ---*/

/*globals Container */

Container.modules.broadcast = function({require, set}) { 
	var eventManifest = {};

	function sendNotifications(data) {
		return function(resultObj, eventName) {
			resultObj[eventName] = this[eventName](data);
			return resultObj;
		}
	}
	
	function notify(eventList) {
		return function(data) {
			return eventList.reduce(sendNotifications(data).bind(eventManifest), {});
		} 
	}


	function listen(eventArray) { 
		eventArray.forEach(function(eventObj) {
			eventManifest[eventObj.event] = eventObj.action;
		});
		return;
	}
	
	set("broadcast")({notify, listen});
};

/*--- core.events.js ---*/

/*globals Container */

Container.modules["core-events"] = function({require, set}) {
var $$$ = document.querySelectorAll.bind(document)

function navItemControl() {
	var navItems = Array.from($$$("body a.nav-link"));
	navItems.forEach(function(item) {
		item.addEventListener("click", function(e) {
			navItems.forEach(function(item) {
				item.classList.remove("active");
			});

			e.target.classList.add("active");
		});	
	});
	return;
}

function startCoreEventListeners() {
	navItemControl();
}

function start(args) {
	startCoreEventListeners();
}

return {moduleName: "core-events", startFn: start};

};

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
	//What if data response is null? Hmm...?//
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
			},
		music: function({data}) {
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

/*--- core.route-table.js ---*/

Container.modules["route-table"] = function({require, set}) {

var routeTable = [
	{
		path: "/",
		templateFilePath: "index.ejs",
		middleware: function() { 
			require(["router-middleware"])["/"]();
		},
		resolve: function() {
			return require(["resolve-map"]).fetchFeed("search");
		},
		controller: function(modules, data) {
			require(["start"])(["articles-feed"])(data);
		}
	},
	{
		path: "/article",
		templateFilePath: "article-view.ejs",
		middleware: function(){
			require(["router-middleware"])["/article"]();
		},
		resolve: require(["resolve-map"]).fetchResource({
			feedType: "search", 
			resource: "article"
		}),
		controller: function(modules, data) {
			
		}
	},
	{
		path: "/videos",
		templateFilePath: "videos-view.ejs",
		middleware: function() {
			require(["router-middleware"])["/videos"]()	
		},
		resolve: function() {
			return require(["resolve-map"]).fetchFeed("videos");
		},
		controller: function(modules, data) {
			require(["start"])(["videos-feed"])(data);
		}
	},
	{
		path: "/video",
		templateFilePath: "video-view.ejs",
		middleware: function() {
			require(["router-middleware"])["/video"]();
			window.scrollTo(0,0);
		},
		resolve: require(["resolve-map"]).fetchResource({
			feedType: "videos",
			resource: "videos"
		}),
		controller: function(data) {

		}
	},
	{
		path: "/music",
		templateFilePath: "tracks-view.ejs",
		middleware: function() {
			require(["router-middleware"])["/music"]();
			window.scrollTo(0,0);
		},
		resolve: function() {
			return require(["resolve-map"]).fetchFeed("music");
		}, 
		controller: function(modules, data) {
			require(["start"])(["music-feed"])(data);
		}
	}];

set("route-table")(routeTable);
return;

}
/*--- core.router-middleware.js ---*/

/*globals Container */

Container.modules["router-middleware"] = function({require, set}) {

var routeMap,
$$ = document.querySelector.bind(document);

function showHideHeaderBarChrome(action) {
	var headerChrome = [$$(".header-container-custom"),
	$$(".content-container.content-container-custom")
	];


	if (action === "hide") {
		headerChrome.forEach((element) => {
			element.dataset.currentView = "article";
		});
	} else {
		headerChrome.forEach((element) => {
			element.dataset.currentView = "null";
		});
	}
}


routeMap = {
	"/": function() {
		showHideHeaderBarChrome("show");
		return;

	},
	"/article": function() {
		showHideHeaderBarChrome("hide");
		return;
		
	},
	"/video": function() {
		showHideHeaderBarChrome("hide");
		return;
	},
	"/videos": function() {
		showHideHeaderBarChrome("show");
		return;
	},
	"/music": function() {
		showHideHeaderBarChrome("show");
		return;
	}
};

set("router-middleware")(routeMap);
return;

};

/*--- core.router-service.js ---*/

/* globals Container, EJS */

Container.modules["router-service"] = function({require, set}) {

	set("router-service")((function() {
		function render(route, container, require, params) {
			var timer = setTimeout(()=> { showLoading(); }, 2500);

			if (container && route.controller) {
				try { 
					loadRoute(route, container, timer, 
						require, params);	
				} catch (error) {
			    		console.error("ROUTER ERROR: ", error);
			    	}
			}
			return;
		}

		function renderTemplate(pathToPartial, containerId, templateData, middleware) {

			if (pathToPartial.includes("null")) { return; }

			if (middleware) { middleware(); }

			var template = new EJS({url: pathToPartial}).render(
			containerId, {data: templateData});
			document.getElementById(containerId).innerHTML = template;
			return;
		}

		function loadRoute(route, container, timer, require, params) {
			if ( typeof(route.resolve) !== "function" )  {
				executeRoute(route, container, require, timer);
				return;
			}

			route.resolve(params).then(function(data) {
				executeRoute(route, container, require, timer, data);
			}).catch((error) => {throw error;});
			return;
		}

		function executeRoute(route, container, require, timer, data) {
			renderTemplate(route.templateFilePath, container, data, route.middleware);
			route.controller(require(["stage"]), data);
			clearTimeout(timer);
			hideLoading();
			return;
		}

		function showLoading() {
			console.warn("LOADING...");
			return;
		}

		function hideLoading() {
			//console.warn("FINISHED LOADING.");
			return;
		}

		return {render};
	}()))
	
	return;
};
	

/*--- __router.js  
  * Configures and bootstraps the router. ---*/

/*globals Container */

Container.modules.router = function({require, set}) {
	
	function Router({routeTable, templateDirectory, templateEngine, middleware}) {
		var routes = {};

		function router() {
		 	var domContainer = "template-container",
		 	url = location.hash.slice(1) || "/",
		 	render = templateEngine.render,
		 	baseUrl = stripParams(url),
		 	params = getParams(url),
		 	route = routes[baseUrl];

		   	if (validateRoute(baseUrl) === false) { 	
			   	return;
		   	} else {
				render(route, domContainer, require, params, middleware);
			} 

			return;	
		}

		function regRoute(path, templateFilePath, controller, resolve, middleware, authRequired) {
			routes[path] = {	
				path: path,
				templateFilePath: templateDirectory + templateFilePath,
				controller: controller,
				resolve: resolve,
				middleware: middleware,
				authRequired: authRequired 
			};

			return;
		}
		
		function validateRoute(url) {
			if (routes[url] === undefined) {
			   	console.error("ROUTER ERROR: current route '" +
			   	url + "' not defined.");
			   	return false;
		   	}
		}

		function getParams(url) {
			var slicePt,
			queryStr,
			parsedParams = {};

			if (!url.includes('?')) { return false; } 

			slicePt = url.indexOf('?') + 1;
			queryStr = url.slice(slicePt);
			queryStr.split('&').forEach(function (qstr) {
				var slicePt = qstr.indexOf('=');
				parsedParams[qstr.slice(0, slicePt)] = qstr.slice(slicePt + 1);
			});
			return parsedParams;
		}

		function stripParams(url) {
			var strippedUrl,
			slicePt = url.indexOf('?');

			slicePt <= 0? strippedUrl = url : strippedUrl = url.slice(0, slicePt);
			
			return strippedUrl;
		}

		window.addEventListener("load", router);
		window.addEventListener("hashchange", router);  

		routeTable.forEach(function(route) {

			regRoute(route.path, 
				route.templateFilePath, 
				route.controller, 
				route.resolve,
				route.middleware,
				route.authRequired
			);
		});
		return; 
	}

	function start(args) {
		var routerSupport = require(["router-service", 
			"route-table"]);

		new Router({
			routeTable: routerSupport["route-table"],
			templateEngine: routerSupport["router-service"],
			templateDirectory: "./views/"
		});
	}

	return {moduleName: "router", startFn: start};
};



/*--- core.url-provider.js ---*/

/* globals Container */

Container.modules["url-provider"] = function({require, set}) { 
	var currentEnvironment,
	route,
	endpointMap = {
		article: "article",
		search: "trending-search",
		music: "trending-music",
		videos: "videos"
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

/*--- core.utils.js ---*/

/*globals Container */

Container.modules["utils"] = function({require, set}) { 
	
	function objectExtend(target) {
		var extObj,
		dupSourceObj;
		extObj = Object.keys(target).reduce(copyObject(target), {});

		function hasKeys(context) {
	      		return (function(element) {
	        		return this.includes(element);
	      		}).bind(context);
    		}

		function copyObject(context) {
			return (function(map, currVal) {
				map[currVal] = this[currVal];
				return map;
			}).bind(context);
		}

		return function(source) {
			dupSourceObj = Object.keys(source)
					.reduce(copyObject(source), {});

			return function(propsList) {
          			if(arguments.length !== 0) { 
           				Object.keys(dupSourceObj)
           				.filter(hasKeys(propsList))
              				.reduce(copyObject(
              					dupSourceObj), extObj);
          			} else {
            				//console.log("no args")
            				Object.keys(dupSourceObj)
            				.reduce(copyObject(
            					dupSourceObj), extObj);
          			}
          			return extObj;
        		};
      		};
	}

	function setCurrentNavLinkOnRefresh(hash) {
		var navItems = Array.from(document.querySelectorAll("body a.nav-link"));

		navItems.forEach(function(item) {
			if (item.getAttribute("href") === hash) {
				item.classList.add("active");
			} else {
				item.classList.remove("active");	
			}
		});
	}

	set("utils")({objectExtend, setCurrentNavLinkOnRefresh});
	return
};


/*! jQuery v2.1.1 -css,-css/addGetHookIf,-css/curCSS,-css/defaultDisplay,-css/hiddenVisibleSelectors,-css/support,-css/swap,-css/var/cssExpand,-css/var/getStyles,-css/var/isHidden,-css/var/rmargin,-css/var/rnumnonpx,-effects,-effects/Tween,-effects/animatedSelector,-dimensions,-offset,-deprecated,-event-alias,-wrap | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k={},l=a.document,m="2.1.1 -css,-css/addGetHookIf,-css/curCSS,-css/defaultDisplay,-css/hiddenVisibleSelectors,-css/support,-css/swap,-css/var/cssExpand,-css/var/getStyles,-css/var/isHidden,-css/var/rmargin,-css/var/rnumnonpx,-effects,-effects/Tween,-effects/animatedSelector,-dimensions,-offset,-deprecated,-event-alias,-wrap",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return n.each(this,a,b)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){return!n.isArray(a)&&a-parseFloat(a)>=0},isPlainObject:function(a){return"object"!==n.type(a)||a.nodeType||n.isWindow(a)?!1:a.constructor&&!j.call(a.constructor.prototype,"isPrototypeOf")?!1:!0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=l.createElement("script"),b.text=a,l.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=s(a);if(c){if(g){for(;f>e;e++)if(d=b.apply(a[e],c),d===!1)break}else for(e in a)if(d=b.apply(a[e],c),d===!1)break}else if(g){for(;f>e;e++)if(d=b.call(a[e],e,a[e]),d===!1)break}else for(e in a)if(d=b.call(a[e],e,a[e]),d===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:g.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=s(a),i=[];if(h)for(;g>f;f++)d=b(a[f],f,c),null!=d&&i.push(d);else for(f in a)d=b(a[f],f,c),null!=d&&i.push(d);return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(e=d.call(arguments,2),f=function(){return a.apply(b||this,e.concat(d.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:k}),n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=a.document.documentElement,u,v=t.matches||t.webkitMatchesSelector||t.mozMatchesSelector||t.oMatchesSelector||t.msMatchesSelector,w=function(a,b){if(a===b)return u=!0,0;var c=b.compareDocumentPosition&&a.compareDocumentPosition&&a.compareDocumentPosition(b);return c?1&c?a===l||n.contains(l,a)?-1:b===l||n.contains(l,b)?1:0:4&c?-1:1:a.compareDocumentPosition?-1:1};n.extend({find:function(a,b,c,d){var e,f,g=0;if(c=c||[],b=b||l,!a||"string"!=typeof a)return c;if(1!==(f=b.nodeType)&&9!==f)return[];if(d)while(e=d[g++])n.find.matchesSelector(e,a)&&c.push(e);else n.merge(c,b.querySelectorAll(a));return c},unique:function(a){var b,c=[],d=0,e=0;if(u=!1,a.sort(w),u){while(b=a[d++])b===a[d]&&(e=c.push(d));while(e--)a.splice(c[e],1)}return a},text:function(a){var b,c="",d=0,e=a.nodeType;if(e){if(1===e||9===e||11===e)return a.textContent;if(3===e||4===e)return a.nodeValue}else while(b=a[d++])c+=n.text(b);return c},contains:function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!c.contains(d))},isXMLDoc:function(a){return"HTML"!==(a.ownerDocument||a).documentElement.nodeName},expr:{attrHandle:{},match:{bool:/^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i,needsContext:/^[\x20\t\r\n\f]*[>+~]/}}}),n.extend(n.find,{matches:function(a,b){return n.find(a,null,null,b)},matchesSelector:function(a,b){return v.call(a,b)},attr:function(a,b){return a.getAttribute(b)}});var x=n.expr.match.needsContext,y=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,z=/^.[^:#\[\.,]*$/;function A(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(z.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return g.call(b,a)>=0!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(A(this,a||[],!1))},not:function(a){return this.pushStack(A(this,a||[],!0))},is:function(a){return!!A(this,"string"==typeof a&&x.test(a)?n(a):a||[],!1).length}});var B,C=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,D=n.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:C.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||B).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:l,!0)),y.test(c[1])&&n.isPlainObject(b))for(c in b)n.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}return d=l.getElementById(c[2]),d&&d.parentNode&&(this.length=1,this[0]=d),this.context=l,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?"undefined"!=typeof B.ready?B.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};D.prototype=n.fn,B=n(l);var E=/^(?:parents|prev(?:Until|All))/,F={children:!0,contents:!0,next:!0,prev:!0};n.extend({dir:function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=x.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.unique(f):f)},index:function(a){return a?"string"==typeof a?g.call(n(a),this[0]):g.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.unique(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function G(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return n.dir(a,"parentNode")},parentsUntil:function(a,b,c){return n.dir(a,"parentNode",c)},next:function(a){return G(a,"nextSibling")},prev:function(a){return G(a,"previousSibling")},nextAll:function(a){return n.dir(a,"nextSibling")},prevAll:function(a){return n.dir(a,"previousSibling")},nextUntil:function(a,b,c){return n.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return n.dir(a,"previousSibling",c)},siblings:function(a){return n.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return n.sibling(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(F[a]||n.unique(e),E.test(a)&&e.reverse()),this.pushStack(e)}});var H=/\S+/g,I={};function J(a){var b=I[a]={};return n.each(a.match(H)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?I[a]||J(a):n.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(b=a.memory&&l,c=!0,g=e||0,e=0,f=h.length,d=!0;h&&f>g;g++)if(h[g].apply(l[0],l[1])===!1&&a.stopOnFalse){b=!1;break}d=!1,h&&(i?i.length&&j(i.shift()):b?h=[]:k.disable())},k={add:function(){if(h){var c=h.length;!function g(b){n.each(b,function(b,c){var d=n.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&g(c)})}(arguments),d?f=h.length:b&&(e=c,j(b))}return this},remove:function(){return h&&n.each(arguments,function(a,b){var c;while((c=n.inArray(b,h,c))>-1)h.splice(c,1),d&&(f>=c&&f--,g>=c&&g--)}),this},has:function(a){return a?n.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],f=0,this},disable:function(){return h=i=b=void 0,this},disabled:function(){return!h},lock:function(){return i=void 0,b||k.disable(),this},locked:function(){return!i},fireWith:function(a,b){return!h||c&&!i||(b=b||[],b=[a,b.slice?b.slice():b],d?i.push(b):j(b)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return!!c}};return k},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&n.isFunction(a.promise)?e:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1)for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f;return f||g.resolveWith(k,c),g.promise()}});var K;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(K.resolveWith(l,[n]),n.fn.triggerHandler&&(n(l).triggerHandler("ready"),n(l).off("ready"))))}});function L(){l.removeEventListener("DOMContentLoaded",L,!1),a.removeEventListener("load",L,!1),n.ready()}n.ready.promise=function(b){return K||(K=n.Deferred(),"complete"===l.readyState?setTimeout(n.ready):(l.addEventListener("DOMContentLoaded",L,!1),a.addEventListener("load",L,!1))),K.promise(b)},n.ready.promise();var M=n.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)n.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f};n.acceptData=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function N(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=n.expando+Math.random()}N.uid=1,N.accepts=n.acceptData,N.prototype={key:function(a){if(!N.accepts(a))return 0;var b={},c=a[this.expando];if(!c){c=N.uid++;try{b[this.expando]={value:c},Object.defineProperties(a,b)}catch(d){b[this.expando]=c,n.extend(a,b)}}return this.cache[c]||(this.cache[c]={}),c},set:function(a,b,c){var d,e=this.key(a),f=this.cache[e];if("string"==typeof b)f[b]=c;else if(n.isEmptyObject(f))n.extend(this.cache[e],b);else for(d in b)f[d]=b[d];return f},get:function(a,b){var c=this.cache[this.key(a)];return void 0===b?c:c[b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=this.key(a),g=this.cache[f];if(void 0===b)this.cache[f]={};else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in g?d=[b,e]:(d=e,d=d in g?[d]:d.match(H)||[])),c=d.length;while(c--)delete g[d[c]]}},hasData:function(a){return!n.isEmptyObject(this.cache[a[this.expando]]||{})},discard:function(a){a[this.expando]&&delete this.cache[a[this.expando]]}};var O=new N,P=new N,Q=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,R=/([A-Z])/g;function S(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(R,"-$1").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:Q.test(c)?n.parseJSON(c):c}catch(e){}P.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return P.hasData(a)||O.hasData(a)},data:function(a,b,c){return P.access(a,b,c)},removeData:function(a,b){P.remove(a,b)},_data:function(a,b,c){return O.access(a,b,c)},_removeData:function(a,b){O.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=P.get(f),1===f.nodeType&&!O.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),S(f,d,e[d])));O.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){P.set(this,a)}):M(this,function(b){var c,d=n.camelCase(a);if(f&&void 0===b){if(c=P.get(f,a),void 0!==c)return c;if(c=P.get(f,d),void 0!==c)return c;if(c=S(f,d,void 0),void 0!==c)return c}else this.each(function(){var c=P.get(this,d);P.set(this,d,b),-1!==a.indexOf("-")&&void 0!==c&&P.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){P.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=O.get(a,b),c&&(!d||n.isArray(c)?d=O.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return O.get(a,c)||O.access(a,c,{empty:n.Callbacks("once memory").add(function(){O.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=O.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var T=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,U=/^(?:checkbox|radio)$/i;!function(){var a=l.createDocumentFragment(),b=a.appendChild(l.createElement("div")),c=l.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),k.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",k.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var V="undefined";k.focusinBubbles="onfocusin"in a;var W=/^key/,X=/^(?:mouse|pointer|contextmenu)|click/,Y=/^(?:focusinfocus|focusoutblur)$/,Z=/^([^.]*)(?:\.(.+)|)$/;function $(){return!0}function _(){return!1}function ab(){try{return l.activeElement}catch(a){}}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=O.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return typeof n!==V&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(H)||[""],j=b.length;while(j--)h=Z.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g,!1)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=O.hasData(a)&&O.get(a);if(r&&(i=r.events)){b=(b||"").match(H)||[""],j=b.length;while(j--)if(h=Z.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&(delete r.handle,O.remove(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,m,o,p=[d||l],q=j.call(b,"type")?b.type:b,r=j.call(b,"namespace")?b.namespace.split("."):[];if(g=h=d=d||l,3!==d.nodeType&&8!==d.nodeType&&!Y.test(q+n.event.triggered)&&(q.indexOf(".")>=0&&(r=q.split("."),q=r.shift(),r.sort()),k=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=r.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},e||!o.trigger||o.trigger.apply(d,c)!==!1)){if(!e&&!o.noBubble&&!n.isWindow(d)){for(i=o.delegateType||q,Y.test(i+q)||(g=g.parentNode);g;g=g.parentNode)p.push(g),h=g;h===(d.ownerDocument||l)&&p.push(h.defaultView||h.parentWindow||a)}f=0;while((g=p[f++])&&!b.isPropagationStopped())b.type=f>1?i:o.bindType||q,m=(O.get(g,"events")||{})[b.type]&&O.get(g,"handle"),m&&m.apply(g,c),m=k&&g[k],m&&m.apply&&n.acceptData(g)&&(b.result=m.apply(g,c),b.result===!1&&b.preventDefault());return b.type=q,e||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!n.acceptData(d)||k&&n.isFunction(d[q])&&!n.isWindow(d)&&(h=d[k],h&&(d[k]=null),n.event.triggered=q,d[q](),n.event.triggered=void 0,h&&(d[k]=h)),b.result}},dispatch:function(a){a=n.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(O.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(g.namespace))&&(a.handleObj=g,a.data=g.data,e=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(a.result=e)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!==this;i=i.parentNode||this)if(i.disabled!==!0||"click"!==a.type){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>=0:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||l,d=c.documentElement,e=c.body,a.pageX=b.clientX+(d&&d.scrollLeft||e&&e.scrollLeft||0)-(d&&d.clientLeft||e&&e.clientLeft||0),a.pageY=b.clientY+(d&&d.scrollTop||e&&e.scrollTop||0)-(d&&d.clientTop||e&&e.clientTop||0)),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=X.test(e)?this.mouseHooks:W.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new n.Event(f),b=d.length;while(b--)c=d[b],a[c]=f[c];return a.target||(a.target=l),3===a.target.nodeType&&(a.target=a.target.parentNode),g.filter?g.filter(a,f):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==ab()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===ab()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=n.extend(new n.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?n.event.trigger(e,null,b):n.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?$:_):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={isDefaultPrevented:_,isPropagationStopped:_,isImmediatePropagationStopped:_,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=$,a&&a.preventDefault&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=$,a&&a.stopPropagation&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=$,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!n.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),k.focusinBubbles||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a),!0)};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=O.access(d,b);e||d.addEventListener(a,c,!0),O.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=O.access(d,b)-1;e?O.access(d,b,e):(d.removeEventListener(a,c,!0),O.remove(d,b))}}}),n.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(g in a)this.on(g,b,c,a[g],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=_;else if(!d)return this;return 1===e&&(f=d,d=function(a){return n().off(a),f.apply(this,arguments)},d.guid=f.guid||(f.guid=n.guid++)),this.each(function(){n.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=_),this.each(function(){n.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}});var bb=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,cb=/<([\w:]+)/,db=/<|&#?\w+;/,eb=/<(?:script|style|link)/i,fb=/checked\s*(?:[^=]|=\s*.checked.)/i,gb=/^$|\/(?:java|ecma)script/i,hb=/^true\/(.*)/,ib=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,jb={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};jb.optgroup=jb.option,jb.tbody=jb.tfoot=jb.colgroup=jb.caption=jb.thead,jb.th=jb.td;function kb(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function lb(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function mb(a){var b=hb.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function nb(a,b){for(var c=0,d=a.length;d>c;c++)O.set(a[c],"globalEval",!b||O.get(b[c],"globalEval"))}function ob(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(O.hasData(a)&&(f=O.access(a),g=O.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}P.hasData(a)&&(h=P.access(a),i=n.extend({},h),P.set(b,i))}}function pb(a,b){var c=a.getElementsByTagName?a.getElementsByTagName(b||"*"):a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function qb(a,b){var c=b.nodeName.toLowerCase();"input"===c&&U.test(a.type)?b.checked=a.checked:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}n.extend({clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(k.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=pb(h),f=pb(a),d=0,e=f.length;e>d;d++)qb(f[d],g[d]);if(b)if(c)for(f=f||pb(a),g=g||pb(h),d=0,e=f.length;e>d;d++)ob(f[d],g[d]);else ob(a,h);return g=pb(h,"script"),g.length>0&&nb(g,!i&&pb(a,"script")),h},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,k=b.createDocumentFragment(),l=[],m=0,o=a.length;o>m;m++)if(e=a[m],e||0===e)if("object"===n.type(e))n.merge(l,e.nodeType?[e]:e);else if(db.test(e)){f=f||k.appendChild(b.createElement("div")),g=(cb.exec(e)||["",""])[1].toLowerCase(),h=jb[g]||jb._default,f.innerHTML=h[1]+e.replace(bb,"<$1></$2>")+h[2],j=h[0];while(j--)f=f.lastChild;n.merge(l,f.childNodes),f=k.firstChild,f.textContent=""}else l.push(b.createTextNode(e));k.textContent="",m=0;while(e=l[m++])if((!d||-1===n.inArray(e,d))&&(i=n.contains(e.ownerDocument,e),f=pb(k.appendChild(e),"script"),i&&nb(f),c)){j=0;while(e=f[j++])gb.test(e.type||"")&&c.push(e)}return k},cleanData:function(a){for(var b,c,d,e,f=n.event.special,g=0;void 0!==(c=a[g]);g++){if(n.acceptData(c)&&(e=c[O.expando],e&&(b=O.cache[e]))){if(b.events)for(d in b.events)f[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);O.cache[e]&&delete O.cache[e]}delete P.cache[c[P.expando]]}}}),n.fn.extend({text:function(a){return M(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=a)})},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=kb(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=kb(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?n.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||n.cleanData(pb(c)),c.parentNode&&(b&&n.contains(c.ownerDocument,c)&&nb(pb(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(pb(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return M(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!eb.test(a)&&!jb[(cb.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(bb,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(pb(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,n.cleanData(pb(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,l=this.length,m=this,o=l-1,p=a[0],q=n.isFunction(p);if(q||l>1&&"string"==typeof p&&!k.checkClone&&fb.test(p))return this.each(function(c){var d=m.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)});if(l&&(c=n.buildFragment(a,this[0].ownerDocument,!1,this),d=c.firstChild,1===c.childNodes.length&&(c=d),d)){for(f=n.map(pb(c,"script"),lb),g=f.length;l>j;j++)h=c,j!==o&&(h=n.clone(h,!0,!0),g&&n.merge(f,pb(h,"script"))),b.call(this[j],h,j);
if(g)for(i=f[f.length-1].ownerDocument,n.map(f,mb),j=0;g>j;j++)h=f[j],gb.test(h.type||"")&&!O.access(h,"globalEval")&&n.contains(i,h)&&(h.src?n._evalUrl&&n._evalUrl(h.src):n.globalEval(h.textContent.replace(ib,"")))}return this}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),g=e.length-1,h=0;g>=h;h++)c=h===g?this:this.clone(!0),n(e[h])[b](c),f.apply(d,c.get());return this.pushStack(d)}}),n.fn.delay=function(a,b){return a=n.fx?n.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a=l.createElement("input"),b=l.createElement("select"),c=b.appendChild(l.createElement("option"));a.type="checkbox",k.checkOn=""!==a.value,k.optSelected=c.selected,b.disabled=!0,k.optDisabled=!c.disabled,a=l.createElement("input"),a.value="t",a.type="radio",k.radioValue="t"===a.value}();var rb,sb,tb=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return M(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===V?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),d=n.attrHooks[b]||(n.expr.match.bool.test(b)?sb:rb)),void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=n.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void n.removeAttr(a,b))},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(H);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)},attrHooks:{type:{set:function(a,b){if(!k.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),sb={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=tb[b]||n.find.attr;tb[b]=function(a,b,d){var e,f;return d||(f=tb[b],tb[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,tb[b]=f),e}});var ub=/^(?:input|select|textarea|button)$/i;n.fn.extend({prop:function(a,b){return M(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g)return f=1!==g||!n.isXMLDoc(a),f&&(b=n.propFix[b]||b,e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){return a.hasAttribute("tabindex")||ub.test(a.nodeName)||a.href?a.tabIndex:-1}}}}),k.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var vb=/[\t\r\n\f]/g;n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h="string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(H)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(vb," "):" ")){f=0;while(e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=n.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0===arguments.length||"string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(H)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(vb," "):"")){f=0;while(e=b[f++])while(d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" "," ");g=a?n.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(n.isFunction(a)?function(c){n(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=n(this),f=a.match(H)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else(c===V||"boolean"===c)&&(this.className&&O.set(this,"__className__",this.className),this.className=this.className||a===!1?"":O.get(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(vb," ").indexOf(b)>=0)return!0;return!1}});var wb=/\r/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(wb,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a))}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(k.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(d.value,f)>=0)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>=0:void 0}},k.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var xb=n.now(),yb=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(a){var b,c;if(!a||"string"!=typeof a)return null;try{c=new DOMParser,b=c.parseFromString(a,"text/xml")}catch(d){b=void 0}return(!b||b.getElementsByTagName("parsererror").length)&&n.error("Invalid XML: "+a),b};var zb,Ab,Bb=/#.*$/,Cb=/([?&])_=[^&]*/,Db=/^(.*?):[ \t]*([^\r\n]*)$/gm,Eb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Fb=/^(?:GET|HEAD)$/,Gb=/^\/\//,Hb=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,Ib={},Jb={},Kb="*/".concat("*");try{Ab=location.href}catch(Lb){Ab=l.createElement("a"),Ab.href="",Ab=Ab.href}zb=Hb.exec(Ab.toLowerCase())||[];function Mb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(H)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function Nb(a,b,c,d){var e={},f=a===Jb;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function Ob(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function Pb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function Qb(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Ab,type:"GET",isLocal:Eb.test(zb[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":Kb,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?Ob(Ob(a,n.ajaxSettings),b):Ob(n.ajaxSettings,a)},ajaxPrefilter:Mb(Ib),ajaxTransport:Mb(Jb),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=n.ajaxSetup({},b),l=k.context||k,m=k.context&&(l.nodeType||l.jquery)?n(l):n.event,o=n.Deferred(),p=n.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!f){f={};while(b=Db.exec(e))f[b[1].toLowerCase()]=b[2]}b=f[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?e:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return c&&c.abort(b),x(0,b),this}};if(o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||Ab)+"").replace(Bb,"").replace(Gb,zb[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=n.trim(k.dataType||"*").toLowerCase().match(H)||[""],null==k.crossDomain&&(h=Hb.exec(k.url.toLowerCase()),k.crossDomain=!(!h||h[1]===zb[1]&&h[2]===zb[2]&&(h[3]||("http:"===h[1]?"80":"443"))===(zb[3]||("http:"===zb[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=n.param(k.data,k.traditional)),Nb(Ib,k,b,v),2===t)return v;i=k.global,i&&0===n.active++&&n.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!Fb.test(k.type),d=k.url,k.hasContent||(k.data&&(d=k.url+=(yb.test(d)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=Cb.test(d)?d.replace(Cb,"$1_="+xb++):d+(yb.test(d)?"&":"?")+"_="+xb++)),k.ifModified&&(n.lastModified[d]&&v.setRequestHeader("If-Modified-Since",n.lastModified[d]),n.etag[d]&&v.setRequestHeader("If-None-Match",n.etag[d])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+Kb+"; q=0.01":""):k.accepts["*"]);for(j in k.headers)v.setRequestHeader(j,k.headers[j]);if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t))return v.abort();u="abort";for(j in{success:1,error:1,complete:1})v[j](k[j]);if(c=Nb(Jb,k,b,v)){v.readyState=1,i&&m.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,c.send(r,x)}catch(w){if(!(2>t))throw w;x(-1,w)}}else x(-1,"No Transport");function x(a,b,f,h){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),c=void 0,e=h||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,f&&(u=Pb(k,v,f)),u=Qb(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(n.lastModified[d]=w),w=v.getResponseHeader("etag"),w&&(n.etag[d]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?o.resolveWith(l,[r,x,v]):o.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,i&&m.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),i&&(m.trigger("ajaxComplete",[v,k]),--n.active||n.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})};var Rb=/%20/g,Sb=/\[\]$/,Tb=/\r?\n/g,Ub=/^(?:submit|button|image|reset|file)$/i,Vb=/^(?:input|select|textarea|keygen)/i;function Wb(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||Sb.test(a)?d(a,e):Wb(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Wb(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Wb(c,a[c],b,e);return d.join("&").replace(Rb,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&Vb.test(this.nodeName)&&!Ub.test(a)&&(this.checked||!U.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(Tb,"\r\n")}}):{name:b.name,value:c.replace(Tb,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(a){}};var Xb=0,Yb={},Zb={0:200,1223:204},$b=n.ajaxSettings.xhr();a.ActiveXObject&&n(a).on("unload",function(){for(var a in Yb)Yb[a]()}),k.cors=!!$b&&"withCredentials"in $b,k.ajax=$b=!!$b,n.ajaxTransport(function(a){var b;return k.cors||$b&&!a.crossDomain?{send:function(c,d){var e,f=a.xhr(),g=++Xb;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)f.setRequestHeader(e,c[e]);b=function(a){return function(){b&&(delete Yb[g],b=f.onload=f.onerror=null,"abort"===a?f.abort():"error"===a?d(f.status,f.statusText):d(Zb[f.status]||f.status,f.statusText,"string"==typeof f.responseText?{text:f.responseText}:void 0,f.getAllResponseHeaders()))}},f.onload=b(),f.onerror=b("error"),b=Yb[g]=b("abort");try{f.send(a.hasContent&&a.data||null)}catch(h){if(b)throw h}},abort:function(){b&&b()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(d,e){b=n("<script>").prop({async:!0,charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&e("error"===a.type?404:200,a.type)}),l.head.appendChild(b[0])},abort:function(){c&&c()}}}});var _b=[],ac=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=_b.pop()||n.expando+"_"+xb++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(ac.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&ac.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(ac,"$1"+e):b.jsonp!==!1&&(b.url+=(yb.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,_b.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||l;var d=y.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=n.buildFragment([a],b,e),e&&e.length&&n(e).remove(),n.merge([],d.childNodes))};var bc=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&bc)return bc.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e,dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,f||[a.responseText,b,a])}),this},"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var cc=a.jQuery,dc=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=dc),b&&a.jQuery===n&&(a.jQuery=cc),n},typeof b===V&&(a.jQuery=a.$=n),n});
//# sourceMappingURL=jquery.min.map


(function(){var rsplit=function(string,regex){var result=regex.exec(string),retArr=new Array(),first_idx,last_idx,first_bit;while(result!=null){first_idx=result.index;last_idx=regex.lastIndex;if((first_idx)!=0){first_bit=string.substring(0,first_idx);retArr.push(string.substring(0,first_idx));string=string.slice(first_idx)}retArr.push(result[0]);string=string.slice(result[0].length);result=regex.exec(string)}if(!string==""){retArr.push(string)}return retArr},chop=function(string){return string.substr(0,string.length-1)},extend=function(d,s){for(var n in s){if(s.hasOwnProperty(n)){d[n]=s[n]}}};EJS=function(options){options=typeof options=="string"?{view:options}:options;this.set_options(options);if(options.precompiled){this.template={};this.template.process=options.precompiled;EJS.update(this.name,this);return }if(options.element){if(typeof options.element=="string"){var name=options.element;options.element=document.getElementById(options.element);if(options.element==null){throw name+"does not exist!"}}if(options.element.value){this.text=options.element.value}else{this.text=options.element.innerHTML}this.name=options.element.id;this.type="["}else{if(options.url){options.url=EJS.endExt(options.url,this.extMatch);this.name=this.name?this.name:options.url;var url=options.url;var template=EJS.get(this.name,this.cache);if(template){return template}if(template==EJS.INVALID_PATH){return null}try{this.text=EJS.request(url+(this.cache?"":"?"+Math.random()))}catch(e){}if(this.text==null){throw ({type:"EJS",message:"There is no template at "+url})}}}var template=new EJS.Compiler(this.text,this.type);template.compile(options,this.name);EJS.update(this.name,this);this.template=template};EJS.prototype={render:function(object,extra_helpers){object=object||{};this._extra_helpers=extra_helpers;var v=new EJS.Helpers(object,extra_helpers||{});return this.template.process.call(object,object,v)},update:function(element,options){if(typeof element=="string"){element=document.getElementById(element)}if(options==null){_template=this;return function(object){EJS.prototype.update.call(_template,element,object)}}if(typeof options=="string"){params={};params.url=options;_template=this;params.onComplete=function(request){var object=eval(request.responseText);EJS.prototype.update.call(_template,element,object)};EJS.ajax_request(params)}else{element.innerHTML=this.render(options)}},out:function(){return this.template.out},set_options:function(options){this.type=options.type||EJS.type;this.cache=options.cache!=null?options.cache:EJS.cache;this.text=options.text||null;this.name=options.name||null;this.ext=options.ext||EJS.ext;this.extMatch=new RegExp(this.ext.replace(/\./,"."))}};EJS.endExt=function(path,match){if(!path){return null}match.lastIndex=0;return path+(match.test(path)?"":this.ext)};EJS.Scanner=function(source,left,right){extend(this,{left_delimiter:left+"%",right_delimiter:"%"+right,double_left:left+"%%",double_right:"%%"+right,left_equal:left+"%=",left_comment:left+"%#"});this.SplitRegexp=left=="["?/(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/:new RegExp("("+this.double_left+")|(%%"+this.double_right+")|("+this.left_equal+")|("+this.left_comment+")|("+this.left_delimiter+")|("+this.right_delimiter+"\n)|("+this.right_delimiter+")|(\n)");this.source=source;this.stag=null;this.lines=0};EJS.Scanner.to_text=function(input){if(input==null||input===undefined){return""}if(input instanceof Date){return input.toDateString()}if(input.toString){return input.toString()}return""};EJS.Scanner.prototype={scan:function(block){scanline=this.scanline;regex=this.SplitRegexp;if(!this.source==""){var source_split=rsplit(this.source,/\n/);for(var i=0;i<source_split.length;i++){var item=source_split[i];this.scanline(item,regex,block)}}},scanline:function(line,regex,block){this.lines++;var line_split=rsplit(line,regex);for(var i=0;i<line_split.length;i++){var token=line_split[i];if(token!=null){try{block(token,this)}catch(e){throw {type:"EJS.Scanner",line:this.lines}}}}}};EJS.Buffer=function(pre_cmd,post_cmd){this.line=new Array();this.script="";this.pre_cmd=pre_cmd;this.post_cmd=post_cmd;for(var i=0;i<this.pre_cmd.length;i++){this.push(pre_cmd[i])}};EJS.Buffer.prototype={push:function(cmd){this.line.push(cmd)},cr:function(){this.script=this.script+this.line.join("; ");this.line=new Array();this.script=this.script+"\n"},close:function(){if(this.line.length>0){for(var i=0;i<this.post_cmd.length;i++){this.push(pre_cmd[i])}this.script=this.script+this.line.join("; ");line=null}}};EJS.Compiler=function(source,left){this.pre_cmd=["var ___ViewO = [];"];this.post_cmd=new Array();this.source=" ";if(source!=null){if(typeof source=="string"){source=source.replace(/\r\n/g,"\n");source=source.replace(/\r/g,"\n");this.source=source}else{if(source.innerHTML){this.source=source.innerHTML}}if(typeof this.source!="string"){this.source=""}}left=left||"<";var right=">";switch(left){case"[":right="]";break;case"<":break;default:throw left+" is not a supported deliminator";break}this.scanner=new EJS.Scanner(this.source,left,right);this.out=""};EJS.Compiler.prototype={compile:function(options,name){options=options||{};this.out="";var put_cmd="___ViewO.push(";var insert_cmd=put_cmd;var buff=new EJS.Buffer(this.pre_cmd,this.post_cmd);var content="";var clean=function(content){content=content.replace(/\\/g,"\\\\");content=content.replace(/\n/g,"\\n");content=content.replace(/"/g,'\\"');return content};this.scanner.scan(function(token,scanner){if(scanner.stag==null){switch(token){case"\n":content=content+"\n";buff.push(put_cmd+'"'+clean(content)+'");');buff.cr();content="";break;case scanner.left_delimiter:case scanner.left_equal:case scanner.left_comment:scanner.stag=token;if(content.length>0){buff.push(put_cmd+'"'+clean(content)+'")')}content="";break;case scanner.double_left:content=content+scanner.left_delimiter;break;default:content=content+token;break}}else{switch(token){case scanner.right_delimiter:switch(scanner.stag){case scanner.left_delimiter:if(content[content.length-1]=="\n"){content=chop(content);buff.push(content);buff.cr()}else{buff.push(content)}break;case scanner.left_equal:buff.push(insert_cmd+"(EJS.Scanner.to_text("+content+")))");break}scanner.stag=null;content="";break;case scanner.double_right:content=content+scanner.right_delimiter;break;default:content=content+token;break}}});if(content.length>0){buff.push(put_cmd+'"'+clean(content)+'")')}buff.close();this.out=buff.script+";";var to_be_evaled="/*"+name+"*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {"+this.out+" return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";try{eval(to_be_evaled)}catch(e){if(typeof JSLINT!="undefined"){JSLINT(this.out);for(var i=0;i<JSLINT.errors.length;i++){var error=JSLINT.errors[i];if(error.reason!="Unnecessary semicolon."){error.line++;var e=new Error();e.lineNumber=error.line;e.message=error.reason;if(options.view){e.fileName=options.view}throw e}}}else{throw e}}}};EJS.config=function(options){EJS.cache=options.cache!=null?options.cache:EJS.cache;EJS.type=options.type!=null?options.type:EJS.type;EJS.ext=options.ext!=null?options.ext:EJS.ext;var templates_directory=EJS.templates_directory||{};EJS.templates_directory=templates_directory;EJS.get=function(path,cache){if(cache==false){return null}if(templates_directory[path]){return templates_directory[path]}return null};EJS.update=function(path,template){if(path==null){return }templates_directory[path]=template};EJS.INVALID_PATH=-1};EJS.config({cache:true,type:"<",ext:".ejs"});EJS.Helpers=function(data,extras){this._data=data;this._extras=extras;extend(this,extras)};EJS.Helpers.prototype={view:function(options,data,helpers){if(!helpers){helpers=this._extras}if(!data){data=this._data}return new EJS(options).render(data,helpers)},to_text:function(input,null_text){if(input==null||input===undefined){return null_text||""}if(input instanceof Date){return input.toDateString()}if(input.toString){return input.toString().replace(/\n/g,"<br />").replace(/''/g,"'")}return""}};EJS.newRequest=function(){var factories=[function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new XMLHttpRequest()},function(){return new ActiveXObject("Microsoft.XMLHTTP")}];for(var i=0;i<factories.length;i++){try{var request=factories[i]();if(request!=null){return request}}catch(e){continue}}};EJS.request=function(path){var request=new EJS.newRequest();request.open("GET",path,false);try{request.send(null)}catch(e){return null}if(request.status==404||request.status==2||(request.status==0&&request.responseText=="")){return null}return request.responseText};EJS.ajax_request=function(params){params.method=(params.method?params.method:"GET");var request=new EJS.newRequest();request.onreadystatechange=function(){if(request.readyState==4){if(request.status==200){params.onComplete(request)}else{params.onComplete(request)}}};request.open(params.method,params.url);request.send(null)}})();EJS.Helpers.prototype.date_tag=function(C,O,A){if(!(O instanceof Date)){O=new Date()}var B=["January","February","March","April","May","June","July","August","September","October","November","December"];var G=[],D=[],P=[];var J=O.getFullYear();var H=O.getMonth();var N=O.getDate();for(var M=J-15;M<J+15;M++){G.push({value:M,text:M})}for(var E=0;E<12;E++){D.push({value:(E),text:B[E]})}for(var I=0;I<31;I++){P.push({value:(I+1),text:(I+1)})}var L=this.select_tag(C+"[year]",J,G,{id:C+"[year]"});var F=this.select_tag(C+"[month]",H,D,{id:C+"[month]"});var K=this.select_tag(C+"[day]",N,P,{id:C+"[day]"});return L+F+K};EJS.Helpers.prototype.form_tag=function(B,A){A=A||{};A.action=B;if(A.multipart==true){A.method="post";A.enctype="multipart/form-data"}return this.start_tag_for("form",A)};EJS.Helpers.prototype.form_tag_end=function(){return this.tag_end("form")};EJS.Helpers.prototype.hidden_field_tag=function(A,C,B){return this.input_field_tag(A,C,"hidden",B)};EJS.Helpers.prototype.input_field_tag=function(A,D,C,B){B=B||{};B.id=B.id||A;B.value=D||"";B.type=C||"text";B.name=A;return this.single_tag_for("input",B)};EJS.Helpers.prototype.is_current_page=function(A){return(window.location.href==A||window.location.pathname==A?true:false)};EJS.Helpers.prototype.link_to=function(B,A,C){if(!B){var B="null"}if(!C){var C={}}if(C.confirm){C.onclick=' var ret_confirm = confirm("'+C.confirm+'"); if(!ret_confirm){ return false;} ';C.confirm=null}C.href=A;return this.start_tag_for("a",C)+B+this.tag_end("a")};EJS.Helpers.prototype.submit_link_to=function(B,A,C){if(!B){var B="null"}if(!C){var C={}}C.onclick=C.onclick||"";if(C.confirm){C.onclick=' var ret_confirm = confirm("'+C.confirm+'"); if(!ret_confirm){ return false;} ';C.confirm=null}C.value=B;C.type="submit";C.onclick=C.onclick+(A?this.url_for(A):"")+"return false;";return this.start_tag_for("input",C)};EJS.Helpers.prototype.link_to_if=function(F,B,A,D,C,E){return this.link_to_unless((F==false),B,A,D,C,E)};EJS.Helpers.prototype.link_to_unless=function(E,B,A,C,D){C=C||{};if(E){if(D&&typeof D=="function"){return D(B,A,C,D)}else{return B}}else{return this.link_to(B,A,C)}};EJS.Helpers.prototype.link_to_unless_current=function(B,A,C,D){C=C||{};return this.link_to_unless(this.is_current_page(A),B,A,C,D)};EJS.Helpers.prototype.password_field_tag=function(A,C,B){return this.input_field_tag(A,C,"password",B)};EJS.Helpers.prototype.select_tag=function(D,G,H,F){F=F||{};F.id=F.id||D;F.value=G;F.name=D;var B="";B+=this.start_tag_for("select",F);for(var E=0;E<H.length;E++){var C=H[E];var A={value:C.value};if(C.value==G){A.selected="selected"}B+=this.start_tag_for("option",A)+C.text+this.tag_end("option")}B+=this.tag_end("select");return B};EJS.Helpers.prototype.single_tag_for=function(A,B){return this.tag(A,B,"/>")};EJS.Helpers.prototype.start_tag_for=function(A,B){return this.tag(A,B)};EJS.Helpers.prototype.submit_tag=function(A,B){B=B||{};B.type=B.type||"submit";B.value=A||"Submit";return this.single_tag_for("input",B)};EJS.Helpers.prototype.tag=function(C,E,D){if(!D){var D=">"}var B=" ";for(var A in E){if(E[A]!=null){var F=E[A].toString()}else{var F=""}if(A=="Class"){A="class"}if(F.indexOf("'")!=-1){B+=A+'="'+F+'" '}else{B+=A+"='"+F+"' "}}return"<"+C+B+D};EJS.Helpers.prototype.tag_end=function(A){return"</"+A+">"};EJS.Helpers.prototype.text_area_tag=function(A,C,B){B=B||{};B.id=B.id||A;B.name=B.name||A;C=C||"";if(B.size){B.cols=B.size.split("x")[0];B.rows=B.size.split("x")[1];delete B.size}B.cols=B.cols||50;B.rows=B.rows||4;return this.start_tag_for("textarea",B)+C+this.tag_end("textarea")};EJS.Helpers.prototype.text_tag=EJS.Helpers.prototype.text_area_tag;EJS.Helpers.prototype.text_field_tag=function(A,C,B){return this.input_field_tag(A,C,"text",B)};EJS.Helpers.prototype.url_for=function(A){return'window.location="'+A+'";'};EJS.Helpers.prototype.img_tag=function(B,C,A){A=A||{};A.src=B;A.alt=C;return this.single_tag_for("img",A)}

/*--- module.articles-feed.js ---*/

/*globals Container */

Container.modules["articles-feed"] = function({require, set}) {
	var Model,
	articlesList,
	broadcast = require(["broadcast"]),
	eventList = [
		{event: "check-has-search-feed", action: checkHasFeed},
		{event: "get-cached-search-feed", action: getCachedFeed},
		{event: "get-search-feed-item", action: findFeedItem}
	];

	function findFeedItem(id) {
		var item = articlesList.getModel()[id];
		
		function getURL() {
			return item["ht:news_item"][0]["ht:news_item_url"][0];
		}

		function getALL() {
			return item;
		}

		return {getURL, getALL}
	}

	function checkHasFeed(args) {
		return articlesList.getModel().length !== 0;
	}

	function getCachedFeed() {
		return articlesList.getModel();
	}

	function start(currentFeed) {
		Model = require(["constructor-model"]);
		articlesList = new Model(currentFeed);
		broadcast.listen(eventList);
		return;
	}

	return {moduleName: "articles-feed", startFn: start};
};

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
	
	function findFeedItem(id) {
		var item = videosList.getModel()[id];
		return item;
	}

	function checkHasFeed(args) {
		return videosList.getModel().length !== 0;
	}

	function getCachedFeed() {
		return videosList.getModel();
	}

	function start(currentFeed) {
		require(["utils"]).setCurrentNavLinkOnRefresh(window.location.hash);
		Model = require(["constructor-model"]);
		videosList = new Model(currentFeed);
		broadcast.listen(eventList);
		window.scrollTo(0,0);
		return;
	}

	return {moduleName: "videos-feed", startFn: start};
};


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
		//require(["start"])(["player"])(tracksList);
		broadcast.listen(eventList);
		window.scrollTo(0,0);
		return;
	}

	return {moduleName: "music-feed", startFn: start};
};

/*--- module.player.js ---*/

/*globals Container */

Container.modules["player"] = function({require, set}) {
	var templateContainer = document.querySelector("#template-container"),
	loadedTracks = {},
	currentTrack;

	function addTrack({trackId, currentTrack}) {
		loadedTracks[trackId] = currentTrack;
		return;
	}

	function checkPauseState() {
		return currentTrack.paused
	}

	function createTrack(trackId) {
		return function(playlist) {
			try { 
				currentTrack.pause() 
				console.log(currentTrack.paused);

			} catch(e) {
				currentTrack = new Audio(playlist[trackId].preview_url);
				addTrack({trackId, currentTrack});
				currentTrack.play();
			}
		}
	}

	function onClickPlayButton(playlist) {
		return function({target}) {
			if (target.dataset.trackId) {
				createTrack(target.dataset.trackId)(playlist);
			}
		}
	}

	function start(playlist) {
		templateContainer.addEventListener("click", onClickPlayButton(playlist.getModel()));
		return;
	}

	return {moduleName: "player", startFn: start};
}; 
/*--- start.js ---*/

/* globals Container */

new Container(["*"], function start(APP) {
	APP.start(["config", "router", "model", "core-events"])({
		environment: "debug",
		remoteDebug: false,
		routeMap: {
			debug: "http://localhost:8080/",
			remoteDebug: "http://192.168.254.4:8080/",
			production: "https://kronkite-server.herokuapp.com/"
		}	
	});
});

