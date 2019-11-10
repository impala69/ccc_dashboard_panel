angular.module('dashboard')
    .directive('activeButton', function ($compile) {

        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                button: '=',
                spinnerIcon: '@'
            },
            template: "<button type=\"button\" class=\"btn btn-default {{button.cssClass}}\">{{button.text}} <span class=\"fa {{spinnerIcon}} fa-spin\" ng-hide=\"button.hideLoading\" ></span></button>",

            link: function (scope, element, attrs) {
                element.on('click', function () {
                    scope.button.text = scope.button.textLoading;
                    scope.button.cssClass = scope.button.cssClassLoading;
                    scope.button.hideLoading = false;
                    scope.$apply(function (id) {
                    });
                });
            }
        }
    });