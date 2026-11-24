# 策略参数生成器 / Strategy Generator

MIT 开源的独立 Aide 插件。根据用途、复杂度、速度偏好、真实上下文窗口、输入总量和模型输出限制，生成有计算依据的策略参数。当前版本 0.1.0。

支持日常问答、编程实现、排错审查、研究分析、数据与推导、专业写作、创意构思、结构化提取和翻译润色九种用途。提供本地工作台及 strategy_generate、strategy_presets、strategy_estimate_tokens 三个计算工具，无运行时第三方依赖，Node.js 18+。

## 使用

1. 将 Release 中的 strategy-generator-0.1.0.zip 导入 Aide，打开插件工作台。
2. 选择用途与模型能力；尚不确定时保留模型默认。填写实际窗口、输入和输出上限。
3. 查看输出预算、采样参数、推理强度、环境容量和每项填写位置。复制参数或下载完整建议 JSON。
4. 在 Aide 的 AI 参数配置中新建自定义配置，逐项填写 profile.params；聊天栏分别设置推理强度与并行容量。插件不会自动应用或覆盖现有配置。

兼容 Aide workbench protocol 1；生成配置符合 Aide profiles 的既有字段和 65536 输出上限。输出报告不是 Aide 全量配置文件，不能直接覆盖 profiles.json；现有 Aide 没有本插件专用的一键应用能力。模型支持的推理/采样档位仍需按实际服务确认。上下文不足时会禁止导出；复制权限失败时提供选中明文的手动复制兜底。

## 计算而非保证最优

预算按“窗口 − 输入 − 工具预留 − 安全余量”计算，并受模型与 Aide 上限约束；用途基数、复杂度系数和推理/并行阈值均为公开的经验规则。没有调用模型测试质量、token 费用或时延，也不保证推理正确、输出长度或并行提速。请用真实任务做小样本比较再调整。

未知能力与推理兼容模式省略采样参数；标准采样每次最多调温度或 Top P 中的一项。JSON 对象仅在确认支持时启用。文本估算是字符公式，不能替代模型 tokenizer。完整公式、Aide 源码依据与官方参数参考见 [计算方法](docs/METHOD.md)。

## 数据与权限

界面在本页内计算，不读取提供商、密钥、历史会话或用户文件，不写入浏览器持久化，不发网络请求或模型调用。显式复制会写剪贴板；下载会保存建议 JSON。AI 工具在宿主中计算；宿主可能按自身规则保存工具调用参数。无需输入 API Key。

## Development

```sh
npm run build
npm test
npm run package
```

Generated index.js is self-contained for Aide's entry-only validator. Generated viewer.html embeds the same deterministic engine and runs offline. scripts/package.py uses a fixed allowlist and reproducible ZIP metadata. See [acceptance](https://github.com/skyelan1999/aide-pkg-StrategyGenerator/blob/main/docs/ACCEPTANCE.md) for actual verification and delivery state.

Public source and releases: https://github.com/skyelan1999/aide-pkg-StrategyGenerator

Bugs, requests and acceptance are tracked in [Aide Issues](https://github.com/skyelan1999/aide/issues); identify Strategy Generator and its version. License: MIT, copyright 2026 skyelan1999.
