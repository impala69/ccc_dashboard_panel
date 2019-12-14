angular.module("dashboard")
    .controller("dashboardCtrl", function ($scope, $interval, $rootScope, $state) {
        var initialize = function () {
            $rootScope.is_page_loading = true;
            $(document).ready(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });

        };

        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams, options) {
                $rootScope.is_page_loading = true;
            });

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