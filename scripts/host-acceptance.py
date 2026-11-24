#!/usr/bin/env python3
"""Isolated actual Aide upload, tool calls and profile validation; synthetic data only."""
import argparse,hashlib,json,os,shutil,ssl,subprocess,time,urllib.request,urllib.error,uuid
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main():
 p=argparse.ArgumentParser();p.add_argument('--image',required=True);p.add_argument('--docker',default=shutil.which('docker') or '/Applications/Docker.app/Contents/Resources/bin/docker');p.add_argument('--receipt',type=Path,default=ROOT/'.agent-state/host-acceptance.json');a=p.parse_args()
 def docker(*args):return subprocess.check_output([a.docker,*args],text=True).strip()
 name='strategy-generator-acceptance-'+uuid.uuid4().hex[:10];receipt={'scope':'Disposable Linux Aide, no production mounts or real accounts','image':a.image,'checks':{}}
 try:
  docker('run','-d','--name',name,'--user','0','--memory','768m','--cpus','1','-e','AIDE_DATA=/tmp/data','-e','AIDE_WORKSPACE=/tmp/workspace','-e','AIDE_CONTEXT=/tmp/context','-p','127.0.0.1::8080',a.image)
  info=json.loads(docker('inspect',name))[0];receipt['imageID']=info['Image'];base='https://127.0.0.1:'+info['NetworkSettings']['Ports']['8080/tcp'][0]['HostPort'];context=ssl._create_unverified_context()
  for _ in range(60):
   try:urllib.request.urlopen(base+'/healthz',context=context,timeout=2).close();break
   except (OSError,urllib.error.URLError):time.sleep(.25)
  else:raise RuntimeError('Isolated host did not start')
  token=docker('exec',name,'cat','/tmp/data/auth/access-token')
  def request(route,data=None,ctype='application/json',method=None):
   r=urllib.request.Request(base+route,data=data,method=method,headers={'Authorization':'Bearer '+token,'Content-Type':ctype})
   with urllib.request.urlopen(r,context=context,timeout=60) as response:return response.status,json.load(response)
  package=ROOT/'dist/strategy-generator-0.1.0.zip';raw=package.read_bytes();receipt['packageSHA256']=hashlib.sha256(raw).hexdigest();boundary='test-'+uuid.uuid4().hex
  body=('--'+boundary+'\r\nContent-Disposition: form-data; name="bundle"; filename="plugin.zip"\r\nContent-Type: application/zip\r\n\r\n').encode()+raw+('\r\n--'+boundary+'--\r\n').encode()
  status,d=request('/api/plugins/bundle',body,'multipart/form-data; boundary='+boundary);assert status==201 and d['enabled'];receipt['checks']['uploadEnabled']=True
  _,listing=request('/api/plugins');item=next(x for x in listing['plugins'] if x['id']=='strategy-generator');assert not item.get('error') and item['version']=='0.1.0';receipt['checks']['noLoadError']=True
  _,opened=request('/api/plugins/strategy-generator/workbench/open',b'{}');assert len(opened['bridge']['tools'])==3;receipt['checks']['workbenchThreeTools']=True
  with urllib.request.urlopen(base+opened['url'],context=context,timeout=30) as response:assert b'STRATEGY GENERATOR' in response.read()
  instance=opened['bridge']['instanceId']
  for index,(tool,args) in enumerate([('strategy_generate',{'purpose':'research','modelMode':'reasoning'}),('strategy_presets',{}),('strategy_estimate_tokens',{'text':'synthetic-only'})],1):
   _,r=request('/api/plugins/strategy-generator/workbench/'+instance+'/call',json.dumps({'protocol':1,'requestId':'r_'+str(index),'method':'tool.call','tool':tool,'arguments':args}).encode());assert r['status']=='result',r
   value=r['result'];value=json.loads(value) if isinstance(value,str) else value
   if tool=='strategy_generate':assert value['valid'] and value['applied'] is False
   if tool=='strategy_presets':assert len(value['purposes'])==9
   if tool=='strategy_estimate_tokens':assert value['tokens']>0 and 'text' not in value
  receipt['checks']['allThreeHostTools']=True
  profiles=json.loads(subprocess.check_output(['node','-e',"const e=require('./src/engine.js');console.log(JSON.stringify(e.PURPOSES.map(p=>e.generate({purpose:p.id,modelMode:'sampling',jsonSupported:true}).profile)))"],cwd=ROOT,text=True))
  _,saved=request('/api/profiles',json.dumps({'version':1,'strategy':'manual','activeProfile':profiles[0]['id'],'profiles':profiles}).encode(),method='PUT')
  actual={x['id']:x for x in saved['profiles']};assert all(actual[x['id']]['params']==x['params'] for x in profiles);receipt['checks']['allNineProfilesAcceptedByAide']=True
  a.receipt.parent.mkdir(parents=True,exist_ok=True);a.receipt.write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
 finally:subprocess.run([a.docker,'rm','-f',name],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
if __name__=='__main__':main()
