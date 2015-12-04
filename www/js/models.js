(function (window, ko) {
	var FfAliasList = function () {
		var self = this;
		self.status = ko.observable("");
		self.domains = ko.observableArray(
			[
				{name: "ffdus (Freifunk Flingern)", dataUrl: "http://map.ffdus.de/data/nodes.json"},
				{name: "freifunk-duesseldorf", dataUrl: "http://map.freifunk-duesseldorf.de/nodes.json"},
				{name: "freifunk-rheinland", dataUrl: "http://ffmap.freifunk-rheinland.net/nodes.json"},
				{name: 'bestwig', dataUrl: 'http://freifunk-bestwig.de/nodes_json_wrapper.php/data/nodes.json' },
				{name: 'bremen', dataUrl: 'http://bremen.freifunk.net/map/nodes.json' },
				{name: 'brilon', dataUrl: 'http://freifunk-brilon.net/nodes.json' },
				{name: 'euskirchen', dataUrl: 'http://map.freifunk-euskirchen.de/data/nodes.json' },
				{name: 'flensburg', dataUrl: 'http://map.freifunk-flensburg.de/data/nodes.json' },
				{name: 'frankfurt_am_main', dataUrl: 'http://map.ffm.freifunk.net/data/nodes.json' },
				{name: 'hattingen', dataUrl: 'http://map.en.freifunk.ruhr/enkreis/data/nodes.json' },
				{name: 'krefeld', dataUrl: 'http://map.freifunk-ruhrgebiet.de/data/nodes.json' },
				{name: 'luebeck', dataUrl: 'https://map.luebeck.freifunk.net/data/nodes.json' },
				{name: 'mayen-koblenz', dataUrl: 'http://map.freifunk-myk.de/data/nodes.json' },
				{name: 'muensterland', dataUrl: 'https://freifunk-muensterland.de/map/data/nodes.json' },
				{name: 'neukirchen-vluyn', dataUrl: 'http://api.freifunk-niersufer.de/nv/nodes.json' },
				{name: 'ostholstein', dataUrl: 'http://ostholstein.freifunk.net/map/nodes.json' },
				{name: 'paderborn', dataUrl: 'http://map.paderborn.freifunk.net/data/nodes.json' },
				{name: 'pinneberg', dataUrl: 'http://meshviewer.pinneberg.freifunk.net/data/nodes.json' },
				{name: 'ratingen', dataUrl: 'http://ffmap.freifunk-rheinland.net/nodes.json' },
				{name: 'troisdorf', dataUrl: 'https://map.freifunk-troisdorf.de/data/nodes.json' },
				{name: 'warendorf', dataUrl: 'https://freifunk-muensterland.de/map/data/nodes.json' },
				{name: 'moehne-arnsberg', dataUrl: 'http://map.freifunk-moehne.de/data-arnsberg/nodes.json' },
				{name: 'moehne-balvekierspe', dataUrl: 'http://map.freifunk-moehne.de/data-balvekierspe/nodes.json' },
				{name: 'moehne-biggesee', dataUrl: 'http://map.freifunk-moehne.de/data-biggesee/nodes.json' },
				{name: 'moehne-meschedebestwig', dataUrl: 'http://map.freifunk-moehne.de/data-meschedebestwig/nodes.json' },
				{name: 'moehne-moehnequelle', dataUrl: 'http://map.freifunk-moehne.de/data-moehnequelle/nodes.json' },
				{name: 'moehne-moehnesee', dataUrl: 'http://map.freifunk-moehne.de/data-moehnesee/nodes.json' },
				{name: 'moehne-soest', dataUrl: 'http://map.freifunk-moehne.de/data-soest/nodes.json' },
				{name: 'moehne-soesterumland', dataUrl: 'http://map.freifunk-moehne.de/data-soesterumland/nodes.json' },
				{name: 'moehne-sundern', dataUrl: 'http://map.freifunk-moehne.de/data-sundern/nodes.json' }
			].sort(function(a, b){return a.name.localeCompare(b.name)})
		);
		self.selectedDomainDataUrl = ko.observable(self.domains()[0].dataUrl);

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
			self.status("Lade...");

			var request = new XMLHttpRequest();
			request.open("GET", self.selectedDomainDataUrl(), true);

			request.onload = function() {
			  if (this.status >= 200 && this.status < 400) {
				// Success!
				self.status("Erstelle Liste...");

				var data = JSON.parse(this.response);

				var text = nodeListTransform(data).join("\n");

				self.status("Speichere Liste...");

				window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
					dir.getFile("WifiAnalyzer_Alias.txt", {create:true}, function(file) {
						file.createWriter(function(fileWriter) {
							var blob = new Blob([text], {type:'text/plain'});
							fileWriter.write(blob);
							self.status("Fertig.");
							window.setTimeout(function () {
								self.status("");
							}, 3000);
						}, fail);
					});
				});

			  } else {
				// We reached our target server, but it returned an error
				self.status("Serverfehler!");
			  }
			};

			request.onerror = function() {
				// There was a connection error of some sort
				self.status("Verbindungsfehler! Hast du Internet?");
			};

			request.send();

			function fail(e) {
				self.status("Exception: " + e);
			}

		};
	};

	// Export as module or global
	if (typeof module !== "undefined" && module.exports) {
		module.exports.FfAliasList = FfAliasList;
	} else {
		window.FfAliasList = FfAliasList;
	}
})(this, this.ko || require("knockout"));
