var app = {
	init: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},

	onDeviceReady: function() {
		document.getElementById("save-list-button").addEventListener("click", function () {
			window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
				dir.getFile("log.txt", {create:true}, function(file) {
					console.log("got the file", file);
					file.createWriter(function(fileWriter) {
						var blob = new Blob(["Freifunk"], {type:'text/plain'});
						fileWriter.write(blob);
					}, fail);
				});
			});

			function fail(e) {
				console.log("Error: " + e);
			}

		});
	},
};

app.init();
