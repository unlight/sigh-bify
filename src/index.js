import _ from "lodash";
import Promise from "bluebird";
import {log, Bacon, Event} from "sigh-core";
import Browserify from "browserify";
import convert from "convert-source-map";
import get from "lodash.get";

export default function(op, b, options = {}) {
	
	b = get(options, "browserify", b);
	if (b instanceof Browserify === false) throw new Error("Expected browserify object.");

	var events = [];

	b.on("sigh.data", e => {
		var {path, contents} = e;
		var type = "add";
		var initPhase = true;
		// TODO: Log.
		// log(`${type} ${path}`);
		var sourceMap = convert
			.fromSource(contents)
			.toObject();
		var data = convert.removeComments(contents);
		var event = new Event({
			type, initPhase, path, data, sourceMap,
			createTime: new Date()
		});
		events.push(event);
	});

	var onBundleStreamEnd;
	b.on("bundle", bundleStream => {
		bundleStream.on("end", () => onBundleStreamEnd(events));
	});
	
	var stream = Bacon.fromCallback(callback => onBundleStreamEnd = callback);

	// TODO: Handle op.watch
	b.bundle();

	return stream.take(1);
}