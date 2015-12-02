var DIRECTORY_URL = "https://github.com/freifunk/directory.api.freifunk.net/raw/master/directory.json";

var request = require('request');
var async = require("async");
var nodeListTransform = require("./nodeListTransform.js");

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
	console.log(communities.length + " communities total.");
	async.map(communities, addCommunityData, function (err, communities) {
		var communitiesWithNodeDataUrl = communities
			.filter(communityHasFfmapMap)
			.map(mapUrlToNodeDataUrl);
			console.log(communitiesWithNodeDataUrl.length + " communities with Ffmap.");

			async.filter(communitiesWithNodeDataUrl, communityNodeListHasEntries, function (communitiesWithNonEmptyNodeList) {
				var communityList = communitiesWithNonEmptyNodeList.map(function (community) {
					return {
						communityId: community.communityId,
						nodeDataUrl: community.nodeDataUrl
					};
				});

				console.log(communityList.length + " communities with at least 1 nodes entry.");
				console.log(communityList);
			});
	});
	return communities;
};

var addCommunityData = function (community, done) {
	request(community.communityUrl, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			try {
				community.communityData = JSON.parse(body);
			} catch (e) {
				console.log("Exception while parsing community data from " + community.communityUrl + ": " + e);
			}
		} else {
			console.log("Error while requesting " + community.communityUrl + ": " + (error || response.statusCode));
		}

		done(null, community);
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

var communityNodeListHasEntries = function (community, done) {
	var url = community.nodeDataUrl;

	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var result = false;
			try {
				var nodeData = JSON.parse(body);
				result = nodeListTransform(nodeData).length > 0;
			} catch(e) {
				console.log("Error while parsing node list from " + url + ": " + e);
			}
			done(result);
		} else {
			console.log("Error while requesting nodes list from " + url + ": " + (error || response.statusCode));
			done(false);
		}
	});
}
var domainListFromFreifunkApi = function () {
	request(DIRECTORY_URL, requestToCommunityList)
};

domainListFromFreifunkApi();
