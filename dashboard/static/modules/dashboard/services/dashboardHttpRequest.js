angular.module('dashboard')
    .service('dashboardHttpRequest', function dashboardHttpRequest($q, $http, $auth, $cookies) {
        var service = {
            'API_URL': window.location.origin,
            'use_session': false,
            'authenticated': null,
            'authPromise': null,
            'request': function (args) {
                if ($auth.getToken()) {
                    $http.defaults.headers.common.Authorization = 'Token ' + $auth.getToken();
                }
                // Continue
                params = args.params || {};
                args = args || {};
                var deferred = $q.defer(),
                    url = this.API_URL + args.url,
                    method = args.method || "GET",
                    params = params,
                    data = args.data || {};
                // Fire the request, as configured.
                $http({
                    url: url,
                    withCredentials: this.use_session,
                    method: method.toUpperCase(),
                    headers: {'X-CSRFToken': $cookies.get("csrftoken")},
                    params: params,
                    data: data
                })
                    .then(angular.bind(this, function (data, status, headers, config) {
                        deferred.resolve(data, status);
                    }));
                return deferred.promise;
            },
            'get_login_csrf': function (data) {
                return this.request({
                    'method': "GET",
                    'url': "/ccc/auth/login/",
                    'data': data
                });
            },
            'login': function (data) {
                return this.request({
                    'method': "POST",
                    'url': "/ccc/auth/login/",
                    'data': data
                });
            },
            'get_all_vps': function (data) {
                return this.request({
                    'method': "GET",
                    'url': "/ccc/vps/",
                    'data': data
                });
            },
            'get_overview': function (data) {
                return this.request({
                    'method': "GET",
                    'url': "/ccc/get_overview/",
                    'data': data
                });
            },
            'get_key_pairs': function (data) {
                return this.request({
                    'method': "GET",
                    'url': "/ccc/keypairs/",
                    'data': data
                });
            },
            'create_key_pair': function () {
                return this.request({
                    'method': "POST",
                    'url': "/ccc/keypairs/"
                });
            },
            'get_key_pair': function (keypair_name) {
                return this.request({
                    'method': "GET",
                    'url': "/ccc/keypairs/" + keypair_name + "/"
                });
            }



        };
        return service;

    });