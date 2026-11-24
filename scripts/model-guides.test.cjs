'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),e=require('../src/engine.js');
test('model policies override conflicting generic mode and keep native fields separate',()=>{
 assert.equal(e.MODEL_GUIDES.length,11);
 for(const guide of e.MODEL_GUIDES)for(const purpose of e.PURPOSES){
  const r=e.generate({modelPreset:guide.id,purpose:purpose.id,modelMode:'unknown'});
  assert(r.valid);assert.equal(r.effectiveSettings.modelMode,guide.mode||'unknown');assert.equal(r.modelAdvice.id,guide.id);
  for(const field of ['enable_thinking','top_k','min_p','repetition_penalty','reasoning_effort'])assert(!Object.hasOwn(r.profile.params,field));
  assert(!r.applied);assert.equal(r.inputs.contextWindow,e.DEFAULTS.contextWindow);
 }
});
test('reasoning integrations omit sampling; unmapped protocols remain auto',()=>{
 for(const modelPreset of ['openai-reasoning','codex-bridge','deepseek-thinking','claude-modern','gemini3']){
  const r=e.generate({modelPreset,modelMode:'sampling',sampler:'top_p'});
  assert.deepEqual(Object.keys(r.profile.params),['max_tokens']);
 }
 for(const modelPreset of ['claude-modern','gemini3'])assert.equal(e.generate({modelPreset}).sessionRecommendations.reasoningEffort,'auto');
 assert(e.generate({modelPreset:'codex-bridge'}).warnings.some(x=>x.includes('规划预算')));
 for(const purpose of e.PURPOSES)for(const complexity of [1,3,5])assert(['low','high'].includes(e.generate({modelPreset:'deepseek-thinking',purpose:purpose.id,complexity}).sessionRecommendations.reasoningEffort));
});
test('vendor baselines preserve exact model/version combinations; manual override is single sampler',()=>{
 const expected={'qwen3-thinking':[.6,.95,undefined],'qwen3-instruct':[.7,.8,undefined],'qwen36-thinking':[.6,.95,0],'qwen36-instruct':[.7,.8,1.5]};
 for(const [modelPreset,[temperature,top_p,presence_penalty]]of Object.entries(expected)){
  const r=e.generate({modelPreset,creativity:50});assert.equal(r.profile.params.temperature,temperature);assert.equal(r.profile.params.top_p,top_p);assert.equal(r.profile.params.presence_penalty,presence_penalty);assert.equal(r.sessionRecommendations.reasoningEffort,'auto');
  const manual=e.generate({modelPreset,sampler:'temperature'});assert.equal(manual.profile.params.top_p,undefined);assert.equal(manual.profile.params.presence_penalty,undefined);
  assert.deepEqual(Object.keys(e.generate({modelPreset,sampler:'default'}).profile.params),['max_tokens']);
 }
 assert.equal(e.generate({modelPreset:'qwen36-thinking',purpose:'research'}).profile.params.temperature,1);
 const temps={coding:0,data:1,quick:1.3,translation:1.3,creative:1.5};for(const [purpose,temp]of Object.entries(temps)){const r=e.generate({modelPreset:'deepseek-chat',purpose});assert.equal(r.profile.params.temperature,temp);assert.equal(r.profile.params.top_p,undefined);assert.equal(r.sessionRecommendations.reasoningEffort,'off')}
 assert.throws(()=>e.generate({modelPreset:'qwen3.6'}));assert.throws(()=>e.generate({sampler:'provider'}));
});
