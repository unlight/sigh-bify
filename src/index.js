import _ from "lodash";
import Promise from "bluebird";
import {log, Bacon, Event} from "sigh-core";
import Browserify from "browserify";
import convert from "convert-source-map";
import {mapEvents} from "sigh-core/lib/stream";

export default function(op, b, options) {

	b = _.get(options, "browserify", b);
	if (b instanceof Browserify === false) throw new Error("Expected browserify object.");

	var filePath;
	return op.stream.flatMap(function(events) {
		var file = _.first(events);
		filePath = _.get(file, "path", "app.js");
		var files = _.pluck(events, "path");
	}).flatMapLatest(function() {
		return Bacon.fromPromise(new Promise(function(resolve, reject) {
			b.bundle(function(err, buffer) {
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
			});
		}));
	});

}