var assert = require("chai").assert
var nodeListTransform = require("../www/js/nodeListTransform.js")

describe("Wifi Analyzer alias list", function () {
	it("should derive 2 client MACs from the primary MAC correctly", function () {
		var hostname = "derive-mac-test-host";
		var primaryMac =         "24:a4:3c:b1:11:d9";
		var expectedClientMac1 = "26:a6:3d:b1:11:d9";
		var expectedClientMac2 = "26:a6:3e:b1:11:d9";

		var nodeData = {
			nodes: {
				c46e1f875ef0: {
				    nodeinfo: {
						hostname: hostname,
				        network: {
				            mac: primaryMac
				        },
				    }
				}
			}
		};

		var result = nodeListTransform(nodeData);

		assert.include(result, expectedClientMac1 + "|" + hostname + " (" + expectedClientMac1 + ")");
		assert.include(result, expectedClientMac2 + "|" + hostname + " (" + expectedClientMac2 + ")");
	});

	it("should list a simple node", function () {
		var result = nodeListTransform({
			nodes: {
				c423523487: {
					nodeinfo: {
						hostname: "host-one",
						network: {
							mac: "99:ee:ee:ee:01:01"
						}
					}
				}
			}
		});
		assert.include(result.join(), "host-one");
	});

	it("should filter out nodes without hostname", function () {
		var result = nodeListTransform({
			nodes: {
				c423523487: {
					nodeinfo: {
						network: {
							mac: "99:ee:ee:ee:01:01"
						}
					}
				}
			}
		});
		assert.notInclude(result.join(), "undefined");
	});

	it("should filter out nodes without mac", function () {
		var result = nodeListTransform({
			nodes: {
				c423523487: {
					nodeinfo: {
						hostname: "host-one",
						network: {}
					}
				}
			}
		});

		assert.notInclude(result.join(), "undefined");
	});
});
