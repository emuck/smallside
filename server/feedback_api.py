import json,secrets
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from datetime import datetime
P=Path(__file__).resolve().parents[1]/"data"/"reflections"/"inbox"; F={"moving with the ball","1v1 attacking","protecting the ball","finding space","finishing","winning it back","playing with others","confidence / belonging"}
class H(BaseHTTPRequestHandler):
 def out(s,n,x):
  b=json.dumps(x).encode();s.send_response(n);s.send_header("Content-Type","application/json");s.send_header("Content-Length",str(len(b)));s.end_headers();s.wfile.write(b)
 def do_GET(s):s.out(200,{"status":"ok"}) if s.path=="/health" else s.out(404,{"error":"not found"})
 def do_POST(s):
  try:
   if s.path!="/reflections":return s.out(404,{"error":"not found"})
   n=int(s.headers.get("Content-Length",0));assert 1<n<=16384;d=json.loads(s.rfile.read(n));assert set(d)<={"schema_version","event_type","date","joy","independent_behaviour","focus","engagement","challenge","context","created_at"};assert d["event_type"] in {"practice","game"} and all(x in F for x in d["focus"]) and d["engagement"] in {1,2,3};datetime.strptime(d["date"],"%Y-%m-%d");assert 0<len(d["joy"])<=2000 and 0<len(d["independent_behaviour"])<=2000 and len(d.get("context",""))<=2000
   name=f'{d["date"]}-{d["event_type"]}-{secrets.token_hex(4)}.json';P.mkdir(parents=True,exist_ok=True);(P/name).write_text(json.dumps(d,indent=2)+"\n");s.out(201,{"saved":True,"filename":name})
  except Exception:s.out(400,{"error":"invalid reflection"})
 def log_message(s,*a):pass
ThreadingHTTPServer(("127.0.0.1",8092),H).serve_forever()
