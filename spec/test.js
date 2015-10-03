var rewire = require("rewire");
var assert = require("chai").assert
var sinon = require("sinon")
var nodeListTransform = require("../www/js/nodeListTransform.js")
var models = rewire("../www/js/models.js");
var FfAliasList = rewire("../www/js/models.js").FfAliasList;

describe("Wifi Analyzer alias list", function () {
	it("should list a simple node", function () {
		var result = nodeListTransform({
			nodes: {
				c423523487: {
					nodeinfo: {
						hostname: "host-one",
						network: {
							mesh: {
								bat0: {
									interfaces: {
										wireless: ["99:ee:ee:ee:01:01"]
									}
								}
							}
						}
					}
				}
			}
		});
		assert.include(result, "99:ee:ee:ee:01:01|host-one (99:ee:ee:ee:01:01)");
	});

	it("should filter out nodes without hostname", function () {
		var result = nodeListTransform({
			nodes: {
				c423523487: {
					nodeinfo: {
						network: {
							mesh: {
								bat0: {
									interfaces: {
										wireless: ["99:ee:ee:ee:01:01"]
									}
								}
							}
						}
					}
				}
			}
		});
		assert.notInclude(result.join(), "undefined");
	});

	it("should filter out nodes without interfaces", function () {
		var result = nodeListTransform({
			nodes: {
				c423523487: {
					nodeinfo: {
						hostname: "host-one",
						network: {
							mesh: {
								bat0: {}
							}
						}
					}
				}
			}
		});

		assert.notInclude(result.join(), "undefined");
	});

	it("should list a node with multiple macs", function () {
		var result = nodeListTransform({
			nodes: {
				c423523487: {
					nodeinfo: {
						hostname: "host-one",
						network: {
							mesh: {
								bat0: {
									interfaces: {
										wireless: [
											"99:ee:ee:ee:01:01",
											"11:ee:ee:ee:01:01"
										]
									}
								}
							}
						}
					}
				}
			}
		});

		assert.include(result, "99:ee:ee:ee:01:01|host-one (99:ee:ee:ee:01:01)");
		assert.include(result, "11:ee:ee:ee:01:01|host-one (11:ee:ee:ee:01:01)");
	});

	it("should add the next and previous mac", function () {
		var result = nodeListTransform({
			nodes: {
				c423523487: {
					nodeinfo: {
						hostname: "host-one",
						network: {
							mesh: {
								bat0: {
									interfaces: {
										wireless: ["99:ee:ee:ee:01:01"]
									}
								}
							}
						}
					}
				}
			}
		});

		assert.include(result, "99:ee:ee:ee:01:01|host-one (99:ee:ee:ee:01:01)");
		assert.include(result, "99:ef:ee:ee:01:01|host-one (99:ef:ee:ee:01:01)");
		assert.include(result, "99:ed:ee:ee:01:01|host-one (99:ed:ee:ee:01:01)");
	});
});

describe("App view model", function () {
	var app;

	beforeEach(function () {
		app = new FfAliasList();
	});

	it("should instantiate", function () {
		assert.isDefined(app);
	});

	describe("Data download", function () {
		it("should download from the correct URL", function () {
			var xhr = sinon.useFakeXMLHttpRequest();

			var requests = [];

			xhr.onCreate = function (xhr) {
				requests.push(xhr);
			};

			models.__set__("XMLHttpRequest", xhr);

			app.saveAliasList();

			assert.equal(requests.length, 1);
			assert.equal(requests[0].url, "http://map.ffdus.de/data/nodes.json");
		});
	});
});
