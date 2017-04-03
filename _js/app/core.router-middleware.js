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
