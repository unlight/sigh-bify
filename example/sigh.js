var merge, glob, concat, write, env, pipeline, select, reject;
var bify;

module.exports = function(pipelines) {

	pipelines.explicit["source"] = [
		glob("app.js"),
		bify(require("./bundle3.js")),
		write("dist")
	];
};