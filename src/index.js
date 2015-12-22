import _ from "lodash";
import Promise from "bluebird";
import {log, Bacon, Event} from "sigh-core";
import Browserify from "browserify";
import convert from "convert-source-map";
import {mapEvents} from "sigh-core/lib/stream";
import {join as pjoin} from "path";

export default function(op, b, options) {

	b = _.get(options, "browserify", b);
	if (b instanceof Browserify === false) throw new Error("Expected browserify object.");

	var stream;
	var filePath = _.get(options, "path");

	stream = op.stream
		.flatMap(addFiles)
		.flatMapLatest(() => Bacon.fromPromise(bundle("add")));

	if (op.watch) {
		var watchify = require("watchify");
		b.plugin(watchify);
		var bus = new Bacon.Bus();
		b.on("update", () => {
			bundle("change").then(events => {
				bus.push(events);
			});
		});
		b.on("log", log);
		stream = Bacon.mergeAll(stream, bus);
	}

	return stream;

	function addFiles(events) {
		var file = _.first(events);
		if (!filePath) {
			filePath = _.get(file, "path", "app.js");
			if (file) {
				var basePath = file.basePath;
				if (filePath.indexOf(basePath) === 0) {
					filePath = filePath.slice(basePath.length + 1);
				}
			}
		}
		events.forEach(event => {
			b.add(event.path);
		});
	}

	function bundle(type) {
		return new Promise(function(resolve, reject) {
			b.bundle(bundleHandler);
			function bundleHandler(err, buffer) {
				if (err) {
					return reject(err);
				}
				if (!type) type = "add";
				var contents = buffer.toString();
				var sourceMap = convert.fromSource(contents);
				if (sourceMap) {
					sourceMap = sourceMap.toObject();
				}
				var data = convert.removeComments(contents);
				var event = new Event({
					type, data, sourceMap,
					path: filePath,
					createTime: new Date()
				});
				resolve([event]);
			}
		});
	}
}