(function (window) {
	var nodeListTransform = function (nodeData) {
		var deriveClientMacs = function () {
			return "foo";
		};

		var nodes = nodeData.nodes;

		var nodeList = [];
		var macList = [];

		for (var id in nodes) {
			try {
				if (
					typeof nodes[id].nodeinfo.hostname !== "undefined" &&
					typeof nodes[id].nodeinfo.network.mac !== "undefined"
				) {
					nodeList.push({
						hostname: nodes[id].nodeinfo.hostname,
						macs: [nodes[id].nodeinfo.network.mac]
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

		/**
		 * Derive MACs of the public client MACs from primary MAC
		 *
		 * @see https://forum.freifunk.net/t/wifi-analyzer-alias-app/8475/11
		 */
		var nodeWithDerivedClientMac = function (node, offset) {
			var macParts = node.mac.split(":");
			macParts[0] = (parseInt(macParts[0], 16) + 2).toString(16);
			macParts[1] = (parseInt(macParts[1], 16) + 2).toString(16);
			macParts[2] = (parseInt(macParts[2], 16) + offset).toString(16);

			return {
				hostname: node.hostname,
				mac: macParts.join(":")
			};
		}
		
		var extendedMacList = [];

		macList.forEach(function (node) {
			extendedMacList.push(nodeWithDerivedClientMac(node, 1));
			extendedMacList.push(nodeWithDerivedClientMac(node, 2));
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
