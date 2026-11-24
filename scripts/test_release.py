import copy,importlib.util,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('publisher',Path(__file__).with_name('publish-release.py'));publisher=importlib.util.module_from_spec(spec);spec.loader.exec_module(publisher)
class PublisherTest(unittest.TestCase):
 def fixture(self):
  source='a'*40;run={'name':'Strategy Generator checks','conclusion':'success','head_sha':source,'path':'.github/workflows/ci.yml'};jobs=[{'name':f'check ({os}, {node})','conclusion':'success'} for os in ['ubuntu-22.04','windows-2022','macos-15'] for node in [18,24]];return source,run,jobs
 def test_accepts_exact_source_and_complete_matrix(self):
  source,run,jobs=self.fixture();publisher.validate_ci(run,jobs,source)
 def test_rejects_changed_source_failed_or_incomplete_checks(self):
  source,run,jobs=self.fixture()
  for key,value in [('head_sha','b'*40),('conclusion','failure'),('name','Other'),('path','unexpected.yml')]:
   changed=dict(run);changed[key]=value
   with self.assertRaises(AssertionError):publisher.validate_ci(changed,jobs,source)
  for changed in [jobs[:-1],jobs+[jobs[0]],[dict(j,conclusion='skipped') for j in jobs],[dict(j,name='unrelated') for j in jobs]]:
   with self.assertRaises(AssertionError):publisher.validate_ci(run,changed,source)
if __name__=='__main__':unittest.main()
