import subprocess,time,urllib.request,urllib.error,json,pathlib,os
p=pathlib.Path(__file__).parents[1]
env=os.environ.copy();env.update(SUPABASE_URL='https://test.invalid',SUPABASE_KEY='')
log=(p/'.artifacts/backend-http.log').open('w')
server=subprocess.Popen([os.environ.get('TEAM03_PYTHON','/tmp/team03-venv/bin/python'),'-m','uvicorn','main:app','--host','127.0.0.1','--port','8013'],cwd=p/'backend',stdout=log,stderr=log,env=env)
results=[]
try:
 for _ in range(40):
  try:urllib.request.urlopen('http://127.0.0.1:8013/',timeout=1);break
  except Exception:time.sleep(.25)
 cases=[('/',None,{},200),('/api/admin/session',None,{},401),('/api/admin/session',None,{'X-Test-Tenant':'t-001'},401),('/api/advisor/chat',b'question=fixture',{},401),('/api/admin/session',None,{'Authorization':'Bearer bad'},503)]
 for route,data,headers,expected in cases:
  req=urllib.request.Request('http://127.0.0.1:8013'+route,data=data,headers=headers)
  try:
   res=urllib.request.urlopen(req,timeout=5);status=res.status
  except urllib.error.HTTPError as e:status=e.code
  assert status==expected,(route,status,expected)
  results.append({'route':route,'status':status,'expected':expected})
 (p/'.artifacts/backend-http.json').write_text(json.dumps({'status':'PASS','checks':results},indent=2))
 print('Real loopback HTTP 5 checks passed')
finally:
 server.terminate()
 try:server.wait(timeout=5)
 except subprocess.TimeoutExpired:server.kill();server.wait()
 log.close()
