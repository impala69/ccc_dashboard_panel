var myApp = angular.module('dashboard', ['ui.router', 'ngCookies', 'satellizer']);

myApp.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

myApp.config(function ($stateProvider, $authProvider) {
    $authProvider.tokenType = 'Token';
    var login = {
        name: 'login',
        url: '/login',
        templateUrl: 'static/modules/dashboard/views/login.html'
    };
    var dashboard = {
        name: 'dashboard',
        url: '/dashboard',
        templateUrl: 'static/modules/dashboard/views/dashboard.html'
    };

    var vps_list = {
        name: 'dashboard.vps_list',
        url: '/vps_list',
        templateUrl: 'static/modules/dashboard/views/vps_list.html'
    };

    var overview = {
        name: 'dashboard.overview',
        url: '/overview',
        templateUrl: 'static/modules/dashboard/views/overview.html'
    };

    var key_pairs = {
        name: 'dashboard.key_pairs',
        url: '/key_pairs',
        templateUrl: 'static/modules/dashboard/views/key_pairs.html'
    };

    $stateProvider.state(login);
    $stateProvider.state(dashboard);
    $stateProvider.state(vps_list);
    $stateProvider.state(overview);
    $stateProvider.state(key_pairs);
});

angular.module("dashboard")
    .filter("persianNumber", function () {
        return function (number) {
            var translation = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
            var persianNumber = '';
            var englishNumber = String(number);
            for (var i = 0; i < englishNumber.length; i++) {
                var translatedChar = (isNaN(englishNumber.charAt(i)) || englishNumber.charAt(i) == ' ' || englishNumber.charAt(i) == '\n') ? englishNumber.charAt(i) : translation[parseInt(englishNumber.charAt(i))];
                persianNumber = persianNumber + translatedChar;
            }
            return persianNumber;
        };
    });

myApp.directive('format', function ($filter) {
    'use strict';

    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) {
                return;
            }

            ctrl.$formatters.unshift(function () {
                return $filter('number')(ctrl.$modelValue);
            });

            ctrl.$parsers.unshift(function (viewValue) {
                var plainNumber = viewValue.replace(/[\,\.]/g, ''),
                    b = $filter('number')(plainNumber);

                elem.val(b);

                return plainNumber;
            });
        }
    };
});


myApp.directive('selectOnClick', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                if (!$window.getSelection().toString()) {
                    // Required for mobile Safari
                    this.setSelectionRange(0, this.value.length)
                }
            });
        }
    };
}]);
