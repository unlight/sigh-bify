import _ from "lodash";
import Event from "sigh/lib/Event";
import Promise from "bluebird";
import {Bacon} from "sigh-core";
// import ProcessPool from 'process-pool'
import {expect} from "chai";
import Browserify from "browserify";
import plugin from "../";

require("source-map-support").install();

describe("sigh-bify", function () {
	
	var createBrowserify = () => {
		var exampleBrowserifyFile = require.resolve("../example/bundle.js");
		delete require.cache[exampleBrowserifyFile];
		return require(exampleBrowserifyFile);
	};
	var emptyStream = Bacon.constant([]);
	var event = new Event({
		basePath: "",
		path: "app.js",
		type: "add",
		data: "var x;"
	});
	var stream = Bacon.constant([event]);
	
	it("exists", () => {
		expect(plugin).to.be.ok;
	});

	it("should throw error (expected browserify)", () => {
		var fn = plugin.bind(plugin, {stream: emptyStream});
		expect(fn).to.throw(Error);
	});

	it("should be created without error", () => {
		var browserify = require("browserify")();
		plugin({stream: emptyStream}, browserify);
	});

	it("should be saved with name main", () => {
		var s = plugin({stream}, createBrowserify(), {path: "main.js"});
		s.onValue(function(events) {
			var path = _.get(events, "0.path");
			expect(path).to.eq("main.js");
		});
	});

	it("should emit something", (done) => {
		var s = plugin({stream}, createBrowserify());
		s.onEnd(done);
	});

	it("should watch correct", (done) => {
		var b = createBrowserify();
		var s = plugin({stream: emptyStream, watch: true}, b);
		s.onValue(function(events) {
			var type = _.get(events, "0.type");
			if (type === "change") done();
		});
		b.emit("update");
	});

	it.skip("should initialized once", function() {
		// how to test it?
		var b = createBrowserify();
		var s = plugin({stream: emptyStream, watch: true}, b);
	});

});

