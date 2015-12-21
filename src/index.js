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

	var filePath;
	var stream = op.stream.flatMap(addFiles)
		.flatMapLatest(updateBundle);

	return stream;

	function addFiles(events) {
		var file = _.first(events);
		filePath = _.get(file, "path", "app.js");
		if (file) {
			var basePath = file.basePath;
			if (filePath.indexOf(basePath) === 0) {
				filePath = filePath.slice(basePath.length + 1);
			}
		}
		var files = _.map(events, event => {
			var result = event.path;
			if (event.basePath) {
				result = pjoin(event.basePath, result);
			}
			return result;
		});
		b.add(files);
	}

	function updateBundle() {
		return Bacon.fromPromise(new Promise(function(resolve, reject) {
			b.bundle(bundleHandler);

			function bundleHandler(err, buffer) {
				if (err) {
					return reject(err);
				}
				var type = "add";
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
		}));
	}
}