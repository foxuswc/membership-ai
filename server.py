from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import json, os
from engine import decide, BENEFITS
ROOT=Path(__file__).parent
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw): super().__init__(*a,directory=str(ROOT/'static'),**kw)
    def reply(self,data,status=200):
        raw=json.dumps(data,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
    def do_GET(self):
        if self.path=='/api/benefits':return self.reply(list(BENEFITS.values()))
        if self.path=='/api/status':return self.reply({'llm_configured':bool(os.getenv('MEMBERSHIP_LLM_URL') and os.getenv('MEMBERSHIP_LLM_MODEL'))})
        super().do_GET()
    def do_POST(self):
        if self.path!='/api/recommend':return self.reply({'error':'not found'},404)
        try:
            size=int(self.headers.get('Content-Length','0'))
            if size>100000:return self.reply({'error':'request too large'},413)
            body=json.loads(self.rfile.read(size));self.reply(decide(body))
        except Exception:return self.reply({'error':'请求格式有误，请检查输入'},400)
if __name__=='__main__':
    port=int(os.getenv('PORT','8000'));print(f'打开 http://127.0.0.1:{port}（Ctrl+C停止）');ThreadingHTTPServer(('127.0.0.1',port),Handler).serve_forever()
