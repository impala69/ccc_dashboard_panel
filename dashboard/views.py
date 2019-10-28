from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
import json
from bs4 import BeautifulSoup
from .horizonService import HorizonServiceAPI

DATA_REQUIRE = "اطلاعات را به شکل کامل وارد کنید."

POWER_STATES = [
    'NOSTATE',
    'RUNNING',
    'PAUSED',
    'SHUTDOWN',
    'CRASHED',
    'SUSPENDED'
]


@permission_classes((permissions.AllowAny,))
class Login(APIView):
    def get(self, request):
        response_data = HorizonServiceAPI("http://10.254.254.201/horizon/auth/login/").get_request_handler()
        soup = BeautifulSoup(response_data.content, 'html5lib')
        csrf_input = soup.find('input', attrs={'name': 'csrfmiddlewaretoken'})
        csrf = csrf_input['value']
        return Response(data={'response_code': 200, 'csrf': csrf, "cookies": dict(response_data.cookies)})

    def post(self, request):
        rec_data = json.loads(request.read().decode('utf-8'))
        username = rec_data['username']
        password = rec_data['password']

        if not username:
            return Response(data={"response_code": 300, "error_msg": DATA_REQUIRE})
        if not password:
            return Response(data={"response_code": 300, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
        }

        login_data = {
            "auth": {
                "identity": {
                    "methods": [
                        "password"
                    ],
                    "password": {
                        "user": {
                            "name": username,
                            "domain": {
                                "name": "Default"
                            },
                            "password": password
                        }
                    }
                }
            }
        }

        response_data = HorizonServiceAPI("http://10.254.254.201:5000/v3/auth/tokens",
                                          payload=login_data, headers=headers).post_request_handler()
        response_data_json = response_data.json()
        user_obj = response_data_json['token']['user']
        username = user_obj['name']
        user_id = user_obj['id']

        auth_token = response_data.headers['X-Subject-Token']
        request.session['auth_session'] = auth_token
        request.session['user_id'] = user_id
        request.session['username'] = username
        return Response(data={'response_code': 200})


@permission_classes((permissions.AllowAny,))
class VPS(APIView):
    def get(self, request):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Auth-Token": request.session.get('auth_session', None)
        }

        response_data_vps_list = HorizonServiceAPI("http://10.254.254.201:8774/v2.1/servers/detail",
                                                   headers=headers).get_request_handler()

        serialized_vps_data = []
        response_data = response_data_vps_list.json()
        if response_data_vps_list.status_code == 401:
            return Response(data={"response_code": 401})
        all_vps = response_data['servers']
        for item in all_vps:
            print(item)
            ip_address_dict = next(iter(item['addresses'].values()))
            serialized_vps_data.append({
                "id": item['id'],
                "instance_name": item['name'],
                "ip_addr": ip_address_dict[0]['addr'],
                "created": item['created'],
                "image_name": "Undefined",
                "key_name": item['key_name'],
                "status": item['status'],
                "power_state": POWER_STATES[int(item['OS-EXT-STS:power_state'])],
            })

        return Response(data={'response_code': 200, "vps_list": serialized_vps_data})


@permission_classes((permissions.AllowAny,))
class VPSDetail(APIView):
    def post(self, request, server_id):
        rec_data = json.loads(request.read().decode('utf-8'))
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Auth-Token": request.session.get('auth_session', None)
        }

        payload = rec_data['action_data']

        response_data_vps_action = HorizonServiceAPI("http://10.254.254.201:8774/v2.1/servers/" + server_id + "/action",
                                                     headers=headers, payload=payload).post_request_handler()

        if payload['os-getVNCConsole']:
            return Response(data={'response_code': 200, 'console_url': response_data_vps_action.json()['console']['url']})

        return Response(data={'response_code': 200})


@permission_classes((permissions.AllowAny,))
class KeyPairs(APIView):
    def get(self, request):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Auth-Token": request.session.get('auth_session', None)
        }

        response_data = HorizonServiceAPI("http://10.254.254.201:8774/v2.1/os-keypairs",
                                          headers=headers).get_request_handler()

        res = response_data.json()
        if response_data.status_code == 401:
            return Response(data={"response_code": 401})

        return Response(data={'response_code': 200, "keypairs": res['keypairs']})

    def post(self, request):
        rec_data = json.loads(request.read().decode('utf-8'))
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        keypair_name = rec_data['name']

        if not keypair_name:
            return Response(data={"response_code": 300, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Auth-Token": request.session.get('auth_session', None)
        }

        new_key_pair_data = {
            "keypair": {
                "name": keypair_name,
            }
        }

        response_data = HorizonServiceAPI("http://10.254.254.201:8774/v2.1/os-keypairs",
                                          headers=headers,
                                          payload=new_key_pair_data).post_request_handler()

        res = response_data.json()
        print(res)
        if response_data.status_code == 401:
            return Response(data={"response_code": 401})

        return Response(data={'response_code': 200})


@permission_classes((permissions.AllowAny,))
class KeyPairDetail(APIView):
    def get(self, request, name, format=None):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Auth-Token": request.session.get('auth_session', None)
        }

        response_data = HorizonServiceAPI("http://10.254.254.201:8774/v2.1/os-keypairs/" + name,
                                          headers=headers).get_request_handler()

        res = response_data.json()
        if response_data.status_code == 401:
            return Response(data={"response_code": 401})

        return Response(data={'response_code': 200, "keypair": res['keypair']})

    def delete(self, request, name, format=None):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Auth-Token": request.session.get('auth_session', None)
        }

        response_data = HorizonServiceAPI("http://10.254.254.201:8774/v2.1/os-keypairs/" + name,
                                          headers=headers).delete_request_handler()

        if response_data.status_code == 401:
            return Response(data={"response_code": 401})

        return Response(data={'response_code': 200})


@permission_classes((permissions.AllowAny,))
class Overview(APIView):
    def get(self, request):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Auth-Token": request.session.get('auth_session', None)
        }

        response_data = HorizonServiceAPI("http://10.254.254.201:8774/v2.1/limits",
                                          headers=headers).get_request_handler()

        res = response_data.json()
        print(res)
        if response_data.status_code == 401:
            return Response(data={"response_code": 401})

        return Response(data={'response_code': 200, "overview": res['limits']['absolute']})


@permission_classes((permissions.AllowAny,))
class Volumes(APIView):
    def get(self, request):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Auth-Token": request.session.get('auth_session', None)
        }

        response_data = HorizonServiceAPI("http://10.254.254.201:8774/v2.1/os-volumes/detail",
                                          headers=headers).get_request_handler()

        res = response_data.json()
        for vol in res['volumes']:
            if not vol['displayName']:
                vol['displayName'] = vol['id']
        if response_data.status_code == 401:
            return Response(data={"response_code": 401})

        return Response(data={'response_code': 200, "volumes": res['volumes']})

    def post(self, request):
        rec_data = json.loads(request.read().decode('utf-8'))
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        volume_name = rec_data['name']
        volume_description = rec_data['description']
        volume_size = rec_data['size']

        if not volume_name or not volume_description or not volume_size:
            return Response(data={"response_code": 300, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Auth-Token": request.session.get('auth_session', None)
        }

        new_key_pair_data = {
            "volume": {
                "display_name": volume_name,
                "display_description": volume_description,
                "size": volume_size
            }
        }

        response_data = HorizonServiceAPI("http://10.254.254.201:8774/v2.1/os-volumes",
                                          headers=headers,
                                          payload=new_key_pair_data).post_request_handler()

        if response_data.status_code == 401:
            return Response(data={"response_code": 401})

        return Response(data={'response_code': 200})


@permission_classes((permissions.AllowAny,))
class VolumeDetail(APIView):
    def get(self, request, name, format=None):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Auth-Token": request.session.get('auth_session', None)
        }

        response_data = HorizonServiceAPI("http://10.254.254.201:8774/v2.1/os-volumes/" + name,
                                          headers=headers).get_request_handler()

        res = response_data.json()
        print(res)
        if response_data.status_code == 401:
            return Response(data={"response_code": 401})

        return Response(data={'response_code': 200, "volume": res['volume']})

    def delete(self, request, name, format=None):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Auth-Token": request.session.get('auth_session', None)
        }

        response_data = HorizonServiceAPI("http://10.254.254.201:8774/v2.1/os-volumes/" + name,
                                          headers=headers).delete_request_handler()

        if response_data.status_code == 401:
            return Response(data={"response_code": 401})

        return Response(data={'response_code': 200})


@permission_classes((permissions.AllowAny,))
class User(APIView):
    def get(self, request):
        if not request.session.get('auth_session', None) or not request.session.get('username',
                                                                                    None) or not request.session.get(
            'user_id', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        user_obj = {
            "user": {
                "name": request.session.get('username', None),
                "id": request.session.get('user_id', None)
            }
        }
        return Response(data={'response_code': 200, "user_data": user_obj})

    def post(self, request):
        if not request.session.get('auth_session', None) or not request.session.get('username',
                                                                                    None) or not request.session.get(
            'user_id', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        rec_data = json.loads(request.read().decode('utf-8'))
        old_password = rec_data['old_password']
        new_password = rec_data['new_password']
        re_new_password = rec_data['re_new_password']

        if not old_password or not new_password or not re_new_password:
            return Response(data={"response_code": 300, "error_msg": DATA_REQUIRE})

        if new_password != re_new_password:
            return Response(data={"response_code": 300, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
        }

        payload = {
            "user": {
                "password": new_password,
                "original_password": old_password
            }
        }

        user_id = request.session.get('user_id', None)

        response_data = HorizonServiceAPI("http://controller:5000/v3/users/" + user_id + "/password",
                                          payload=payload, headers=headers).post_request_handler()

        if response_data.status_code == 200:
            return Response(data={'response_code': 200})
        else:
            return Response(data={'response_code': 401})


@permission_classes((permissions.AllowAny,))
class Networks(APIView):
    def get(self, request):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Auth-Token": request.session.get('auth_session', None)
        }

        response_data = HorizonServiceAPI("http://10.254.254.201:9696/v2.0/networks",
                                          headers=headers).get_request_handler()

        res = response_data.json()
        if response_data.status_code == 401:
            return Response(data={"response_code": 401})

        return Response(data={'response_code': 200, "networks": res['networks']})


@permission_classes((permissions.AllowAny,))
class Images(APIView):
    def get(self, request):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Auth-Token": request.session.get('auth_session', None)
        }

        response_data = HorizonServiceAPI("http://10.254.254.201:9292//v2/images",
                                          headers=headers).get_request_handler()

        res = response_data.json()
        if response_data.status_code == 401:
            return Response(data={"response_code": 401})

        return Response(data={'response_code': 200, "images": res['images']})


@permission_classes((permissions.AllowAny,))
class Flavors(APIView):
    def get(self, request):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 401, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Auth-Token": request.session.get('auth_session', None)
        }

        response_data = HorizonServiceAPI("http://10.254.254.201:8774/v2.1/flavors",
                                          headers=headers).get_request_handler()

        res = response_data.json()
        if response_data.status_code == 401:
            return Response(data={"response_code": 401})

        return Response(data={'response_code': 200, "flavors": res['flavors']})