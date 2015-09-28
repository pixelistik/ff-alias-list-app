(function (window) {
	var nodeListTransform = function (nodeData) {
		var nodes = nodeData.nodes;

		var nodeList = [];
		var macList = [];
		var extendedMacList = [];

		var nodeWithOffsetMac = function (node, offset) {
			var macParts = node.mac.split(":");
			macParts[1] = (parseInt(macParts[1], 16) + offset).toString(16);

			return {
				hostname: node.hostname,
				mac: macParts.join(":")
			};
		}

		var nodeWithPreviousMac = function (node) {
			return nodeWithOffsetMac(node, -1);
		}

		var nodeWithNextMac = function (node) {
			return nodeWithOffsetMac(node, +1);
		}

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

		macList.forEach(function (node) {
			extendedMacList.push(node);
			extendedMacList.push(nodeWithPreviousMac(node));
			extendedMacList.push(nodeWithNextMac(node));
		});

		return extendedMacList.map(function (node) {
				return node.mac + "|" + node.hostname + " (" + node.mac + ")"
			});
	};

	// Export as module or global
	if (typeof module !== "undefined" && module.exports) {
		module.exports = nodeListTransform;
	} else {
		window.nodeListTransform = nodeListTransform;
	}
})(this);
