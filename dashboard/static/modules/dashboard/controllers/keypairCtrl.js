angular.module("dashboard")
    .controller("keypairsCtrl", function ($scope, $interval, $rootScope, $state, dashboardHttpRequest) {
        var initialize = function () {
            $scope.vps_list = [];
            $scope.get_overview();
        };
        $scope.get_overview = function () {
            dashboardHttpRequest.get_key_pairs()
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.keypairs = data['data']['keypairs'];
                    }
                    else if (response === 403) {
                        $state.go("login");
                    }
                }, function (error) {
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
                    else if (response === 403) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        initialize();

    });