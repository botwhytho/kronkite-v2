/*--- core.router-middleware.js ---*/

Application.CORE["router-middleware"] = (function(CORE) {

	var routeMap,
	$$ = document.querySelector.bind(document);
	
	function showHideHeaderBarChrome(action) {
		var headerChrome = [$$(".header-container-custom"),
		$$(".content-container.content-container-custom")];

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
			
		}
	}

	return routeMap;


}).call(null, Application.CORE)