#!/usr/bin/env python3
"""Publish an exact checked source via a verified draft. Credentials stay in gh."""
import argparse,hashlib,json,re,subprocess,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def gh(*args):return subprocess.check_output(['gh',*args],cwd=ROOT,text=True)
def api(repo,route):return json.loads(gh('api','repos/'+repo+'/'+route))
def mutate(repo,route,body):
 with tempfile.NamedTemporaryFile(mode='w',suffix='.json') as request:
  json.dump(body,request);request.flush();return json.loads(gh('api','repos/'+repo+'/'+route,'--method','POST' if route=='releases' else 'PATCH','--input',request.name))
def main():
 p=argparse.ArgumentParser();p.add_argument('--repo',required=True);p.add_argument('--version',required=True);p.add_argument('--source',required=True);p.add_argument('--ci-run',required=True);a=p.parse_args()
 assert re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',a.repo) and re.fullmatch(r'\d+\.\d+\.\d+',a.version) and re.fullmatch('[0-9a-f]{40}',a.source) and a.ci_run.isdigit()
 assert gh('rev-parse','HEAD').strip()==a.source
 subprocess.run(['git','merge-base','--is-ancestor',a.source,'origin/main'],cwd=ROOT,check=True)
 assert json.loads((ROOT/'manifest.json').read_text())['version']==a.version
 run=api(a.repo,'actions/runs/'+a.ci_run);assert run['name']=='Strategy Generator checks' and run['conclusion']=='success' and run['head_sha']==a.source
 assert run['path']=='.github/workflows/ci.yml'
 jobs=api(a.repo,'actions/runs/'+a.ci_run+'/jobs')['jobs'];assert len(jobs)==6 and all(j['conclusion']=='success' for j in jobs)
 package=ROOT/'dist'/f'strategy-generator-{a.version}.zip';sidecar=package.with_suffix('.zip.sha256');digest=hashlib.sha256(package.read_bytes()).hexdigest();assert sidecar.read_text().split()==[digest,package.name]
 existing=[r for r in api(a.repo,'releases') if r['tag_name']=='v'+a.version]
 if existing:
  assert len(existing)==1 and existing[0]['draft'] and existing[0]['target_commitish']==a.source;release=existing[0]
 else:
  notes=(ROOT/'docs/RELEASE-NOTES-0.1.0.md').read_text()+f'\n\nSource: {a.source}\nCI: https://github.com/{a.repo}/actions/runs/{a.ci_run}\n'
  release=mutate(a.repo,'releases',{'tag_name':'v'+a.version,'target_commitish':a.source,'name':'Strategy Generator '+a.version+' · 策略参数生成器','body':notes,'draft':True,'prerelease':True})
 files=[package,sidecar];expected={f.name for f in files};assert not ({x['name'] for x in release['assets']}-expected)
 for f in files:
  if f.name not in {x['name'] for x in release['assets']}:subprocess.run(['gh','release','upload','v'+a.version,'--repo',a.repo,str(f)],check=True)
 with tempfile.TemporaryDirectory(prefix='strategy-release-check-') as directory:
  subprocess.run(['gh','release','download','v'+a.version,'--repo',a.repo,'--dir',directory],check=True)
  for f in files:assert (Path(directory)/f.name).read_bytes()==f.read_bytes()
 current=api(a.repo,'releases/'+str(release['id']));assert current['draft'] and current['target_commitish']==a.source and {x['name'] for x in current['assets']}==expected
 published=mutate(a.repo,'releases/'+str(release['id']),{'draft':False,'prerelease':True,'make_latest':'false'});assert not published['draft']
 print(json.dumps({'published':True,'url':published['html_url'],'sha256':digest,'assets':len(files)}))
if __name__=='__main__':main()
