var rewire = require("rewire");
var assert = require("chai").assert
var sinon = require("sinon")
var nodeListTransform = require("../www/js/nodeListTransform.js")
var models = rewire("../www/js/models.js");
var FfAliasList = rewire("../www/js/models.js").FfAliasList;
var domainListFromFreifunkApi = rewire("../www/js/domainListFromFreifunkApi");

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
			app.selectedDomainDataUrl("http://ffmap.freifunk-rheinland.net/nodes.json");
			app.saveAliasList();

			assert.equal(requests.length, 2);
			assert.equal(requests[0].url, "http://map.ffdus.de/data/nodes.json");
			assert.equal(requests[1].url, "http://ffmap.freifunk-rheinland.net/nodes.json");
		});
	});
});

describe("Domain list from Freifunk API", function () {
	describe("Request to Community List", function () {
		it("should return an array of Communities on success", function () {
			var result = domainListFromFreifunkApi.__get__("requestToCommunityList")(
				null,
				{statusCode: 200},
				'{ "aachen" : "https://raw.githubusercontent.com/ffac/api-file/master/acffapi.json", "altdorf" : "http://freifunk-altdorf.de/FreifunkAltdorf-api.json"}'
			);

			assert.deepEqual(
				result,
				[
					{
						communityId: "aachen",
						communityUrl: "https://raw.githubusercontent.com/ffac/api-file/master/acffapi.json"
					},
					{
						communityId: "altdorf",
						communityUrl: "http://freifunk-altdorf.de/FreifunkAltdorf-api.json"
					}
				]
			);
		});
	});

	describe("Request data for each Community", function () {
		it("should add the data requested from each Community's URL", function () {
			var request = sinon.stub();
			request.yields(null, {statusCode: 200}, '{"testCommunityData": "test"}');

			domainListFromFreifunkApi.__set__("request", request);

			var done = sinon.spy();

			domainListFromFreifunkApi.__get__("addCommunityData")({
				communityId: "aachen",
				communityUrl: "https://raw.githubusercontent.com/ffac/api-file/master/acffapi.json"
			}, done);

			assert(request.calledOnce);
			assert.equal(request.getCall(0).args[0], "https://raw.githubusercontent.com/ffac/api-file/master/acffapi.json");

			assert(done.calledOnce);

			var result = done.getCall(0).args[1];
			assert.deepEqual(result, {
				communityId: "aachen",
				communityUrl: "https://raw.githubusercontent.com/ffac/api-file/master/acffapi.json",
				communityData: {
					testCommunityData: "test"
				}
			});
		});
	});

	describe("Filter for only Communities with ffmap maps", function () {
		it("should correctly include a community with a single ffmap", function () {
			var result = domainListFromFreifunkApi.__get__("communityHasFfmapMap")({
				communityData: {
					nodeMaps: [{technicalType: "ffmap"}]
				}
			});

			assert.strictEqual(result, true);
		});

		it("should correctly include a community with ffmap as one of multiple maps", function () {
			var result = domainListFromFreifunkApi.__get__("communityHasFfmapMap")({
				communityData: {
					nodeMaps: [
						{},
						{technicalType: "other"},
						{technicalType: "ffmap"}
					]
				}
			});

			assert.strictEqual(result, true);
		});

		it("should correctly exclude a community without any map info", function () {
			var result = domainListFromFreifunkApi.__get__("communityHasFfmapMap")({
				communityData: {}
			});

			assert.strictEqual(result, false);
		});

		it("should correctly exclude a community with no ffmap", function () {
			var result = domainListFromFreifunkApi.__get__("communityHasFfmapMap")({
				communityData: {
					nodeMaps: [
						{},
						{technicalType: "other"}
					]
				}
			});

			assert.strictEqual(result, false);
		});
	});

	describe("Map URL to node data URL conversion", function () {
		describe("legacy ffmap map", function () {
			it("should convert a single map with graph.html url", function () {
				var result = domainListFromFreifunkApi.__get__("mapUrlToNodeDataUrl")({
					communityData: {
						nodeMaps: [{
							technicalType: "ffmap",
							url: "http://example.com/map/graph.html"
						}]
					}
				});

				assert.equal(result.nodeDataUrl, "http://example.com/map/nodes.json");
			});

			it("should convert a single map with geomap.html url", function () {
				var result = domainListFromFreifunkApi.__get__("mapUrlToNodeDataUrl")({
					communityData: {
						nodeMaps: [{
							technicalType: "ffmap",
							url: "http://example.com/map/geomap.html"
						}]
					}
				});

				assert.equal(result.nodeDataUrl, "http://example.com/map/nodes.json");
			});

			it("should convert a single map with list.html url", function () {
				var result = domainListFromFreifunkApi.__get__("mapUrlToNodeDataUrl")({
					communityData: {
						nodeMaps: [{
							technicalType: "ffmap",
							url: "http://example.com/map/list.html"
						}]
					}
				});

				assert.equal(result.nodeDataUrl, "http://example.com/map/nodes.json");
			});
		});

		describe("Mapviewer map", function () {
			it("should keep an existing nodes.json url", function () {
				var result = domainListFromFreifunkApi.__get__("mapUrlToNodeDataUrl")({
					communityData: {
						nodeMaps: [{
							technicalType: "ffmap",
							url: "http://example.com/map/data/nodes.json"
						}]
					}
				});

				assert.equal(result.nodeDataUrl, "http://example.com/map/data/nodes.json");
			});

			it("should extend a base url", function () {
				var result = domainListFromFreifunkApi.__get__("mapUrlToNodeDataUrl")({
					communityData: {
						nodeMaps: [{
							technicalType: "ffmap",
							url: "http://example.com/map"
						}]
					}
				});

				assert.equal(result.nodeDataUrl, "http://example.com/map/data/nodes.json");
			});

			it("should extend a base url with trailing slash", function () {
				var result = domainListFromFreifunkApi.__get__("mapUrlToNodeDataUrl")({
					communityData: {
						nodeMaps: [{
							technicalType: "ffmap",
							url: "http://example.com/map/"
						}]
					}
				});

				assert.equal(result.nodeDataUrl, "http://example.com/map/data/nodes.json");
			});
		});
	});
});

