'use strict';
const engine=require('./engine.js');
module.exports={name:'strategy-generator',apply(ctx){
 ctx.tool({name:'strategy_generate',description:'本地计算 Aide 模型策略建议：用途、复杂度、速度偏好、模型能力和上下文预算。返回规则依据、兼容 profile、会话建议及填写位置；applied 始终为 false，不修改任何设置，不调用模型。',parameters:engine.schema,handler:async args=>JSON.stringify(engine.generate(args))});
 ctx.tool({name:'strategy_presets',description:'读取策略生成器的用途、默认输入与规则版本，不读取用户配置或凭据。',parameters:{type:'object',properties:{},additionalProperties:false},handler:async args=>{if(args&&Object.keys(args).length)throw Error('此工具不接受参数');return JSON.stringify({version:engine.VERSION,rulesVersion:engine.RULES_VERSION,purposes:engine.PURPOSES,defaults:engine.DEFAULTS})}});
 ctx.tool({name:'strategy_estimate_tokens',description:'用字符公式粗略估算文本 tokens，只返回数量与方法，不返回或保存原文。不能替代模型 tokenizer，不自动计入历史或工具。',parameters:{type:'object',properties:{text:{type:'string',maxLength:200000}},required:['text'],additionalProperties:false},handler:async args=>{if(!args||Object.keys(args).length!==1||!Object.hasOwn(args,'text'))throw Error('仅接受 text 字符串');return JSON.stringify(engine.estimateTokens(args.text))}});
}};
