var assert = require("chai").assert
var sinon = require("sinon");
var FfAliasList = require("../www/js/FfAliasList.js");

describe("App view model", function () {
	var app;
	var requests;
	var mockResponse;

	var fetchStub = function (url) {
		requests.push(url);

		var domainListData = '[{"name": "Freifunk Test", "dataUrl": "http://example.com/nodes.json"}]';
		mockResponse = {
			text: function () {
				return new Promise(function (resolve, reject) {
					resolve(domainListData);
				})
			},
			ok: true
		};

		return new Promise(function (resolve) {
			resolve(mockResponse);
		});
	};

	var cordovaStub = {
		file: {
			externalRootDirectory: "bla"
		}
	};

	var resolveLocalFileSystemURLStub = function (path, callback) {
		callback({
			getFile: function (name, params, callback) {
				callback({
					createWriter: function (callback) {
						callback({
							write: function () { }
						});
					}
				});
			}
		});
	};

	var blobStub = function () {

	}

	var dependencies = {
		fetch: fetchStub,
		cordova: cordovaStub,
		resolveLocalFileSystemURL: resolveLocalFileSystemURLStub,
		Blob: blobStub
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

		it("should display the status during download", function () {
			sinon.spy(app, "status");

			app.selectedDomainDataUrl("http://map.ffdus.de/data/nodes.json");

			return app.saveAliasList().then(function () {
				assert(app.status.calledWith("Lade..."));
				assert(app.status.calledWith("Erstelle Liste..."));
				assert(app.status.calledWith("Speichere Liste..."));
			});
		});
	});
});
