"""Deterministic allowlist ZIP; never packages state or credentials."""
import argparse,hashlib,json,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
FILES=['LICENSE','README.md','manifest.json','index.js','viewer.html','docs/METHOD.md']
def build(out):
 version=json.loads((ROOT/'manifest.json').read_text(encoding='utf-8'))['version'];out.mkdir(parents=True,exist_ok=True);archive=out/f'strategy-generator-{version}.zip'
 with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED) as z:
  for name in sorted(FILES):
   info=zipfile.ZipInfo(name,(2026,11,24,0,0,0));info.create_system=3;info.external_attr=0o100644<<16;info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,(ROOT/name).read_bytes())
 digest=hashlib.sha256(archive.read_bytes()).hexdigest();archive.with_suffix('.zip.sha256').write_text(f'{digest}  {archive.name}\n',encoding='utf-8');print(json.dumps({'archive':str(archive),'sha256':digest,'bytes':archive.stat().st_size}))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--out',type=Path,default=ROOT/'dist');a=p.parse_args();build(a.out.resolve())
