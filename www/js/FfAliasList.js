"use strict";

(function (global) {
    var FfAliasList = function (dependencies) {
        dependencies = dependencies || {};

        var ko = dependencies.ko || global.ko || require("knockout");
        var fetch = dependencies.fetch || global.fetch || require("node-fetch");
        var nodeListTransform = dependencies.nodeListTransform || global.nodeListTransform || require("./nodeListTransform.js");
        var cordova = dependencies.cordova || global.cordova;
        if (typeof resolveLocalFileSystemURL === "undefined") {
            var resolveLocalFileSystemURL = dependencies.resolveLocalFileSystemURL;
        }
        var Blob = dependencies.Blob || global.Blob;

        var self = this;
        self.processIsRunning = ko.observable(false);
        self.status = ko.observable("");
        self.domains = ko.observableArray();

        self.selectedDomainDataUrl = ko.observable();

        self.updateDomainList = function () {
            var DOMAIN_LIST_URL = "https://raw.githubusercontent.com/pixelistik/ff-alias-list-app/master/data/domains.json";

            self.processIsRunning(true);
            self.status("Lade Domains...");

            return fetch(DOMAIN_LIST_URL).then(function (response) {
                if(response.ok) {
                    response.text().then(function (text) {
                        localStorage.setItem("domains", text);

                        var domains = JSON.parse(text);

                        domains.sort(function (a, b) {
                            return a.name.localeCompare(b.name);
                        });

                        self.domains(domains);

                        self.selectedDomainDataUrl = ko.observable(self.domains()[0].dataUrl);

                        self.processIsRunning(false);
                        self.status("");
                    });
                } else {
                    self.processIsRunning(false);
                    self.status("Domains konnten nicht geladen werden: " + response.statusText);
                }

            }).catch(function () {
                self.processIsRunning(false);
                self.status("Domains konnten nicht geladen werden, Netzwerkfehler.");
            });
        };

        self.platformReady = ko.observable(false);
        if (typeof cordova !== "undefined" && typeof document !== "undefined") {
            document.addEventListener(
                "deviceready",
                function () {
                    self.platformReady(true);
                    self.updateDomainList();
                },
                false
            );
        } else {
            self.platformReady(true);
            self.updateDomainList();
        }

        var generateListFromResponse = function (response) {
            if(response.ok) {
                return response.text().then(function (text) {
                    self.status("Erstelle Liste...");

                    var data = JSON.parse(text);
                    var aliasText = nodeListTransform(data).join("\n");

                    return aliasText;
                }).catch(function (error) {
                    throw "Fehler beim Erstellen der Alias-Liste";
                });
            } else {
                // We reached our target server, but it returned an error
                throw "Serverfehler";
            }
        };

        var saveListToFile = function (aliasText) {
            self.status("Speichere Liste...");

            return new Promise(function (resolve, reject) {
                global.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (dir) {
                    dir.getFile("WifiAnalyzer_Alias.txt", {create:true}, function (file) {
                        file.createWriter(function (fileWriter) {
                            var blob = new Blob([aliasText], {type: "text/plain"});
                            fileWriter.write(blob);
                            self.processIsRunning(false);
                            self.status("Fertig.");
                            setTimeout(function () {
                                self.status("");
                            }, 3000);
                            resolve();
                        }, reject);
                    });
                });
            });
        };

        self.saveAliasList = function () {
            self.processIsRunning(true);
            self.status("Lade...");

            return fetch(self.selectedDomainDataUrl())
            .then(generateListFromResponse)
            .then(saveListToFile)
            .catch(function (error) {
                // There was an error of some sort
                // Inform user and re-throw
                self.processIsRunning(false);
                self.status(error);
                throw error;
            });
        };
    };

    // Export as module or global
    if (typeof module !== "undefined" && module.exports) {
        module.exports = FfAliasList;
    } else {
        global.FfAliasList = FfAliasList;
    }
})(this);
