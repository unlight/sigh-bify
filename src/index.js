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

	var transformEvent = (e) => {
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
	};

	b.on("sigh.event", transformEvent);

	if (op.watch) {
		var watchify = require("watchify");
		b.plugin(watchify);
		b.on("reset", () => events = []);
		b.on("update", () => b.bundle());
		b.on("log", log);
		b.on("sigh.event", () => {
			// TODO: get rid of repeated.
			b.emit("sigh.events", events);
		});
	}

	var stream = Bacon.fromPromise(new Promise(function(resolve, reject) {
		var bundleStream = b.bundle();
		bundleStream.on("end", () => {
			resolve(events);
		});
	}));

	if (!op.watch) {
		return stream;
	}
	var updates = Bacon.fromEvent(b, "sigh.events", (events) => [new Bacon.Next(events), new Bacon.End()]);
	return Bacon.mergeAll(stream, updates);
		
}