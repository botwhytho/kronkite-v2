module.exports = {
		options: {
			browser: true,
			devel: true,
			esversion: 6,
			jquery: true,
			reporter: require('jshint-stylish'),
			undef: true
		},
		js: ['./_js/_base/**.js',
			'./_js/_core/**.js',
			'./_js/start.js'
		]
			
}