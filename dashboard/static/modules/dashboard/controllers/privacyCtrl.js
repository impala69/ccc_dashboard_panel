angular.module("dashboard")
    .controller("privacyCtrl", function ($scope, $interval, $rootScope, $state, dashboardHttpRequest) {
        var initialize = function () {
            $scope.user_data = {
                "id": "",
                "name": "",
                "old_password": "",
                "new_password": "",
                "re_new_password": ""
            };
            $scope.get_user_data();
        };

        $scope.get_user_data = function () {
            dashboardHttpRequest.get_user()
                .then(function (data) {
                    $rootScope.is_page_loading = false;
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        var user_data = data['data']['user_data']['user'];
                        $scope.user_data.name = user_data['name'];
                        $scope.user_data.id = user_data['id'];
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    $rootScope.is_page_loading = false;
                    console.log(error);
                });
        };

        $scope.change_password = function () {
            dashboardHttpRequest.change_user_password($scope.user_data)
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $state.go("login");
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