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
            'create_vps': function (data) {
                return this.request({
                    'method': "POST",
                    'url': "/ccc/vps/",
                    'data': data
                });
            },
            'delete_vps': function (server_id) {
                return this.request({
                    'method': "DELETE",
                    'url': "/ccc/vps/" + server_id + "/"
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
            'create_key_pair': function (data) {
                return this.request({
                    'method': "POST",
                    'url': "/ccc/keypairs/",
                    'data': data
                });
            },
            'get_key_pair': function (keypair_name) {
                return this.request({
                    'method': "GET",
                    'url': "/ccc/keypairs/" + keypair_name + "/"
                });
            },
            'delete_key_pair': function (keypair_name) {
                return this.request({
                    'method': "DELETE",
                    'url': "/ccc/keypairs/" + keypair_name + "/"
                });
            },
            'get_volumes': function (data) {
                return this.request({
                    'method': "GET",
                    'url': "/ccc/volumes/",
                    'data': data
                });
            },
            'create_volume': function (data) {
                return this.request({
                    'method': "POST",
                    'url': "/ccc/volumes/",
                    'data': data
                });
            },
            'get_volume': function (volume_name) {
                return this.request({
                    'method': "GET",
                    'url': "/ccc/volumes/" + volume_name + "/"
                });
            },
            'delete_volume': function (volume_name) {
                return this.request({
                    'method': "DELETE",
                    'url': "/ccc/volumes/" + volume_name + "/"
                });
            },
            'get_user': function () {
                return this.request({
                    'method': "GET",
                    'url': "/ccc/users/"
                });
            },
            'change_user_password': function (data) {
                return this.request({
                    'method': "POST",
                    'url': "/ccc/users/",
                    'data': data
                });
            },
            'vps_detail': function (server_id, data) {
                return this.request({
                    'method': "POST",
                    'url': "/ccc/vps-detail/" + server_id + "/action/",
                    'data': data
                });
            },
            'get_images': function () {
                return this.request({
                    'method': "GET",
                    'url': "/ccc/images/"
                });
            },
            'get_networks': function () {
                return this.request({
                    'method': "GET",
                    'url': "/ccc/networks/"
                });
            },
            'get_flavors': function () {
                return this.request({
                    'method': "GET",
                    'url': "/ccc/flavors/"
                });
            }



        };
        return service;

    });