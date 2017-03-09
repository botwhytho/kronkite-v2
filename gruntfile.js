module.exports = function (grunt) {
	require("load-grunt-config")(grunt);
	require("time-grunt")(grunt);

	grunt.registerTask("STAGE", [
		"cssmin:pre-audit",
		"uncss",
		"cssmin:post-audit",
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
