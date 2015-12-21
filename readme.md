# sigh-bify
sigh-plugin for browserify.

```js
module.exports = function(pipelines) {

	var b = browserify();

	pipelines["build"] = [
		glob({basePath: "src"}, "app.js"),
		bify(b),
		write("dist")
	];
};
```