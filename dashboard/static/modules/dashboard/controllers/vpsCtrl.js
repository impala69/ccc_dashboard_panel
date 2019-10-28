angular.module("dashboard")
    .controller("vpsCtrl", function ($scope, $interval, $rootScope, $state, dashboardHttpRequest, $timeout) {
        var initialize = function () {
            $scope.vps_list = [];
            $scope.attached_volume = "";
            $scope.get_vps_list();
            $scope.get_volumes();
            $scope.get_images();
            $scope.get_flavors();
            $scope.get_networks();
        };
        $scope.get_vps_list = function () {
            dashboardHttpRequest.get_all_vps()
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.vps_list = data['data']['vps_list'];
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.get_volumes = function () {
            dashboardHttpRequest.get_volumes()
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.volumes = data['data']['volumes'];
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };
        $scope.get_flavors = function () {
            dashboardHttpRequest.get_flavors()
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.flavors = data['data']['flavors'];
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };
        $scope.get_networks = function () {
            dashboardHttpRequest.get_networks()
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.networks = data['data']['networks'];
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.get_images = function () {
            dashboardHttpRequest.get_images()
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.images = data['data']['images'];
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.vps_action = function (server_id, action_name) {
            var sending_data = {};
            if (action_name === "SHUTOFF") {
                sending_data['action_data'] = {"os-stop": null};
            }
            else if (action_name === "REBOOT") {
                sending_data['action_data'] = {"reboot": {"type": "HARD"}};
            }
            else if (action_name === "START") {
                sending_data['action_data'] = {"os-start": null};
            }
            else if (action_name === "CONSOLE") {
                sending_data['action_data'] = {"os-getVNCConsole": {"type": "novnc"}};
            }
            dashboardHttpRequest.vps_detail(server_id, sending_data)
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $timeout(function () {
                            if (action_name !== "CONSOLE") {
                                $scope.get_vps_list();
                            }
                        }, 5000);
                        if (action_name === "CONSOLE") {
                            $scope.console_url = data['data']['console_url'];
                            $rootScope.open_modal("console_show");
                        }
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        initialize();

    });