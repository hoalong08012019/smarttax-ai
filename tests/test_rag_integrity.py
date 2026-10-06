import importlib.util,pathlib,types,sys,unittest
settings=types.SimpleNamespace(OPENAI_API_KEY=None,GEMINI_API_KEY=None,SUPABASE_URL='',SUPABASE_KEY='')
config=types.ModuleType('config');config.settings=settings;sys.modules['config']=config
spec=importlib.util.spec_from_file_location('rag',pathlib.Path(__file__).parents[1]/'backend/services/rag_advisor.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
class IntegrityTests(unittest.TestCase):
 def test_embedding_cannot_fabricate(self):
  with self.assertRaises(RuntimeError):mod.generate_text_embedding('fixture')
 def test_retrieval_cannot_fabricate(self):
  with self.assertRaises(RuntimeError):mod.search_semantic_knowledge([0.0])
 def test_advisor_cannot_fabricate(self):
  with self.assertRaises(RuntimeError):mod.ask_llm_advisor('fixture','')
 def test_index_requires_persistence(self):
  with self.assertRaises(RuntimeError):mod.index_document_source('fixture','fixture','fixture')
if __name__=='__main__':unittest.main()
