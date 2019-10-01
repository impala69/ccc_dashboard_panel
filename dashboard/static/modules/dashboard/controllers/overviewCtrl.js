angular.module("dashboard")
    .controller("overviewCtrl", function ($scope, $interval, $rootScope, $state, dashboardHttpRequest) {
        var initialize = function () {
            $scope.vps_list = [];
            $scope.get_overview();
        };
        $scope.get_overview = function () {
            dashboardHttpRequest.get_overview()
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.overview_data = data['data']['overview'];
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