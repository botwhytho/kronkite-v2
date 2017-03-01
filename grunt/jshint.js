module.exports = {
		options: {
			browser: true,
			devel: true,
			esversion: 6,
			jquery: true,
			reporter: require('jshint-stylish'),
			undef: true
		},
		js: ["./_js/app/**.js",
			"./_js/feature-articles-feed/**",
			"./_js/start.js"
		]
			
}