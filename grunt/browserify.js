module.exports = {
	dist: {
            options: {
               transform: [
                  ["babelify", {loose: "all"}]
               ]
            },
            files: { 
               "./dist/js/kronkite.js": ["./_js/start.js",
               "./_js/_base/**.js",
               "./_js/_core/**.js"
               ]
            }
	}
}