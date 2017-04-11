"use strict";

(function (window) {
    var nodeListTransform = function (nodeData) {
        var GluonUtil = window.GluonUtil || require("./GluonUtil.js");

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
            } catch (e) { /* Just hide any problem */ } // eslint-disable-line
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
            var derivedMac = GluonUtil.generateMac(node.mac, offset);

            return {
                hostname: node.hostname,
                mac: derivedMac
            };
        };

        var extendedMacList = [];

        macList.forEach(function (node) {
            extendedMacList.push(nodeWithDerivedClientMac(node, 0));
            extendedMacList.push(nodeWithDerivedClientMac(node, 3));
        });

        return extendedMacList.map(function (node) {
            return node.mac + "|" + node.hostname + " (" + node.mac + ")";
        });
    };

    // Export as module or global
    if (typeof module !== "undefined" && module.exports) {
        module.exports = nodeListTransform;
    } else {
        window.nodeListTransform = nodeListTransform;
    }
})(this);
