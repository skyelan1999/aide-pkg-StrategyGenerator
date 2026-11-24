# 策略参数生成器 / Strategy Generator

MIT 开源的独立 Aide 插件。根据用途、复杂度、速度偏好、真实上下文窗口、输入总量和模型输出限制，生成有计算依据的策略参数。当前版本 0.2.0。

支持日常问答、编程实现、排错审查、研究分析、数据与推导、专业写作、创意构思、结构化提取和翻译润色九种用途。提供本地工作台及 strategy_generate、strategy_presets、strategy_estimate_tokens 三个计算工具，无运行时第三方依赖，Node.js 18+。

## 使用

1. 将 Release 中的 strategy-generator-0.2.0.zip 导入 Aide，打开插件工作台。
2. 选择用途和模型配置经验：OpenAI 推理、Codex Bridge、DeepSeek 思考/非思考、Qwen3 原版、Qwen3.6-27B、Claude 和 Gemini。也可保留通用能力模式。填写实际窗口、输入和输出上限。
3. 查看输出预算、采样参数、推理强度、环境容量和每项填写位置。复制参数或下载完整建议 JSON。
4. 在 Aide 的 AI 参数配置中新建自定义配置，逐项填写 profile.params；聊天栏分别设置推理强度与并行容量。插件不会自动应用或覆盖现有配置。

兼容 Aide workbench protocol 1；生成配置符合 Aide profiles 的既有字段和 65536 输出上限。输出报告不是 Aide 全量配置文件，不能直接覆盖 profiles.json；现有 Aide 没有本插件专用的一键应用能力。模型支持的推理/采样档位仍需按实际服务确认。上下文不足时会禁止导出；复制权限失败时提供选中明文的手动复制兜底。

## Aide 主题与模型经验

工作台通过 Aide 现有主题协议实时跟随舒适、经典、专业、现代四套配色及明暗模式，背景、表单、按钮、选中态与预算条使用宿主颜色。无主题协议的旧宿主或独立预览回退到系统明暗主题。

十个型号/模式预设分别显示官方约束、经验建议、来源链接与资料核对日期（2026-11-24）。Qwen 代际与思考模式分开；Top K、Min P、思考开关等服务端字段只展示，不混入 Aide profile。Claude/Gemini 原生推理参数没有确认网关映射时保持 auto；Codex Bridge 的输出预算不是 CLI 严格执行上限。选择预设不会猜测或修改真实上下文与输出上限。

这些经验是试调起点，未新增真实模型评测。完整逐型号依据见 [计算方法](docs/METHOD.md)。

## 计算而非保证最优

预算按“窗口 − 输入 − 工具预留 − 安全余量”计算，并受模型与 Aide 上限约束；用途基数、复杂度系数和推理/并行阈值均为公开的经验规则。没有调用模型测试质量、token 费用或时延，也不保证推理正确、输出长度或并行提速。请用真实任务做小样本比较再调整。

未知能力与推理兼容模式省略采样参数；通用标准采样每次最多调温度或 Top P 中的一项；明确选择 Qwen 型号官方基线时保留其采样组合。JSON 对象仅在确认支持时启用。文本估算是字符公式，不能替代模型 tokenizer。完整公式、Aide 源码依据与官方参数参考见 [计算方法](docs/METHOD.md)。

## 数据与权限

界面在本页内计算，不读取提供商、密钥、历史会话或用户文件，不写入浏览器持久化，不发网络请求或模型调用。显式复制会写剪贴板；下载会保存建议 JSON。AI 工具在宿主中计算；宿主可能按自身规则保存工具调用参数。无需输入 API Key。

## Development

```sh
npm run build
npm test
npm run package
```

Generated index.js is self-contained for Aide's entry-only validator. Generated viewer.html embeds the same deterministic engine and runs offline. scripts/package.py uses a fixed allowlist and reproducible ZIP metadata. See [acceptance](https://github.com/skyelan1999/aide-pkg-StrategyGenerator/blob/main/docs/ACCEPTANCE-0.2.0.md) for actual verification and delivery state.

Public source and releases: https://github.com/skyelan1999/aide-pkg-StrategyGenerator

Bugs, requests and acceptance are tracked in [Aide Issues](https://github.com/skyelan1999/aide/issues); identify Strategy Generator and its version. License: MIT, copyright 2026 skyelan1999.
