sigh-bify
=========

[![Greenkeeper badge](https://badges.greenkeeper.io/unlight/sigh-bify.svg)](https://greenkeeper.io/)
sigh-plugin for browserify.

INSTALL
-------
```js
npm i sigh-bify --save-dev
```
Also, you need install `browserify` and `watchify` if you are going to use sigh in watch mode:
```js
npm i sigh-bify browserify watchify --save-dev
```

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
Optional: Yes  

    * `path`  
    Type: String  
    Bundle file path. 
    If not specified will be taken from first file from glob stream.

TODO
----
* handle adding removing
* handle factor-bundle plugin