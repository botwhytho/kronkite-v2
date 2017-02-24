new Application(function(container) {
	console.log("starting new application...")
	
	container.get("module-loader").startALL();
});

