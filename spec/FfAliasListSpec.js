var assert = require("chai").assert
var FfAliasList = require("../www/js/FfAliasList.js");

describe("App view model", function () {
	var app;
	var requests;

	var fetchStub = function (url) {
		requests.push(url);

		var domainListData = '[{"name": "Freifunk Test", "dataUrl": "http://example.com/nodes.json"}]';
		return new Promise(function (resolve) {
			resolve(domainListData);
		});
	};

	var dependencies = {
		fetch: fetchStub
	};

	beforeEach(function () {
		requests = [];
		app = new FfAliasList(dependencies);
	});

	it("should instantiate", function () {
		assert.isDefined(app);
	});

	describe("Data download", function () {
		it("should download from the correct URL", function () {
			requests = [];
			
			app.selectedDomainDataUrl("http://map.ffdus.de/data/nodes.json");
			app.saveAliasList();
			app.selectedDomainDataUrl("http://ffmap.freifunk-rheinland.net/nodes.json");
			app.saveAliasList();

			assert.equal(requests.length, 2);
			assert.equal(requests[0], "http://map.ffdus.de/data/nodes.json");
			assert.equal(requests[1], "http://ffmap.freifunk-rheinland.net/nodes.json");
		});
	});
});
