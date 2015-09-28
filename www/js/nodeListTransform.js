var nodeListTransform = function (nodeData) {
	var nodes = nodeData.nodes;

	var nodeList = [];

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

	return nodeList.map(function (node) {
			return node.macs[0] + "|" + node.hostname
		});
};

module.exports = nodeListTransform;