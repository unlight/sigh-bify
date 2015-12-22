var browserify = require("browserify");

var b = browserify({
	debug: true,
	bundleExternal: false,
	entries: [],
	packageCache: {},
	cache: {}
});

// Add plugins here.

module.exports = b;