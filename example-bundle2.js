var browserify = require("browserify");
var MemoryStream = require("memory-stream");

var b = browserify({
	debug: true,
	bundleExternal: false,
	entries: ["./example-app.js"],
	packageCache: {},
	cache: {}
});

b.on("bundle", function (bundleStream) {
	var appStream = new MemoryStream();
	bundleStream.pipe(appStream);
	appStream.on("finish", function() {
		b.emit("sigh.event", {
			path: "app.js",
			contents: appStream.toString()
		});
	});
});

module.exports = b;