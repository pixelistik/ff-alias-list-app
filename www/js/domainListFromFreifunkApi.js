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
	} else {
		console.log(error);
		console.log(response);
	}

	async.map(communities, addCommunityData, function (err, communities) {
		var result = communities
			.filter(communityHasFfmapMap)
			.map(mapUrlToNodeDataUrl);
		console.log(result);
	});
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
	if(!community || !community.communityData || !community.communityData.nodeMaps) {
		return false;
	}
	return community.communityData.nodeMaps.reduce(
		function (result, item) {
			return result || item.technicalType === "ffmap";
		},
		false
	);
}

var mapUrlToNodeDataUrl = function (community) {
	var firstFfmapUrl = community.communityData.nodeMaps
		.filter(function (nodeMap) {
			return nodeMap.technicalType && nodeMap.technicalType === "ffmap";
		})[0].url;

	community.nodeDataUrl = firstFfmapUrl
		.replace("graph.html", "nodes.json")
		.replace("geomap.html", "nodes.json")
		.replace("list.html", "nodes.json");

	if(community.nodeDataUrl.indexOf(".json") === -1) {
		var slash;
		if(firstFfmapUrl.substr(-1) === "/") {
			slash = "";
		} else {
			slash = "/";
		}

		community.nodeDataUrl = firstFfmapUrl + slash + "data/nodes.json";
	}

	return community;
};


var domainListFromFreifunkApi = function () {
	request(DIRECTORY_URL, requestToCommunityList)
};

domainListFromFreifunkApi();
