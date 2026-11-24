# 计算方法与兼容性

规则版本：2026-11-24.1。规则是本插件作者定义的可解释启发式，不是任何模型厂商提供的“最优参数”，也不是经过真实模型评测的结论。

## Aide 参数归属

基于 Aide 源码 a2cd569c88d50712361b4285c575a7c7e595189e：

- [profiles.go](https://github.com/skyelan1999/aide/blob/a2cd569c88d50712361b4285c575a7c7e595189e/internal/server/profiles.go)：profile.params 支持 temperature 0–2、top_p 0–1、max_tokens 1–65536、frequency_penalty/presence_penalty −2–2、response_format、stop。本版本生成 max_tokens、最多一个采样项，以及明确支持时的 json_object。惩罚和停止词保持省略。
- [session_model_selection.go](https://github.com/skyelan1999/aide/blob/a2cd569c88d50712361b4285c575a7c7e595189e/internal/server/session_model_selection.go)：reasoningEffort 是会话选择，不属于 profile.params。
- [parallel-chat.js](https://github.com/skyelan1999/aide/blob/a2cd569c88d50712361b4285c575a7c7e595189e/internal/server/web/parallel-chat.js)：可选环境容量是 1、2、3、4、5、10，包含主环境，不保证等比例提速。
- [provider.go](https://github.com/skyelan1999/aide/blob/a2cd569c88d50712361b4285c575a7c7e595189e/internal/server/provider.go)：宿主负责将 Aide 参数适配为提供商格式；profile 中使用 max_tokens，不直接混入 max_completion_tokens 或 Responses API 字段。

插件不读取用户 profiles.json、提供商、密钥、会话或系统设置，也不修改它们。导出是单个 profile 或建议报告，不是可覆盖完整配置的导入包。

## 预算公式

所有输入 token 数量和模型能力由使用者提供；上下文窗口不能靠参数设置扩大。预计输入应包含历史、系统提示和已知工具定义；工具预留只计尚未包含在输入量的额外内容。

安全余量 = min(8192, max(512, ceil(上下文窗口 × 0.08)))。
可用于输出 = 窗口 − 输入 − 额外工具预留 − 安全余量。
可用于输出不足 256 时，返回 valid:false、profile:null，禁用复制/下载导出，提示调整。

用途基数：日常问答 1024；编程实现 8192；排错审查 4096；研究分析 8192；数据与推导 4096；专业写作 4096；创意构思 4096；结构化提取 2048；翻译润色 4096。

目标 = 向上对齐 256（用途基数 × (0.6 + 复杂度 × 0.2) × 偏好系数 × 推理余量系数）。偏好系数：速度 0.6、均衡 1、质量 1.4；推理兼容模式系数 1.5，其他模式 1。
max_tokens = min(目标, 模型输出上限, Aide 65536, 可用于输出)。这个值为生成预算上限，不保证实际可见输出量。推理 token 可能消耗该预算；1.5 只是规划余量，不是模型推理 token 的预测。

## 采样、JSON 与推理

[OpenAI Chat Completions 参数参考](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)建议调 temperature 或 top_p 中的一项；本插件每次最多生成一项。该文档只作为参数语义与兼容性参考，不支持本插件的用途分数和具体阈值。

标准采样模式的温度基准按上述用途分别为 0.4、0.2、0.1、0.3、0.1、0.5、1.1、0.1、0.2。温度 = clamp(基准 + 创意微调 / 100, 0, 1.8)。选择 Top P 时使用自定义映射 round(0.7 + 温度 / 1.8 × 0.3, 2)，不同时输出温度。未知能力和推理兼容模式均省略采样参数；推理兼容模式是保守方案，不代表所有推理模型都不支持采样。

结构化提取只有在使用者确认支持 JSON 对象模式时才生成 response_format:json_object，仍需提示模型输出 JSON 并校验结构；JSON 对象模式不等于 JSON Schema 验证。

[OpenAI 推理指南](https://developers.openai.com/api/docs/guides/reasoning)说明推理强度与推理预算之间的关系。插件只在明确选择推理兼容模式时建议 low/medium/high；其余为 auto。用途推理基数为 1、3、4、4、4、2、2、2、2。分数 = 用途基数 + 复杂度 − 3 + 偏好调整（质量 +1，速度 −1）；≥4 为 high，≥2 为 medium，其他为 low。不支持该档位时保留自动；不硬编码具体模型的能力或收费。

## 并行建议

默认 1。普通对话、显式确认可独立拆分、用途允许且优先级不是速度时，容量允许则建议 2；复杂度 ≥4 且质量优先时建议 3，始终不超过用户容量。问答、翻译与工作流保持 1。更多环境可能增加调用用量，无固定费用/速度预测。插件不改变审批、权限或自动执行策略。

## 文本估算与隐私

粗略 token 数 = ceil(ASCII 字符数 / 3 + 非 ASCII Unicode 码点数 × 1.5)。这不是 tokenizer，不处理图片/音频，不自动计入历史或工具；可手动覆盖输入总量。限制为 200000 个 UTF-16 字符。界面估算不发送文本；AI 工具估算只在宿主进程内计算并返回计数，不返回原文。宿主本身对工具调用的审计记录由 Aide 管理，插件不保证宿主不保存调用参数。

UI、工具与导出使用相同引擎；生成结果含 inputs、rulesVersion 和计算过程，可复算。插件运行时不访问网络、不使用浏览器持久化、不调用模型。复制会在用户操作时写入剪贴板；下载会在用户操作时生成本地 JSON 文件。
