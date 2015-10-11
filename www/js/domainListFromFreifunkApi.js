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

var addCommunityData = function (community, done) {
	request(community.communityUrl, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			community.communityData = JSON.parse(body);
			done(null, community)
		} else {
			done("Error while requesting " + community.communityUrl);
		}
	});
};

var communityHasFfmapMap = function (community) {
	if(!community.communityData.nodeMaps) {
		return false;
	}
	return community.communityData.nodeMaps.reduce(
		function (result, item) {
			return result || item.technicalType === "ffmap";
		},
		false
	);
}
