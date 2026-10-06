import subprocess,sys,pathlib,os
p=pathlib.Path(__file__).parent
env=os.environ.copy();env['TEAM03_PYTHON']=sys.executable
for script in ['test_auth.py','test_xml_safety.py','test_rag_integrity.py','test_api.py','backend-http.py']:
 result=subprocess.run([sys.executable,str(p/script)],env=env,timeout=60)
 if result.returncode:sys.exit(result.returncode)
print('Backend 26 test methods and 5 real HTTP checks passed')
