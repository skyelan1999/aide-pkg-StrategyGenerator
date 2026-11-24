# 计算方法与兼容性

规则版本：2026-11-24.2。规则是本插件作者定义的可解释启发式，不是任何模型厂商提供的“最优参数”，也不是经过真实模型评测的结论。

## Aide 参数归属

基于 Aide 源码 a2cd569c88d50712361b4285c575a7c7e595189e：

- [profiles.go](https://github.com/skyelan1999/aide/blob/a2cd569c88d50712361b4285c575a7c7e595189e/internal/server/profiles.go)：profile.params 支持 temperature 0–2、top_p 0–1、max_tokens 1–65536、frequency_penalty/presence_penalty −2–2、response_format、stop。本版本生成 max_tokens、通用模式最多一个采样项，以及明确支持时的 json_object。特定 Qwen 官方基线是例外，可同时包含 temperature、top_p 及模型卡指定的 presence_penalty。停止词保持省略。
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

目标 = 向上对齐 256（用途基数 × (0.6 + 复杂度 × 0.2) × 偏好系数 × 推理余量系数）。偏好系数：速度 0.6、均衡 1、质量 1.4；推理兼容模式和标明思考的 Qwen 基线系数 1.5，其他模式 1。
max_tokens = min(目标, 模型输出上限, Aide 65536, 可用于输出)。这个值为生成预算上限，不保证实际可见输出量。推理 token 可能消耗该预算；1.5 只是规划余量，不是模型推理 token 的预测。

## 采样、JSON 与推理

[OpenAI Chat Completions 参数参考](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)建议调 temperature 或 top_p 中的一项；本插件通用模式每次最多生成一项；下面明确列出的 Qwen 官方基线除外。该文档只作为参数语义与兼容性参考，不支持本插件的用途分数和具体阈值。

标准采样模式的温度基准按上述用途分别为 0.4、0.2、0.1、0.3、0.1、0.5、1.1、0.1、0.2。温度 = clamp(基准 + 创意微调 / 100, 0, 1.8)。选择 Top P 时使用自定义映射 round(0.7 + 温度 / 1.8 × 0.3, 2)，不同时输出温度。未知能力和推理兼容模式均省略采样参数；推理兼容模式是保守方案，不代表所有推理模型都不支持采样。

结构化提取只有在使用者确认支持 JSON 对象模式时才生成 response_format:json_object，仍需提示模型输出 JSON 并校验结构；JSON 对象模式不等于 JSON Schema 验证。

[OpenAI 推理指南](https://developers.openai.com/api/docs/guides/reasoning)说明推理强度与推理预算之间的关系。插件只在明确选择推理兼容模式时建议 low/medium/high；其余为 auto。用途推理基数为 1、3、4、4、4、2、2、2、2。分数 = 用途基数 + 复杂度 − 3 + 偏好调整（质量 +1，速度 −1）；≥4 为 high，≥2 为 medium，其他为 low。不支持该档位时保留自动；不硬编码具体模型的能力或收费。

## 并行建议

默认 1。普通对话、显式确认可独立拆分、用途允许且优先级不是速度时，容量允许则建议 2；复杂度 ≥4 且质量优先时建议 3，始终不超过用户容量。问答、翻译与工作流保持 1。更多环境可能增加调用用量，无固定费用/速度预测。插件不改变审批、权限或自动执行策略。

## 文本估算与隐私

粗略 token 数 = ceil(ASCII 字符数 / 3 + 非 ASCII Unicode 码点数 × 1.5)。这不是 tokenizer，不处理图片/音频，不自动计入历史或工具；可手动覆盖输入总量。限制为 200000 个 UTF-16 字符。界面估算不发送文本；AI 工具估算只在宿主进程内计算并返回计数，不返回原文。宿主本身对工具调用的审计记录由 Aide 管理，插件不保证宿主不保存调用参数。

UI、工具与导出使用相同引擎；生成结果含 inputs、rulesVersion 和计算过程，可复算。插件运行时不访问网络、不使用浏览器持久化、不调用模型。复制会在用户操作时写入剪贴板；下载会在用户操作时生成本地 JSON 文件。


## 型号经验与资料依据（2026-11-24 核对）

预设覆盖不同协议与模式，不自动识别用户实际模型，不推断上下文、价格或输出能力。以下官方内容仅支持参数语义/基线；用途映射、预算公式、推理分数以及试调建议仍是插件经验，没有新增真实模型评测。通用模式保持原有规则；选择预设后以预设的有效能力模式覆盖冲突的通用 modelMode。采样基线可显式切换为单项试调或保留默认。

| 预设 | 生成行为与边界 | 官方依据 |
| --- | --- | --- |
| OpenAI 推理 | 省略采样；按用途建议 low/medium/high，须确认具体档位与 API/工具支持 | [部署检查表](https://developers.openai.com/api/docs/guides/deployment-checklist) |
| Codex Bridge | 省略采样；medium/high 是试调起点，max_tokens 只是规划预算，不能声称 CLI 严格执行 | [0.4.3 桥接实现](https://github.com/skyelan1999/aide-pkg-CodexBridge/blob/v0.4.3/runtime/bridge.cjs) |
| DeepSeek 思考 | 省略采样；按分数在 low/high 选择（medium 映射 high）；Top P 因型号而异 | [思考模式](https://api-docs.deepseek.com/guides/thinking_mode/) |
| DeepSeek 非思考 | 温度按官方用途起点：编程/数学 0、数据分析 1、问答/翻译 1.3、创作 1.5；不生成 Top P，建议关闭思考 | [温度设置](https://api-docs.deepseek.com/quick_start/parameter_settings/) |
| Qwen3 原版思考 | T=0.6、Top P=0.95；思考开关/Top K=20/Min P=0 在服务侧确认 | [Qwen3 模型卡](https://huggingface.co/Qwen/Qwen3-30B-A3B-FP8/blob/main/README.md) |
| Qwen3 原版非思考 | T=0.7、Top P=0.8；不外推到 Qwen3.5/3.6 | 同上 |
| Qwen3.6-27B 思考 | 通用 T=1、精确编程 T=0.6；Top P=0.95、presence_penalty=0 | [指定型号模型卡](https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/README.md) |
| Qwen3.6-27B 非思考 | T=0.7、Top P=0.8、presence_penalty=1.5；服务侧确认 Top K、Min P、重复惩罚及开关 | 同上 |
| Claude 现代推理 / 网关 | 省略采样、推理 auto；现代型号可能拒绝非默认采样。原生 thinking/effort 不假定等于 Aide 字段 | [思考模式与兼容](https://platform.claude.com/docs/en/build-with-claude/thinking) |
| Gemini 3.x / 网关 | 保留采样默认、推理 auto；不把原生 thinking_level 直接混入 profile | [官方参数迁移](https://aistudio.google.com/docs/whats-new-gemini-3.6) |

DeepSeek 排错/提取归到温度 0、专业写作/研究归到 1，以及 Qwen3.6 排错归到精确编程，均为插件经验映射。所有预设建议用固定 5–10 个真实任务比较质量、时延与输出，每轮只改变一个因素。Qwen 的思考开关与 top_k/min_p/repetition_penalty 仅在 modelAdvice.native 展示，不写入 profile.params 或 sessionRecommendations。

## 宿主主题

遵循现有 [Aide workbench 主题协议](https://github.com/skyelan1999/aide/blob/4e8d9f5202c18c47ad5971b0d9f97aaf1e5c25b8/internal/server/web/plugin-workbench.js)：iframe 发出 aide.workbench.theme.ready/protocol 1，接收父窗口的 aide.workbench.theme。只接受 window.parent 消息、light/dark 和固定颜色字段，逐项验证 CSS color，拒绝 URL、变量及任意 CSS。映射背景、面板、字段、文字、边框、品牌按钮、选中、焦点、警告和预算颜色；实时响应四种 Aide 配色。主题消息不读取设置或凭据。旧宿主/独立页面按系统主题回退，不能宣称旧宿主也支持实时配色同步。
