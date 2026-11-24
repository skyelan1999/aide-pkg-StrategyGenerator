# Strategy Generator 0.1.0 acceptance

## Scope and QA inventory

Independent MIT plugin, with a local deterministic workbench and three calculation tools. No Aide core changes. User confirmed Aide model-strategy generation and authorized MIT public publication.

Required checks before publication:
- All nine purposes, complexity/priority changes, sampling/default/reasoning modes, single sampler, optional JSON compatibility, profile field boundaries, context budget conservation, invalid/overfull inputs and deterministic output.
- Context constraints, reset, text estimator, capacity/separability and workflow restrictions, explanation disclosures, per-value/profile/report copy, denied-clipboard fallback and JSON download.
- Desktop light/dark and narrow layout, keyboard-visible controls, readable feedback and no horizontal clipping. Initial view should expose the purpose/input controls and current result; sections below may scroll.
- Aide entry-only validator, actual isolated-host ZIP installation/tool registration, generated profiles accepted by Aide's profile validator. No real user profiles or provider settings are modified.
- Release ZIP allowlist/determinism, public source/license, cross-platform CI and actual downloadable release assets. Marketplace listing/package identity and deployed catalog are separate delivery checks.

Off-happy-path checks include an overfull context and invalid/empty number; denied clipboard and model capability switching must not leave an exportable stale result.

## Results

15 Node tests pass locally. They cover 243 purpose/mode/priority/complexity cases, 300 varied budget cases, invalid data, engine invariants, self-contained entry/tool calls and deterministic allowlisted packaging. Browser and host results are recorded below; public release and marketplace delivery remain pending their remote checks.


Chromium functional checks passed with synthetic data: all nine purpose controls, complexity/priority, temperature/Top P switching, reasoning-mode omission, explicit JSON capability, capacity/separability/workflow restrictions, overfull context, empty numeric input, reset, estimator, clipboard success/denial via fixtures, and downloaded JSON identity. No page script errors or external network requests were observed. Desktop light and narrow dark screenshots were reviewed; 390px document width remained 390px with no horizontal overflow. The initial desktop view exposes both purpose controls and live results; mobile is a deliberate single-column scroll flow. No overlaps, truncated labels or hidden essential controls were found in the reviewed states.

The actual disposable Linux Aide service from image sha256:4046152ab26037bc789a9504e1d650779a0d02e376dcf6046bf04d3b50ef2a72 accepted the ZIP and enabled it without load errors. The workbench exposed all three tools, all three host tool calls succeeded, and all nine generated standard-sampling profiles were accepted unchanged by Aide's /api/profiles validator. The fixture had no production mounts or real accounts and was removed afterward. Reproduce with scripts/host-acceptance.py --image <compatible-local-aide-image>.

No real-model quality/latency/cost, exact tokenizer, automatic application, actual OS clipboard destination paste or Windows native UI acceptance was performed. Profiles were written only inside the disposable fixture, not user workspaces. The standalone test browser and HTTP server are closed at completion.
