(function (global) {
	var FfAliasList = function (dependencies) {
		var dependencies = dependencies || {};

		var ko = dependencies.ko || global.ko || require("knockout");
		var fetch = dependencies.fetch || global.fetch || require('node-fetch');

		var self = this;
		self.processIsRunning = ko.observable(false);
		self.status = ko.observable("");
		self.domains = ko.observableArray();

		self.selectedDomainDataUrl = ko.observable();

		self.updateDomainList = function () {
			var DOMAIN_LIST_URL = "https://raw.githubusercontent.com/pixelistik/ff-alias-list-app/master/data/domains.json";

			self.processIsRunning(true);
			self.status("Lade Domains...");

			return fetch(DOMAIN_LIST_URL).then(function (response) {
				if(response.ok) {
					response.text().then(function (text) {
						localStorage.setItem("domains", text);

						var domains = JSON.parse(text);

						domains.sort(function(a, b){return a.name.localeCompare(b.name)})

						self.domains(domains);

						self.selectedDomainDataUrl = ko.observable(self.domains()[0].dataUrl);

						self.processIsRunning(false);
						self.status("");
					});
				} else {
					self.processIsRunning(false);
					self.status("Domains konnten nicht geladen werden: " + response.statusText);
				}

			}).catch(function () {
				self.processIsRunning(false);
				self.status("Domains konnten nicht geladen werden, Netzwerkfehler.");
			});
		};

		self.updateDomainList();

		self.platformReady = ko.observable(false);
		if (typeof cordova !== "undefined") {
			document.addEventListener(
				'deviceready',
				function () {
					self.platformReady(true);
				},
				false
			);
		} else {
			self.platformReady(true);
		}

		self.saveAliasList = function () {
			self.processIsRunning(true);
			self.status("Lade...");
			
			fetch(self.selectedDomainDataUrl()).then(function (response) {
				if(response.ok) {
					response.text().then(function (text) {
						self.status("Erstelle Liste...");
						var data = JSON.parse(text);
						var aliasText = nodeListTransform(data).join("\n");

						self.status("Speichere Liste...");
						global.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
							dir.getFile("WifiAnalyzer_Alias.txt", {create:true}, function(file) {
								file.createWriter(function(fileWriter) {
									var blob = new Blob([aliasText], {type:'text/plain'});
									fileWriter.write(blob);
									self.processIsRunning(false);
									self.status("Fertig.");
									global.setTimeout(function () {
										self.status("");
									}, 3000);
								}, fail);
							});
						});
					});
				} else {
					// We reached our target server, but it returned an error
					self.processIsRunning(false);
					self.status("Serverfehler!");
				}
			}).catch(function (error) {
				// There was a connection error of some sort
				self.processIsRunning(false);
				self.status("Verbindungsfehler! Hast du Internet?");
			});

			function fail(e) {
				self.processIsRunning(false);
				self.status("Exception: " + e);
			}

		};
	};

	// Export as module or global
	if (typeof module !== "undefined" && module.exports) {
		module.exports = FfAliasList;
	} else {
		global.FfAliasList = FfAliasList;
	}
})(this);
