sigh-bify
=========
sigh-plugin for browserify.

USAGE
-----
```js
var merge, glob, concat, write, env, pipeline;
var bify;
module.exports = function(pipelines) {
	var b = browserify();
	pipelines["build"] = [
		glob({basePath: "src"}, "app.js"),
		bify(b),
		write("dist")
	];
};
```

API
---
```js
bify(b, options)
```

* `b`  
Browserify instance.  
Type: Browserify  
Required: Yes  

* `options`  
Options.  
Type: Object  
Required: No  

    * `path` (string)  
    Bundle file path. 
    If not specified will be taken from first file from glob stream.