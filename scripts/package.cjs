'use strict';
const path=require('node:path'),{spawnSync}=require('node:child_process');
const result=spawnSync(process.platform==='win32'?'python':'python3',[path.join(__dirname,'package.py'),'--out','dist'],{cwd:path.resolve(__dirname,'..'),stdio:'inherit'});if(result.error)throw result.error;process.exit(result.status??1);
