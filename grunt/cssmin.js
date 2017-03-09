module.exports = {
	"pre-audit": { 
		files: {
			"./_css/kronkite-temp.css": [
				"./_css/clarity-ui/clarity-ui.min.css",
				"./_css/custom.css"
			]
		} 
	},
	"post-audit": {
		files: {
			"./dist/css/kronkite.css": [
				"./_css/kronkite-temp.css",
				"./_css/dynamic.css"
			]
		}
	}
}
