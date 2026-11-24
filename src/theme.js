/* Aide workbench presentation protocol 1. MIT · skyelan1999 */
(function(){
 'use strict';
 const root=document.documentElement;
 const map={bg:'--bg',panel:'--panel',surface:'--code',field:'--field',text:'--ink',muted:'--muted',line:'--line','field-border':'--field-border','brand-hi':'--button-bg','brand-text':'--accent','on-brand':'--button-text','chip-bg':'--soft',selected:'--selected','focus-ring':'--focus',warn:'--warn',success:'--budget-output'};
 function color(value){return typeof value==='string'&&value.length<=160&&!/[;{}]|url\s*\(|var\s*\(/i.test(value)&&CSS.supports('color',value)}
 window.addEventListener('message',event=>{
  const m=event.data;
  if(window.parent===window||event.source!==window.parent||m?.type!=='aide.workbench.theme'||m.protocol!==1||!['light','dark'].includes(m.theme)||!m.colors||typeof m.colors!=='object'||Array.isArray(m.colors))return;
  root.dataset.aideTheme=m.theme;root.dataset.aidePalette=['comfort','green','professional','modern'].includes(m.palette)?m.palette:'modern';root.style.colorScheme=m.theme;
  for(const [key,variable]of Object.entries(map)){root.style.removeProperty(variable);if(color(m.colors[key]))root.style.setProperty(variable,m.colors[key])}
  for(const [variable,key]of [['--budget-input','muted'],['--budget-tools','warn'],['--budget-safety','line']]){root.style.removeProperty(variable);if(color(m.colors[key]))root.style.setProperty(variable,m.colors[key])}
  const note=document.getElementById('themeState');if(note)note.textContent='跟随 Aide · '+({comfort:'舒适',green:'经典',professional:'专业',modern:'现代'}[root.dataset.aidePalette])+' · '+(m.theme==='light'?'浅色':'深色');
 });
 if(window.parent!==window)window.parent.postMessage({type:'aide.workbench.theme.ready',protocol:1},'*');
})();
