import pathlib,sys,unittest
from unittest.mock import patch
sys.path.insert(0,str(pathlib.Path(__file__).parents[1]/'backend'))
from fastapi.testclient import TestClient
import main
from config import settings
settings.SUPABASE_URL='https://test.supabase.co';settings.SUPABASE_KEY='fixture-key'
client=TestClient(main.app)
class Response:
 def __init__(self,data,status=200):self.status_code=status;self.data=data
 def json(self):return self.data
def profiles(role='OWNER'):
 return [Response({'id':'fixture-user'}),Response([{'tenant_id':'fixture-tenant','role':role}])]
class ApiTests(unittest.TestCase):
 def test_readonly_health(self):self.assertEqual(client.get('/').status_code,200)
 def test_cors_denies_untrusted_origin(self):
  r=client.options('/api/advisor/chat',headers={'Origin':'https://attacker.invalid','Access-Control-Request-Method':'POST'})
  self.assertEqual(r.status_code,400)
 def test_all_sensitive_endpoints_require_auth(self):
  calls=[
   ('/api/invoices/upload-zip',{}, {'file':('invoice.xml',b'<broken>')}),
   ('/api/bank/upload-statement',{}, {'file':('bank.csv',b'bad')}),
   ('/api/autopilot/run',{'company_name':'fixture','tax_code':'test','accounting_regime':'TT133'},None),
   ('/api/advisor/chat',{'question':'TEST'},None),
   ('/api/admin/index-source',{'source_id':'fixture','title':'fixture','content':'fixture'},None),
   ('/api/reporting/generate-xml',{'tax_code':'fixture','company_name':'fixture','accounting_regime':'TT133','period':'fixture'},None)]
  for url,data,files in calls:
   for headers in [{},{'X-Test-Tenant':'t-001'},{'Authorization':'Bearer fake'}]:
    with self.subTest(url=url,headers=list(headers)):
     with patch('requests.get',return_value=Response({},401)):
      self.assertEqual(client.post(url,data=data,files=files,headers=headers).status_code,401)
 def test_admin_only(self):
  with patch('requests.get',side_effect=profiles()):self.assertEqual(client.get('/api/admin/session',headers={'Authorization':'Bearer fixture'}).status_code,403)
  with patch('requests.get',side_effect=profiles('ADMIN')):self.assertEqual(client.get('/api/admin/session',headers={'Authorization':'Bearer fixture'}).status_code,200)
 def test_unsupported_upload_remains_client_error(self):
  with patch('requests.get',side_effect=profiles()):
   self.assertEqual(client.post('/api/invoices/upload-zip',files={'file':('notes.txt',b'dummy')},headers={'Authorization':'Bearer fixture'}).status_code,400)
 def test_upload_limit(self):
  with patch('requests.get',side_effect=profiles()):
   self.assertEqual(client.post('/api/invoices/upload-zip',files={'file':('huge.xml',b'x'*(10*1024*1024+1))},headers={'Authorization':'Bearer fixture'}).status_code,413)
 def test_autopilot_never_fabricates_completion(self):
  with patch('requests.get',side_effect=profiles()):
   r=client.post('/api/autopilot/run',data={'company_name':'fixture','tax_code':'fixture','accounting_regime':'TT133'},headers={'Authorization':'Bearer fixture'})
   self.assertEqual(r.status_code,503);self.assertNotIn('estimated_tax',r.json())
if __name__=='__main__':unittest.main()
