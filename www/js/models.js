(function (window, ko) {
	var FfAliasList = function () {
		var self = this;
		self.status = ko.observable("");

		self.saveAliasList = function () {
			self.status("Lade...");

			var request = new XMLHttpRequest();
			request.open('GET', 'http://map.ffdus.de/data/nodes.json', true);

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
							self.status("OK");
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
