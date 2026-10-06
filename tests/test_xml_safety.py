import importlib.util,pathlib,unittest,zipfile,io
spec=importlib.util.spec_from_file_location('parser',pathlib.Path(__file__).parents[1]/'backend/services/xml_parser.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
class ParserTests(unittest.TestCase):
 def test_non_invoice_rejected(self):
  with self.assertRaises(ValueError):mod.parse_vietnam_invoice_xml(b'<anything/>')
 def test_entities_rejected(self):
  with self.assertRaises(ValueError):mod.parse_vietnam_invoice_xml(b'<!DOCTYPE root [<!ENTITY x "test">]><root>&x;</root>')
 def test_oversized_xml_rejected(self):
  with self.assertRaises(ValueError):mod.parse_vietnam_invoice_xml(b'<x>'+b'a'*5_242_880+b'</x>')
 def test_zip_expansion_rejected(self):
  bio=io.BytesIO()
  with zipfile.ZipFile(bio,'w',zipfile.ZIP_DEFLATED) as z:z.writestr('huge.xml',b'x'*6_000_000)
  with self.assertRaises(ValueError):mod.parse_invoices_zip(bio.getvalue())
 def test_missing_number_rejected(self):
  with self.assertRaises(ValueError):mod.parse_vietnam_invoice_xml(b'<HDon><TTChung/><NBan><MST>fixture</MST></NBan></HDon>')
 def test_valid_invoice(self):
  result=mod.parse_vietnam_invoice_xml(b'<HDon><TTChung><SHDon>12</SHDon><NLap>2026-01-01</NLap></TTChung><NBan><MST>test-tax-code</MST></NBan><TToan><TgTCThue>100</TgTCThue></TToan></HDon>')
  self.assertEqual(result['number'],'00000012');self.assertEqual(result['pre_tax_amount'],100)
if __name__=='__main__':unittest.main()
