var browserify = require("browserify");
var MemoryStream = require("memory-stream");

var b = browserify({
	debug: true,
	bundleExternal: false,
	entries: ["./example-app.js"],
	require: ["os", "path"],
	packageCache: {},
	cache: {}
});

var appStream = new MemoryStream();
appStream.on("finish", function() {
	b.emit("sigh.data", {
		path: "app.js",
		contents: appStream.toString()
	});
});

b.plugin("factor-bundle", {
	outputs: [appStream]
});

// if (true) {
// 	var watchify = require("watchify");
// 	bundler.plugin(watchify);
// }

b.on("update", b.bundle.bind(b));

b.on("bundle", function (bundleStream) {
	var vendorStream = new MemoryStream();
	bundleStream.pipe(vendorStream);
	vendorStream.on("finish", function() {
		b.emit("sigh.data", {
			path: "vendors.js",
			contents: vendorStream.toString()
		});
	});
});

module.exports = b;