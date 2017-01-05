(function () {
    angular.module("manage", [ "common" ])
        .config(["$stateProvider", "$urlRouterProvider", "resolve", function (stateProvider, urlRouterProvider, resolve) {
            urlRouterProvider.otherwise("/");
            stateProvider
                .state("manage", {
                    url: "/manage",
                    templateUrl: "manage.html",
                    controller: "ManageCtrl",
                    resolve: resolve
                });
        }])
        .controller("ManageCtrl", [ "$scope", "TerminalService", "NetworkService", "$timeout", "$state", function (scope, terminalService, networkService, timeout, state) {

            scope.terminalList = terminalService.getTerminals();

            scope.homeCredentials = networkService.getCredentials();

            scope.deviceIdList = [];

            scope.switchList = [];

            terminalService.getDeviceConfiguration().then(function (response) {
                scope.switchList.length = response.data.switchCount;
                scope.deviceIdList = response.data.deviceIdList;
            }, function (response) {
                state.go("device");
            });

            scope.getTerminalProperty = function (property, deviceId) {
                var terminalId = (deviceId) ? deviceId.split("/")[2] : null;
                var propertyValue = null;
                if(terminalId) {
                    for(var terminalIndex in scope.terminalList) {
                        var terminal = scope.terminalList[terminalIndex];
                        if(terminal.terminalId === terminalId) {
                            propertyValue = terminal[property];
                            break;
                        }
                    }
                }
                return propertyValue;
            };

            scope.setupDevice = function (homeCredentials, deviceIdList) {
                deviceIdList = deviceIdList.map(function (deviceId, deviceIdIndex) {
                    return (deviceId ? deviceId : "//");
                });
                terminalService.configureDevice(homeCredentials, deviceIdList).then(function (response) {
                    console.log("Configuration Success");
                    networkService.connect({ ssid: homeCredentials.ssid }, homeCredentials.password, function (error, credentials) {
                        state.go("home");
                    });
                }, function (response) {
                    console.log("Configuration Failed");
                });
            };

            scope.toggleSwitch = function (index) {
                terminalService.testSwitch(index).then(function (response) {
                    console.log("Switch is turned " + ((response.data.state === 1) ? "on" : "off"));
                }, function (response) {
                    console.log("Unable to access switch");
                });
            };
        }]);
})();
