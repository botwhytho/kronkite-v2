/*--- start.js ---*/

new Application(function(container) {
	console.log("starting new application...")
	
	container.get("module-loader").start(["router"]);
});

