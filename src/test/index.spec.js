// import _ from 'lodash'
// import ProcessPool from 'process-pool'
// import { positionOf } from 'sigh-core/lib/sourceMap'
// import { SourceMapConsumer } from 'source-map'
import Event from "sigh/lib/Event";
import Promise from "bluebird";
import {Bacon} from "sigh-core";
import {expect} from "chai";
import plugin from "../../";

require("source-map-support").install();

describe("sigh-bify", () => {
	
	var exampleBrowserify = require("../../example-bundle.js");
	var stream = Bacon.constant([]);
	
	it("exists", () => {
		expect(plugin).to.be.ok;
	});

	it("should throw error (expected browserify)", () => {
		var fn = plugin.bind(plugin, {stream});
		expect(fn).to.throw(Error);
	});

	it("should be created without error", () => {
		var browserify = require("browserify")();
		plugin({stream}, browserify);
	});

	it("should emit something", (done) => {
		var ps = plugin({stream}, exampleBrowserify);
		ps.onEnd(done);
	});

});

