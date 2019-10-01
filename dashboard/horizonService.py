import requests


class HorizonServiceAPI:
    def __init__(self, url, payload=None, headers=None, cookies=None):
        self.url = url
        self.payload = payload
        self.headers = headers
        self.cookies = cookies

    def get_request_handler(self):
        return requests.get(self.url, headers=self.headers, cookies=self.cookies)

    def post_request_handler(self):
        return requests.post(self.url, headers=self.headers, data=self.payload,
                             cookies=self.cookies)
