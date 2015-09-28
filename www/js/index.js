var app = {
	init: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},

	onDeviceReady: function() {
		document.getElementById("save-list-button").addEventListener("click", function () {
			var request = new XMLHttpRequest();
		request.open('GET', 'http://map.ffdus.de/data/nodes.json', true);

		request.onload = function() {
		  if (this.status >= 200 && this.status < 400) {
			// Success!
			var data = JSON.parse(this.response);

			var text = nodeListTransform(data).join("\n");

			window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
				dir.getFile("WifiAnalyzer_Alias.txt", {create:true}, function(file) {
					file.createWriter(function(fileWriter) {
						var blob = new Blob([text], {type:'text/plain'});
						fileWriter.write(blob);
					}, fail);
				});
			});

		  } else {
			// We reached our target server, but it returned an error

		  }
		};

		request.onerror = function() {
		  // There was a connection error of some sort
		};

		request.send();

		function fail(e) {
			console.log("Error: " + e);
		}

		});
	},
};

app.init();
