# Strategy Generator 0.2.0 acceptance

Tracks [Aide #991](https://github.com/skyelan1999/aide/issues/991). Independent public MIT plugin; no Aide core or user profile/provider changes.

## QA inventory and scope

- Four host palettes in light/dark, live transitions, parent-only protocol 1, host light against OS dark, system fallback without a host. Background, fields, button, selected and focus colors follow Aide tokens.
- Generic and ten model/mode presets; official/manual/default sampling cycles, displayed official sources and empirical-rule boundary, native service settings kept separate, context and output limits preserved on preset changes.
- Nine purposes and existing complexity, priority, model capability, creativity, JSON, capacity, separability, workflow, estimator, reset, explanation, per-value/profile/report copy and download controls.
- Invalid/overfull inputs disable exports, including when changing model; denied clipboard selects plaintext. Repeated preset/reset and fallback copy followed by edits must not export stale content.
- Desktop 1400×950 and narrow 390×844: inspect initial view and long form/result states for readable colors, no overlap, clipping or horizontal overflow. Narrow layout deliberately scrolls vertically.

## Verification

20 Node tests and two Python publisher-identity tests pass locally. Existing coverage includes 243 generic combinations and 300 budget cases; new coverage includes 99 purpose/model combinations, exact Qwen official pairs and presence penalties, DeepSeek effort and nonthinking temperatures, unsupported sampling omission, native-field separation, theme origin/protocol/color rejection and live palette transitions. Build and allowlisted ZIP are deterministic.

Chromium (installed Chrome channel) passed the inventory in a sandboxed synthetic parent iframe using Aide's tracked theme CSS and existing theme-message shape. All eight palette/mode combinations matched host tokens, including light host with OS dark. Eleven guide choices were exercised through controls; Qwen official/manual/default/official and cross-model reasoning changes removed stale fields. Context/output limits remained unchanged. Existing controls, invalid/overfull/reset, estimator, clipboard success/denial fixtures and downloaded JSON identity passed with no page errors. Desktop light/dark, narrow dark model/input/result and narrow light inputs were visually reviewed; 390px document width stayed 390px. Labels, source notes, feedback and actions were readable, without overlapping or horizontally clipped controls. Copy checks use synthetic clipboard success/denial, not an actual destination application's OS paste.

The disposable Linux Aide host actually installed/enabled the ZIP, loaded the workbench and called all three tools. Its profile validator accepted all nine purpose profiles and ten model profiles (19 total) without changing params. The container used image sha256:2b3270ee0cac70019f03e1fa7fe5a8fd29e52fe3217308e341a46475d94eb64b, had no production mounts or real accounts, and was removed after validation. Reproduce with `python3 scripts/host-acceptance.py --image <compatible-local-aide-image>`.

Source CI requires Node 18/24 on Ubuntu 22.04, Windows 2022 and macOS 15 Intel. Exact source SHA and successful run are added automatically to the published Release; public asset identity and marketplace deployment are checked separately. Local browser artifacts and host receipts are ignored development state, excluded from the six-file allowlisted ZIP.

## Limits

No new real-model quality/latency/cost benchmark, exact tokenizer, native Windows/macOS UI theme acceptance or real OS destination paste is claimed. Model recommendations are documented starting points; service and gateway compatibility still matters. Actual user profiles are never written; profile writes above occur only inside the disposable host. Old hosts without the theme protocol use system colors. Codex Bridge output tokens are a planning budget, not an enforced CLI cap.
