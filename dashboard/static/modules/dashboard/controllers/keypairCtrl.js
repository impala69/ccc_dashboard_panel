angular.module("dashboard")
    .controller("keypairsCtrl", function ($scope, $interval, $rootScope, $state, dashboardHttpRequest) {
        var initialize = function () {
            $scope.new_keypair_data = {
                "name": ''
            };
            $scope.get_overview();
        };
        $scope.new_created_keypair = {
            'public_key': "",
            'private_key': ""
        };
        $scope.get_overview = function () {
            dashboardHttpRequest.get_key_pairs()
                .then(function (data) {
                    $rootScope.is_page_loading = false;
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.keypairs = data['data']['keypairs'];
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    $rootScope.is_page_loading = false;
                    console.log(error);
                });
        };

        $scope.show_keypair_detail = function (keypair_name) {
            dashboardHttpRequest.get_key_pair(keypair_name)
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.keypair = data['data']['keypair'];
                        $rootScope.open_modal('keypair_detail');
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.delete_keypair = function () {
            dashboardHttpRequest.delete_key_pair($scope.deleteing_item)
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $rootScope.close_modal('keypair_delete');
                        $scope.deleteing_item = "";
                        $scope.get_overview();
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.create_keypair = function () {
            dashboardHttpRequest.create_key_pair($scope.new_keypair_data)
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $rootScope.close_modal('keypair_create');
                        $scope.clear_form();
                        $scope.get_overview();
                        $scope.new_created_keypair.public_key = data['data']['keypair_detail']['keypair']['public_key'];
                        $scope.new_created_keypair.private_key = data['data']['keypair_detail']['keypair']['private_key'];
                        $scope.open_modal("keypair_detail_after_create");
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
            $scope.new_keypair_data = {
                "name": ''
            };
        };

        initialize();

    });