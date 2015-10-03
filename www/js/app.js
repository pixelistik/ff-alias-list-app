var app = {
	init: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},

	onDeviceReady: function() {
		var statusText = document.getElementById("status");

		var ffAliasList = new FfAliasList();
		ko.applyBindings(ffAliasList);
	},
};

app.init();
