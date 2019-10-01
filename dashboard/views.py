from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
import requests, json
from bs4 import BeautifulSoup
from .horizonService import HorizonServiceAPI

DATA_REQUIRE = "اطلاعات را به شکل کامل وارد کنید."


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
        csrf = rec_data['csrf']
        cookies = rec_data['cookies']
        if not username:
            return Response(data={"response_code": 300, "error_msg": DATA_REQUIRE})
        if not password:
            return Response(data={"response_code": 300, "error_msg": DATA_REQUIRE})
        if not csrf:
            return Response(data={"response_code": 300, "error_msg": DATA_REQUIRE})

        login_data = {
            "username": username,
            "password": password
        }
        headers = {
            "X-CSRFTOKEN": csrf,
            "Content-Type": "application/x-www-form-urlencoded"
        }
        response_data = HorizonServiceAPI("http://10.254.254.201/horizon/auth/login/", payload=login_data,
                                          headers=headers, cookies=cookies).post_request_handler()
        request.session['auth_session'] = dict(response_data.cookies)
        return Response(data={'response_code': 200})


@permission_classes((permissions.AllowAny,))
class VPS(APIView):
    def get(self, request):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 403, "error_msg": DATA_REQUIRE})

        headers_vps_list = {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest"
        }
        cookies = request.session.get('auth_session', None)

        response_data_vps_list = HorizonServiceAPI("http://10.254.254.201/horizon/api/nova/servers/",
                                                   headers=headers_vps_list, cookies=cookies).get_request_handler()

        serialized_vps_data = []
        response_data = response_data_vps_list.json()
        if response_data == "not logged in":
            return Response(data={"response_code": 403})
        all_vps = response_data['items']
        for item in all_vps:
            print(item)
            ip_address_dict = next(iter(item['addresses'].values()))
            print(item['id'])
            serialized_vps_data.append({
                "instance_name": item['name'],
                "ip_addr": ip_address_dict[0]['addr'],
                "created": item['created'],
                "image_name": item['image_name'],
                "key_name": item['key_name']
            })

        return Response(data={'response_code': 200, "vps_list": serialized_vps_data})


@permission_classes((permissions.AllowAny,))
class KeyPairs(APIView):
    def get(self, request):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 403, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest"
        }
        cookies = request.session.get('auth_session', None)

        response_data = HorizonServiceAPI("http://10.254.254.201/horizon/api/nova/keypairs",
                                          headers=headers, cookies=cookies).get_request_handler()

        res = response_data.json()
        if res == "not logged in":
            return Response(data={"response_code": 403})

        return Response(data={'response_code': 200, "keypairs": res['items']})

    def post(self, request):
        pass


@permission_classes((permissions.AllowAny,))
class KeyPairDetail(APIView):
    def get(self, request, name, format=None):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 403, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest"
        }
        cookies = request.session.get('auth_session', None)

        response_data = HorizonServiceAPI("http://10.254.254.201/horizon/api/nova/keypairs/" + name,
                                          headers=headers, cookies=cookies).get_request_handler()

        res = response_data.json()
        if res == "not logged in":
            return Response(data={"response_code": 403})
        print(res)

        return Response(data={'response_code': 200, "keypair": res})


@permission_classes((permissions.AllowAny,))
class Overview(APIView):
    def get(self, request):
        if not request.session.get('auth_session', None):
            return Response(data={"response_code": 403, "error_msg": DATA_REQUIRE})

        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest"
        }
        cookies = request.session.get('auth_session', None)

        response_data = HorizonServiceAPI("http://10.254.254.201/horizon/api/nova/limits/",
                                          headers=headers, cookies=cookies).get_request_handler()

        res = response_data.json()
        if res == "not logged in":
            return Response(data={"response_code": 403})

        return Response(data={'response_code': 200, "overview": res})
