module.exports = function (grunt) {
	require("load-grunt-config")(grunt);
	require("time-grunt")(grunt);

	grunt.registerTask("STAGE", [
		"concat",
		"cssmin",
		"copy"
		]); 
	grunt.registerTask("BUILD", [
		"cssmin",
		"browserify",
		"concat",
		"uglify",
		"copy",
		]);
};
