var rewire = require("rewire");
var assert = require("chai").assert
var sinon = require("sinon")
var models = rewire("../www/js/models.js");
var FfAliasList = rewire("../www/js/models.js").FfAliasList;

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

			app.selectedDomainDataUrl("http://map.ffdus.de/data/nodes.json");
			app.saveAliasList();
			app.selectedDomainDataUrl("http://ffmap.freifunk-rheinland.net/nodes.json");
			app.saveAliasList();

			assert.equal(requests.length, 2);
			assert.equal(requests[0].url, "http://map.ffdus.de/data/nodes.json");
			assert.equal(requests[1].url, "http://ffmap.freifunk-rheinland.net/nodes.json");
		});
	});
});
