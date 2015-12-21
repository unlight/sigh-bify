var browserify = require("browserify");
var MemoryStream = require("memory-stream");

var b = browserify({
	debug: true,
	bundleExternal: false,
	entries: [],
	packageCache: {},
	cache: {}
});

module.exports = b;