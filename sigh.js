var glob, babel, write, pipeline, debounce, mocha;
var debug;

module.exports = function(pipelines) {
    
    pipelines["source"] = [
        glob({ basePath: "src" }, "**/*.js"),
        babel({ modules: "common" }),
        write("lib")
    ];

    pipelines["tests"] = [
        pipeline("source"),
        debounce(800),
        pipeline({ activate: true }, "mocha")
    ];

    pipelines.alias["build"] = ["source", "tests"];

    pipelines.explicit["mocha"] = [
        mocha({ files: "lib/test/**/*.spec.js" })
    ];
};