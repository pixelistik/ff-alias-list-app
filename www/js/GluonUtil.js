"use strict";

(function (window) {
    var md5 = window.md5 || require("blueimp-md5");

    var GluonUtil = {
        /*
        Reimplementation of the Gluon derivation in Lua
        https://github.com/freifunk-gluon/gluon/blob/6a0ca58fc3fd0a86292274a4a0fd47a2cf474cff/package/gluon-core/luasrc/usr/lib/lua/gluon/util.lua#L187
        */
        generateMac: function (primaryMac, i) {
            var hashed = md5(primaryMac).substr(0, 12);

            var m = [];

            m.push(hashed.substr( 0, 2));
            m.push(hashed.substr( 2, 2));
            m.push(hashed.substr( 4, 2));
            m.push(hashed.substr( 6, 2));
            m.push(hashed.substr( 8, 2));
            m.push(hashed.substr(10, 2));

            m[1-1] = parseInt(m[1-1], 16);

            m[1-1] = m[1-1] | 0x02;
            m[1-1] = m[1-1] & 0xFE;

            m[1-1] = m[1-1].toString(16);


            m[6-1] = parseInt(m[6-1], 16);

            m[6-1] = m[6-1] & 0xF8;
            m[6-1] = m[6-1] + i;

            m[6-1] = m[6-1].toString(16);

            return m.join(":");
        }
    };

    // Export as module or global
    if (typeof module !== "undefined" && module.exports) {
        module.exports = GluonUtil;
    } else {
        window.GluonUtil = GluonUtil;
    }
})(this);
