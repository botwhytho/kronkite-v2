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
