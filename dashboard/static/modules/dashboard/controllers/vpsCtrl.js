angular.module("dashboard")
    .controller("vpsCtrl", function ($scope, $interval, $rootScope, $state, dashboardHttpRequest) {
        var initialize = function () {
            $scope.vps_list = [];
            $scope.get_vps_list();
        };
        $scope.get_vps_list = function () {
            dashboardHttpRequest.get_all_vps()
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.vps_list = data['data']['vps_list'];
                    }
                    else if (response === 403) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        initialize();

    });