import importlib.util,pathlib,sys,types,unittest
from unittest.mock import patch
class HTTPException(Exception):
 def __init__(self,status_code,detail):self.status_code=status_code
fake=types.ModuleType('fastapi');fake.Header=lambda default=None:default;fake.HTTPException=HTTPException;fake.Depends=lambda x:x;sys.modules['fastapi']=fake
settings=types.SimpleNamespace(SUPABASE_URL='https://test.supabase.co',SUPABASE_KEY='test-key',SECRET_KEY='')
config=types.ModuleType('config');config.settings=settings;sys.modules['config']=config
spec=importlib.util.spec_from_file_location('tenant_auth',pathlib.Path(__file__).parents[1]/'backend/auth/supabase_jwt.py');auth=importlib.util.module_from_spec(spec);spec.loader.exec_module(auth)
class Response:
 def __init__(self,status,data):self.status_code=status;self.data=data
 def json(self):return self.data
class AuthTests(unittest.TestCase):
 def reject(self,code,authorization=None,x_test_tenant=None):
  with self.assertRaises(HTTPException) as err:auth.get_current_tenant_id(authorization,x_test_tenant)
  self.assertEqual(err.exception.status_code,code)
 def test_anonymous(self):self.reject(401)
 def test_test_header(self):self.reject(401,x_test_tenant='other-tenant')
 def test_mock_token(self):self.reject(401,'u-sme-001')
 def test_malformed_bearer(self):self.reject(401,'Bearer ')
 def test_invalid_auth(self):
  with patch('requests.get',return_value=Response(401,{})):self.reject(401,'Bearer bad')
 def test_unknown_tenant(self):
  with patch('requests.get',side_effect=[Response(200,{'id':'user'}),Response(200,[])]):self.reject(403,'Bearer signed')
 def test_provider_outage(self):
  import requests
  with patch('requests.get',side_effect=requests.RequestException('outage')):self.reject(503,'Bearer signed')
 def test_verified_tenant(self):
  with patch('requests.get',side_effect=[Response(200,{'id':'user'}),Response(200,[{'tenant_id':'tenant-verified'}])]) as request:
   self.assertEqual(auth.get_current_tenant_id('Bearer signed',None),'tenant-verified');self.assertEqual(request.call_count,2);self.assertEqual(request.call_args.kwargs['headers']['Authorization'],'Bearer signed')
 def test_admin_requires_verified_role(self):
  with patch('requests.get',side_effect=[Response(200,{'id':'user','user_metadata':{'role':'ADMIN'}}),Response(200,[{'tenant_id':'t','role':'OWNER'}])]):
   with self.assertRaises(HTTPException) as err:auth.require_admin('Bearer signed')
   self.assertEqual(err.exception.status_code,403)
if __name__=='__main__':unittest.main()
