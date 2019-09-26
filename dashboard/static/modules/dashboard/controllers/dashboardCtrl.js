angular.module("dashboard")
    .controller("dashboardCtrl", function ($scope, $interval, $rootScope, $state) {
        var initialize = function () {
            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });

        };

        initialize();

    });