"""Public, read-only demo adapter for MemberShip AI. No real transactions or LLM calls."""
import json
from pathlib import Path
from engine import decide, BENEFITS

INDEX = Path(__file__).resolve().parent / "static" / "index.html"
MAX_BODY = 100_000

def application(environ, start_response):
    method = environ.get("REQUEST_METHOD", "GET")
    path = environ.get("PATH_INFO", "/")
    def respond(status, body, content_type="application/json; charset=utf-8"):
        raw = body if isinstance(body, bytes) else json.dumps(body, ensure_ascii=False).encode("utf-8")
        start_response(status, [
            ("Content-Type", content_type), ("Content-Length", str(len(raw))),
            ("Cache-Control", "no-store"), ("X-Content-Type-Options", "nosniff"),
            ("X-Frame-Options", "DENY"), ("Referrer-Policy", "no-referrer"),
        ])
        return [b"" if method == "HEAD" else raw]
    if method in ("GET", "HEAD"):
        if path in ("/", "/index.html"):
            return respond("200 OK", INDEX.read_bytes(), "text/html; charset=utf-8")
        if path in ("/assets/hotel.png", "/assets/cinema.jpg"):
            asset = INDEX.parent / path.lstrip("/")
            return respond("200 OK", asset.read_bytes(), "image/png" if path.endswith(".png") else "image/jpeg")
        if path == "/health":
            return respond("200 OK", {"ok": True})
        if path == "/api/status":
            return respond("200 OK", {"llm_configured": False, "cloud_demo": True})
        if path == "/api/benefits":
            return respond("200 OK", list(BENEFITS.values()))
    if method == "POST" and path == "/api/recommend":
        try:
            length = int(environ.get("CONTENT_LENGTH") or 0)
            if length > MAX_BODY:
                return respond("413 Payload Too Large", {"error": "请求过大"})
            if length <= 0 or environ.get("CONTENT_TYPE", "").split(";")[0].strip().lower() != "application/json":
                return respond("400 Bad Request", {"error": "需要 JSON 请求"})
            payload = json.loads(environ["wsgi.input"].read(length))
            if not isinstance(payload, dict) or not isinstance(payload.get("query", ""), str) or not isinstance(payload.get("orders", {}), dict):
                return respond("400 Bad Request", {"error": "请求格式有误"})
            # Public demo must never spend the owner's model quota.
            requested_llm = payload.get("mode") == "llm"
            payload["mode"] = "rules"
            result = decide(payload)
            if requested_llm:
                result["warning"] = "公开演示仅运行规则基线，未调用大模型。"
            return respond("200 OK", result)
        except (ValueError, TypeError, KeyError, AttributeError, ArithmeticError):
            return respond("400 Bad Request", {"error": "请求格式有误，请检查输入"})
    return respond("404 Not Found", {"error": "not found"})
