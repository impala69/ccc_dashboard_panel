angular.module("dashboard")
    .controller("overviewCtrl", function ($scope, $interval, $rootScope, $state, dashboardHttpRequest) {
        var initialize = function () {
            $scope.vps_list = [];
            $scope.get_overview();
        };
        $scope.get_overview = function () {
            dashboardHttpRequest.get_overview()
                .then(function (data) {
                    $rootScope.is_page_loading = false;
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.overview_data = data['data']['overview'];
                        $scope.overview_volume_data = data['data']['overview_volumes'];
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    $rootScope.is_page_loading = false;
                    console.log(error);
                });
        };

        initialize();

    });