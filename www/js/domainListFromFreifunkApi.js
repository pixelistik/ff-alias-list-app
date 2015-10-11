var DIRECTORY_URL = "https://github.com/freifunk/directory.api.freifunk.net/raw/master/directory.json";

var request = require('request');
var async = require("async");

var requestToCommunityList = function (error, response, body) {
	var communities = [];

	if (!error && response.statusCode == 200) {
		var directory = JSON.parse(body);


		for (var community in directory) {
			communities.push({
				communityId: community,
				communityUrl: directory[community]
			});
		}
	}

	return communities;
};
