angular.module("dashboard")
    .controller("volumeCtrl", function ($scope, $interval, $rootScope, $state, dashboardHttpRequest) {
        var initialize = function () {
            $scope.new_volume_data = {
                "name": '',
                "description": "",
                "size": 0
            };
            $scope.get_volumes();
        };
        $scope.get_volumes = function () {
            dashboardHttpRequest.get_volumes()
                .then(function (data) {
                    $rootScope.is_page_loading = false;
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.volumes = data['data']['volumes'];
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    $rootScope.is_page_loading = false;
                    console.log(error);
                });
        };

        $scope.show_volume_detail = function (volume_name) {
            dashboardHttpRequest.get_volume(volume_name)
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.volume = data['data']['volume'];
                        $rootScope.open_modal('volume_detail');
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.delete_volume = function () {
            dashboardHttpRequest.delete_volume($scope.deleteing_item)
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $rootScope.close_modal('volume_delete');
                        $scope.deleteing_item = "";
                        $scope.get_volumes();
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.create_volume = function () {
            dashboardHttpRequest.create_volume($scope.new_volume_data)
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $rootScope.close_modal('volume_create');
                        $scope.clear_form();
                        $scope.get_volumes();
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.open_permission_modal = function (modal_id, name) {
            jQuery.noConflict();
            (function ($) {
                $('#' + modal_id).modal('show');
            })(jQuery);
            $scope.deleteing_item = name;
        };

        $scope.clear_form = function () {
            $scope.new_volume_data = {
                "name": '',
                "description": "",
                "size": 0
            };
        };

        initialize();

    });