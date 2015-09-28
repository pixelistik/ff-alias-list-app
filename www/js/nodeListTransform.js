var nodeListTransform = function (nodeData) {
	var nodes = nodeData.nodes;

	var nodeList = [];
	var macList = [];

	for (var id in nodes) {
		try {
			if (
				typeof nodes[id].nodeinfo.hostname !== "undefined" &&
				typeof nodes[id].nodeinfo.network.mesh.bat0.interfaces.wireless !== "undefined"
			) {
				nodeList.push({
					hostname: nodes[id].nodeinfo.hostname,
					macs: nodes[id].nodeinfo.network.mesh.bat0.interfaces.wireless
				});
			}
		} catch (e) {}
	}

	nodeList.forEach(function (node) {
		node.macs.forEach(function (mac) {
			macList.push({
				hostname: node.hostname,
				mac: mac
			});
		});
	});

	return macList.map(function (node) {
			return node.mac + "|" + node.hostname
		});
};

module.exports = nodeListTransform;