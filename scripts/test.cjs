'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),files=fs.readdirSync(__dirname).filter(name=>name.endsWith('.test.cjs')).sort().map(name=>path.join(__dirname,name));
if(!files.length)throw Error('No tests found');
const result=spawnSync(process.execPath,['--test',...files],{cwd:root,stdio:'inherit'});if(result.error)throw result.error;process.exit(result.status??1);
