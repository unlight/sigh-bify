import {get, first, once} from "lodash";
import Promise from "bluebird";
import {log, Bacon, Event} from "sigh-core";
import Browserify from "browserify";
import convert from "convert-source-map";
// import {mapEvents} from "sigh-core/lib/stream";
import {EventEmitter} from "events";

export default function(op, b, options = {}) {
	
	if (!options.browserify) {
		options.browserify = b;
	}
	b = get(options, "browserify");
	if (!(b instanceof Browserify)) throw new Error("Expected browserify object.");

	var stream;
	var filePath = get(options, "path");
	var addFilesOnce = once(addFiles);

	stream = op.stream
		.flatMapLatest(events => {
			addFilesOnce(events);
			return Bacon.fromPromise(bundle("add"));
		});

	if (op.watch) {
		var updater = new EventEmitter();
		var watchify = require("watchify");
		b.plugin(watchify);
		b.on("update", () => {
			bundle("change").then(events => updater.emit("data", events));
		});
		b.on("log", log);
		stream = stream.take(1).concat(Bacon.fromEvent(updater, "data"));
	}

	return stream;

	function addFiles(events) {
		if (!filePath) {
			var file = first(events);
			filePath = get(file, "path", "app.js");
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
		return new Promise((resolve, reject) => {
			b.bundle(function bundleHandler(err, buffer) {
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
			});
		});
	}
}