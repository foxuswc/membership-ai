import io
import json
import unittest
from cloud_app import application

class CloudTests(unittest.TestCase):
    def request(self, path, method="GET", data=None):
        raw = json.dumps(data).encode() if data is not None else b""
        response = {}
        def start(status, headers):
            response["status"] = status
            response["headers"] = dict(headers)
        body = b"".join(application({"PATH_INFO":path, "REQUEST_METHOD":method,
            "CONTENT_LENGTH":str(len(raw)), "CONTENT_TYPE":"application/json",
            "wsgi.input":io.BytesIO(raw)}, start))
        return response["status"], body
    def test_index(self):
        status, body = self.request("/")
        self.assertEqual(status, "200 OK")
        self.assertIn(b"MemberShip AI", body)
    def test_health(self):
        self.assertEqual(json.loads(self.request("/health")[1]), {"ok":True})
    def test_catalog(self):
        self.assertEqual(len(json.loads(self.request("/api/benefits")[1])), 4)
    def test_recommend(self):
        data = {"query":"看电影", "member":"vip", "mode":"llm", "orders":{"movie":{"price":65,"provided":True,"eligible":True,"state":"available"}}}
        status, body = self.request("/api/recommend", "POST", data)
        self.assertEqual(status, "200 OK")
        result=json.loads(body)
        self.assertEqual(result["saving"], 5)
        self.assertTrue(result["warning"])
    def test_invalid(self):
        self.assertTrue(self.request("/api/recommend","POST",[])[0].startswith("400"))
    def test_no_source_exposure(self):
        self.assertTrue(self.request("/engine.py")[0].startswith("404"))
