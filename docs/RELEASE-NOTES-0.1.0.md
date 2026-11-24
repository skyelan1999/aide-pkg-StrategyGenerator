Initial public MIT preview of the Aide Strategy Generator.

- Nine purpose presets with adjustable complexity, speed/quality preference and model capability mode.
- Reproducible output-token budgets constrained by actual model context, input estimate, tool reserve, model output limit and Aide's 65,536 ceiling.
- Compatible Aide profile parameters, separate reasoning and environment-capacity recommendations, per-field explanations and application guidance.
- Local workbench, manual clipboard fallback, JSON download and rough character-based token estimation. Three pure calculation tools share the same engine.

Validation: 15 local Node tests cover 243 preset combinations and 300 budget cases. Chromium checked sampling/reasoning/JSON modes, constraints, invalid/overfull inputs, reset, estimation, clipboard success/denial (synthetic), download and desktop/narrow light/dark layouts. An isolated real Aide Linux service accepted the ZIP, registered/called all three tools and accepted all nine generated profiles.

Recommendations use documented heuristics, not benchmarked optimal settings. No model calls, real quality/latency/cost evaluation, exact tokenizer, automatic profile import/application, or Windows native desktop acceptance is claimed. Runtime calculations do not access credentials or modify Aide settings. See README and docs/METHOD.md for compatibility and formulas.

Import strategy-generator-0.1.0.zip into an Aide host supporting workbench protocol 1. Node.js 18+ is required. Exported reports are not complete Aide configuration backups and must not overwrite profiles.json. Existing settings stay under the user's control.
