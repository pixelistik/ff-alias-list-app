"use strict";

var ffAliasList;

if (typeof cordova !== "undefined" && typeof document !== "undefined") {
    document.addEventListener(
        "deviceready",
        function () {
            ffAliasList = new FfAliasList();
            ko.applyBindings(ffAliasList);
        },
        false
    );
} else {
    ffAliasList = new FfAliasList();
    ko.applyBindings(ffAliasList);
}
