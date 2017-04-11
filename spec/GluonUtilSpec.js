"use strict";

var assert = require("chai").assert;
var GluonUtil = require("../www/js/GluonUtil.js");

describe("GluonUtil", function () {
    /*
    Test cases derived from running the Lua implementation
    from
    https://github.com/freifunk-gluon/gluon/blob/6a0ca58fc3fd0a86292274a4a0fd47a2cf474cff/package/gluon-core/luasrc/usr/lib/lua/gluon/util.lua#L187
    */
    it("should derive a MAC for network 1", function () {
        var primaryMac = "c4:6e:1f:87:5e:f0";

        var result = GluonUtil.generateMac(primaryMac, 3);

        assert.equal(result, "66:73:38:76:45:33")
    });

    it("should derive a MAC for network 2", function () {
        var primaryMac = "c4:6e:1f:87:5e:f0";

        var result = GluonUtil.generateMac(primaryMac, 4);

        assert.equal(result, "66:73:38:76:45:34")
    });

    it("should keep leading zeroes", function () {
        var primaryMac = "10:fe:ed:e6:07:7a";

        var result = GluonUtil.generateMac(primaryMac, 0);

        assert.equal(result, "02:56:a6:d1:a8:c8");
    });
});
