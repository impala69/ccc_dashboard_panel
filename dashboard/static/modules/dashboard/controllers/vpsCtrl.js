angular.module("dashboard")
    .controller("vpsCtrl", function ($scope, $interval, $rootScope, $state, dashboardHttpRequest, $timeout) {
        var initialize = function () {
            $scope.vps_list = [];
            $scope.attached_volume = "";
            $scope.detached_volume = "";
            $scope.new_instance_data = {
                "name": "",
                "description": "",
                "image_id": "",
                "flavor_id": "",
                "network_id": "",
                "count": 1
            };
            $scope.get_vps_list();
            $scope.get_volumes();
            $scope.get_images();
            $scope.get_flavors();
            $scope.get_networks();
            $scope.refresh_servers_button = {
                text: "به روزرسانی وضعیت سرورها",
                cssClass: 'btn btn-primary create-btn',
                hideLoading: true,
                textLoading: '',
                cssClassLoading: 'btn btn-primary create-btn'
            };

            $scope.attach_volume_button = {
                text: "اختصاص",
                cssClass: 'btn btn-primary escape-left',
                hideLoading: true,
                textLoading: '',
                cssClassLoading: 'btn btn-primary escape-left'
            };

            $scope.delete_server_button = {
                text: "حذف سرور",
                cssClass: 'btn btn-danger submit-btn escape-left',
                hideLoading: true,
                textLoading: '',
                cssClassLoading: 'btn btn-danger submit-btn escape-left'
            };

            $scope.create_server_button = {
                text: "ایجاد سرور",
                cssClass: 'btn btn-primary submit-btn escape-left',
                hideLoading: true,
                textLoading: '',
                cssClassLoading: 'btn btn-primary submit-btn escape-left'
            };
        };
        $scope.get_vps_list = function () {
            dashboardHttpRequest.get_all_vps()
                .then(function (data) {
                    $scope.refresh_servers_button.hideLoading = true;
                    $scope.refresh_servers_button.text = "به روزرسانی وضعیت سرورها";
                    $rootScope.is_page_loading = false;
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.vps_list = data['data']['vps_list'];
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.get_volumes = function () {
            dashboardHttpRequest.get_volumes()
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.volumes = data['data']['volumes'];
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };
        $scope.get_flavors = function () {
            dashboardHttpRequest.get_flavors()
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.flavors = data['data']['flavors'];
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };
        $scope.get_networks = function () {
            dashboardHttpRequest.get_networks()
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.networks = data['data']['networks'];
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.get_images = function () {
            dashboardHttpRequest.get_images()
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.images = data['data']['images'];
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.vps_action = function (server_id, action_name) {
            var sending_data = {};
            if (action_name === "SHUTOFF") {
                sending_data['action_data'] = {"os-stop": null};
            }
            else if (action_name === "REBOOT") {
                sending_data['action_data'] = {"reboot": {"type": "HARD"}};
            }
            else if (action_name === "START") {
                sending_data['action_data'] = {"os-start": null};
            }
            else if (action_name === "CONSOLE") {
                sending_data['action_data'] = {"os-getVNCConsole": {"type": "novnc"}};
            }
            dashboardHttpRequest.vps_detail(server_id, sending_data)
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $timeout(function () {
                            if (action_name !== "CONSOLE") {
                                $scope.get_vps_list();
                            }
                        }, 5000);
                        if (action_name === "CONSOLE") {
                            $scope.console_url = data['data']['console_url'];
                            $rootScope.open_modal("console_show");
                        }
                    }
                    else if (response === 401) {
                        $state.go("login");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.create_vps = function () {
            dashboardHttpRequest.create_vps($scope.new_instance_data)
                .then(function (data) {
                    $scope.create_server_button.hideLoading = true;
                    $scope.create_server_button.text = "ایجاد سرور";
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.close_modal("instance_create");
                        $scope.get_vps_list();
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.delete_vps = function (server_id) {
            dashboardHttpRequest.delete_vps(server_id)
                .then(function (data) {
                    $scope.deleteing_vps_id = server_id;
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $timeout(function () {
                            $scope.get_vps_list();
                            $scope.delete_server_button.hideLoading = true;
                    $scope.delete_server_button.text = "حذف سرور";
                            $scope.close_modal("instance_delete");
                        }, 4000);
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.delete_vps_permission_modal = function (server_id) {
            $scope.deleteing_vps_id = server_id;
            $scope.open_modal('instance_delete');
        };

        $scope.get_attachments = function (server_id) {
            dashboardHttpRequest.get_attachments(server_id)
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.server_for_attach_or_detach = server_id;
                        $scope.attachment_volumes = data['data']['volumes_attachments'];
                        $scope.open_modal('volume_detachment');
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.create_attachment = function (server_id) {
            var sending_data = {
                'volume_id': $scope.attached_volume
            };
            dashboardHttpRequest.create_attachment(sending_data, server_id)
                .then(function (data) {
                    $scope.attach_volume_button.hideLoading = true;
                    $scope.attach_volume_button.text = "اختصاص";
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.close_modal("volume_attachment");
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.delete_attachment = function (server_id) {
            var sending_data = {
                'volume_id': $scope.detached_volume
            };
            dashboardHttpRequest.delete_attachment(sending_data, server_id)
                .then(function (data) {
                    var response = data['data']['response_code'];
                    if (response === 200) {
                        $scope.close_modal('volume_detachment');
                    }
                }, function (error) {
                    console.log(error);
                });
        };

        $scope.open_delete_attachment = function (server_id) {
            $scope.server_for_attach_or_detach = server_id;
            $scope.open_modal('volume_attachment');
        };

        initialize();

    });