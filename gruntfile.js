module.exports = function (grunt) {
	require("load-grunt-config")(grunt);
	require("time-grunt")(grunt);

	grunt.registerTask("STAGE", [
		"cssmin",
		"concat",
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
