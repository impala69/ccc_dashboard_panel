angular.module("dashboard")
    .controller("dashboardCtrl", function ($scope, $interval, $rootScope, $state) {
        var initialize = function () {
            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });

        };

        $rootScope.open_modal = function (modal_id) {
            jQuery.noConflict();
            (function ($) {
                $('#' + modal_id).modal('show');
            })(jQuery);
        };

        $rootScope.close_modal = function (modal_id) {
            jQuery.noConflict();
            (function ($) {
                $('#' + modal_id).modal('hide');
            })(jQuery);
        };

        initialize();

    });