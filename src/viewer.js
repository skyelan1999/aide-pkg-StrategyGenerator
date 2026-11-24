'use strict';
const engine=StrategyGenerator,$=id=>document.getElementById(id);let purpose=engine.DEFAULTS.purpose,report=null;
const numeric=['complexity','creativity','contextWindow','inputTokens','toolReserve','modelOutputLimit','capacity'];
function inputs(){const x={purpose};for(const key of Object.keys(engine.DEFAULTS)){if(key==='purpose')continue;const node=$(key);x[key]=node.type==='checkbox'?node.checked:numeric.includes(key)?Number(node.value):node.value;if(numeric.includes(key)&&node.value.trim()==='')throw Error('请填写完整的数字限制。')}return x}
function status(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',error)}
function controls(){const sampling=$('modelMode').value==='sampling';$('sampler').disabled=!sampling;$('creativity').disabled=!sampling||$('sampler').value==='default';$('creativityValue').textContent=Number($('creativity').value)>0?'+'+$('creativity').value:$('creativity').value}
function add(parent,tag,text,cls){const node=document.createElement(tag);node.textContent=text;if(cls)node.className=cls;parent.append(node);return node}
function calculate(){
 controls();
 try{if(!$('constraints').checkValidity())throw Error('请填写有效的整数范围，不能留空或输入小数。');report=engine.generate(inputs());render();status(report.valid?'建议已重新计算，尚未写入 Aide。':'可用上下文不足，请先调整限制。',!report.valid)}catch(error){report=null;$('applicationState').textContent='输入无效';for(const id of ['outputStat','reasoningStat','parallelStat'])$(id).textContent='—';$('parameters').replaceChildren();$('budgetBar').replaceChildren();$('budgetLegend').replaceChildren();$('budgetEquation').textContent='';$('resultIntro').textContent='修正左侧输入后重新计算。';$('warnings').hidden=true;$('reportJson').value='';$('applicationGuide').replaceChildren();status(error.message,true)}
 for(const id of ['copyProfile','copyReport','download'])$(id).disabled=!report?.valid;
}
function render(){
 $('applicationState').textContent=report.valid?'未应用':'预算不足';$('resultIntro').textContent=report.purpose.name+' · '+({speed:'快速响应',balanced:'均衡',quality:'充分分析'}[report.inputs.priority])+' · '+({unknown:'模型默认参数',sampling:'标准采样模型',reasoning:'推理兼容模式'}[report.inputs.modelMode]);
 $('outputStat').textContent=report.valid?report.budget.maxTokens.toLocaleString():'不足';$('reasoningStat').textContent=report.sessionRecommendations?.reasoningEffort||'—';$('parallelStat').textContent=report.valid?report.sessionRecommendations.parallelism+'X':'—';
 const b=report.budget,parts=[['input','输入',b.inputTokens],['tools','工具预留',b.toolReserve],['safety','安全余量',b.safetyReserve],['output','输出预算',b.maxTokens]];
 $('budgetBar').replaceChildren();$('budgetLegend').replaceChildren();for(const [cls,label,value]of parts){const seg=add($('budgetBar'),'span','',`segment ${cls}`);seg.style.width=Math.min(100,value/b.contextWindow*100)+'%';const item=add($('budgetLegend'),'span','');add(item,'i','',cls);item.append(document.createTextNode(label+' '+value.toLocaleString()))}
 $('budgetBar').setAttribute('aria-label',parts.map(([,name,value])=>name+' '+value).join('，'));$('budgetEquation').textContent=`窗口 ${b.contextWindow.toLocaleString()} − 输入 ${b.inputTokens.toLocaleString()} − 工具 ${b.toolReserve.toLocaleString()} − 安全余量 ${b.safetyReserve.toLocaleString()} − 输出 ${b.maxTokens.toLocaleString()} = ${b.overBy?'超出 '+b.overBy.toLocaleString():'剩余 '+b.remaining.toLocaleString()}`;
 $('warnings').replaceChildren();$('warnings').hidden=!report.warnings.length;if(report.warnings.length){const ul=add($('warnings'),'ul','');for(const warning of report.warnings)add(ul,'li',warning)}
 $('parameters').replaceChildren();for(const entry of report.explanation){const li=add($('parameters'),'li','','param'),head=add(li,'div','','param-top'),name=add(head,'div','');add(name,'code',entry.field+'  ');add(name,'strong',String(entry.value));const button=add(head,'button','复制值');button.type='button';button.disabled=!report.valid||entry.field==='sampling'||entry.value==='省略（模型默认）';if(entry.field==='sampling'||entry.value==='省略（模型默认）')button.textContent='保持留空';button.onclick=()=>copy(String(entry.value));add(li,'p',entry.location);const detail=add(li,'details','');add(detail,'summary','为什么这样计算？');add(detail,'p',entry.reason)}
 $('reportJson').value=JSON.stringify(report,null,2);$('applicationGuide').replaceChildren();for(const item of report.applicationGuide)add($('applicationGuide'),'li',item);
}
async function copy(text){
 const currentReport=report,area=$('reportJson'),original=area.value;area.value=text;area.closest('details').open=true;area.focus();area.select();area.setSelectionRange(0,text.length);let copied=false,timer;
 try{copied=document.execCommand('copy')}catch{}
 if(!copied)try{await Promise.race([navigator.clipboard?.writeText?navigator.clipboard.writeText(text):Promise.reject(Error('Clipboard unavailable')),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Clipboard timeout')),1500)})]);copied=true}catch{}finally{clearTimeout(timer)}
 if(report!==currentReport){status('输入已经变化，请复制重新计算后的建议。');return}
 if(copied){area.value=original;status('已复制。请在 Aide 对应位置填写。')}else{area.value=text;area.focus();area.select();status('自动复制不可用，文本已选中。请按 ⌘C / Ctrl+C 或右键复制。')}
}
for(const p of engine.PURPOSES){const button=add($('presets'),'button',p.name,'preset');button.type='button';button.dataset.purpose=p.id;button.title=p.detail;button.onclick=()=>{purpose=p.id;updatePurpose();calculate()}}
function updatePurpose(){for(const b of $('presets').children)b.setAttribute('aria-pressed',String(b.dataset.purpose===purpose));$('purposeDescription').textContent=engine.PURPOSES.find(p=>p.id===purpose).detail}
$('constraints').onsubmit=event=>{event.preventDefault();calculate()};for(const key of Object.keys(engine.DEFAULTS)){if(key!=='purpose')$(key).addEventListener('input',calculate)}
$('reset').onclick=()=>{for(const [key,value]of Object.entries(engine.DEFAULTS)){if(key==='purpose'){purpose=value;continue}const node=$(key);if(node.type==='checkbox')node.checked=value;else node.value=value}$('estimateText').value='';$('estimateResult').textContent='';updatePurpose();calculate()};
$('estimate').onclick=()=>{try{const result=engine.estimateTokens($('estimateText').value);$('inputTokens').value=result.tokens;$('estimateResult').textContent=result.characters+' 个字符，粗略估算 '+result.tokens+' tokens。请补计历史等额外内容。';calculate()}catch(error){status(error.message,true)}};
$('copyProfile').onclick=()=>{if(report?.valid)copy(JSON.stringify(report.profile,null,2))};$('copyReport').onclick=()=>{if(report?.valid)copy(JSON.stringify(report,null,2))};
$('download').onclick=()=>{if(!report?.valid)return;const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)+'\n'],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=report.profile.id+'.strategy.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status('已生成建议 JSON 下载。它不是 Aide 完整配置导入文件。')};
updatePurpose();calculate();
