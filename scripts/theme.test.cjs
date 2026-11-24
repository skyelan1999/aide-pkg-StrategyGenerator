'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function fixture(embedded=true){
 const props=new Map(),root={dataset:{},style:{removeProperty:k=>props.delete(k),setProperty:(k,v)=>props.set(k,v)}},note={},sent=[];let listener;
 const parent={postMessage:(...args)=>sent.push(args)},window={parent,addEventListener:(type,fn)=>{if(type==='message')listener=fn}};if(!embedded)window.parent=window;
 vm.runInNewContext(fs.readFileSync('src/theme.js','utf8'),{window,document:{documentElement:root,getElementById:()=>note},CSS:{supports:(_,v)=>/^#[0-9a-f]{6}$|^rgb\([0-9, ]+\)$/i.test(v)}});
 return {root,props,note,sent,parent,send:(data,source=parent)=>listener({data,source})};
}
const message={type:'aide.workbench.theme',protocol:1,theme:'light',palette:'comfort',colors:{bg:'#ffffff',text:'#202020','brand-hi':'#112233','on-brand':'#ffffff',warn:'#996600'}};
test('theme follows parent ready handshake, all palettes and repeated light/dark transitions',()=>{
 const f=fixture();assert.equal(f.sent.length,1);assert.equal(f.sent[0][0].type,'aide.workbench.theme.ready');
 for(const palette of ['comfort','green','professional','modern'])for(const theme of ['light','dark','light']){
  f.send({...message,theme,palette});assert.equal(f.root.dataset.aideTheme,theme);assert.equal(f.root.dataset.aidePalette,palette);assert.equal(f.root.style.colorScheme,theme);assert.equal(f.props.get('--button-bg'),'#112233');assert.equal(f.props.get('--ink'),'#202020');assert.match(f.note.textContent,/跟随 Aide/);
 }
 f.send({...message,colors:{bg:'#eeeeee'}});assert.equal(f.props.get('--bg'),'#eeeeee');assert(!f.props.has('--button-bg'));
});
test('untrusted windows, unsupported protocol and CSS injection never apply',()=>{
 const f=fixture();f.send(message,{});f.send({...message,protocol:2});f.send({...message,theme:'invalid'});f.send({...message,colors:[]});assert.deepEqual(f.root.dataset,{});
 f.send({...message,colors:{bg:'url(https://invalid.test)',text:'#fff; color:red',panel:'var(--evil)','brand-hi':'#112233',unknown:'#ffffff'}});assert.deepEqual([...f.props],[['--button-bg','#112233']]);
 const top=fixture(false);assert.equal(top.sent.length,0);top.send(message);assert.deepEqual(top.root.dataset,{});
});
