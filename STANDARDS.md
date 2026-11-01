# DSH standards crosswalk

> **Non-official.** This file is a crosswalk written *by* `dsh-plugin-certification`. It is not a standard, not a certification of any DSH level, not a security audit, and not a legal instrument. The canonical definitions of DSH-ENTRY, DSH-FLOW and DSH-BOOST live in the private `dsh-standards` project (a draft at the time of writing; ask the maintainer for access). A public teaching copy is [dsh-plugin-guide/guide/standards.md](https://github.com/PerryLink/dsh-plugin-guide/blob/main/guide/standards.md). The GB / GB∕T / GB∕Z comparison is a communication analogy only: no standard number, no issuing body, no legal force.
>
> **Version:** 1.0.0 · reviewed against `dsh-levels/1` (`spec/levels.json`, version `1.0.0-rc.1`, status `draft`) on 2026-11-01. The canonical repository is a private draft at the time of writing; the public teaching copy linked above is the access-free version. Cite this mapping, not a public standard.
>
> **Machine-readable twin:** [`data/standards-crosswalk.json`](./data/standards-crosswalk.json). Both files carry the same mapping and the same caveats; if they disagree, the JSON is the record and this file is the bug.

## 1. Two axes, not one scale

**`A` / `B` / `C` / `D` is a quality and evidence grade. `ENTRY` / `FLOW` / `BOOST` is adoption depth. They are orthogonal, and neither implies the other.**

This repository grades five dimensions (A manifest, B build hygiene, C supply chain, D release integrity, E install smoke) plus a security veto. It does not assign a DSH level, and the registry has no field where one could be stored: `data/attestations.json` records `grade`, the five `dimensions`, `veto` and a snapshot date. The standards repository states the same orthogonality in `34-三层分级模型-GB-GBT-GBZ类比.md` §5 and in `spec/levels.json` (`axes.rules`).

Three consequences worth spelling out:

- **Grade A is not ENTRY.** A plugin can be grade `A` and still be `ENTRY = not-run`: no G0–G5 gate result is recorded for it here.
- **ENTRY runtime is not grade A.** A plugin can boot on the recorded host and still fail certification — no license, no provenance, a veto hit.
- **Grade A is not FLOW.** A plugin can be grade `A` and still have `FLOW = not-run`, because no journey ran. That is the state of every entry in this registry today.

The standards' two-axis form is the readable one: `ENTRY=runtime, FLOW=not-run, BOOST=not-measured`. Never collapse it into a score, and never derive a level from a grade (or the reverse).

Reading only this repository, the honest states for every entry are `ENTRY = not-run`, `FLOW = not-run`, `BOOST = not-measured`. Those mean "no assessment here", not a verdict about the plugin.

## 2. Dimension-to-level crosswalk

| Dimension | What it proves (snapshot-bound) | DSH level / gate it can feed | What it does **not** prove |
|---|---|---|---|
| **A. Manifest compliance** (static) | The package declares a `dsh.bundle` manifest, an SPDX license, aligned keywords/topics, five-language READMEs and an `engines` range. | **ENTRY** — G0 *declaration side only*; G2 *input only* (the declared range, not the host verdict). License, keywords and README checks are certification policy, not ENTRY requirements. | That the patch parses (G0), rows compose (G1), the host admits (G2), the tree boots (G3), client exports/root row exist (G4), or the report is anchored (G5). No runtime, no security, no FLOW, no BOOST. |
| **B. Build hygiene** (static) | The package surface is deliberate (`files` allowlist, peer/optional declarations), no known malicious install-time pattern is present, and lint/typecheck gates exist. | **ENTRY** — inputs to G1 (tarball completeness) and G2 (declared peers); no verdict. | That the allowlist covers every file a patch references (G1), that the ranges admit the recorded host (G2), that install scripts are harmless (pattern match, not execution), or anything at runtime. |
| **C. Supply chain** (Scorecard) | The upstream repository's posture on OpenSSF Scorecard's 18 checks, as measured by the Scorecard service on its run date. | No level, no gate. Governance context only. | Any plugin behaviour, any gate outcome, any security verdict. A score is a third-party heuristic, not a check. |
| **D. Release integrity** (provenance) | The published artifact carries verifiable SLSA provenance from a CI identity (`npm audit signatures`). | No level, no gate. Context only. | That the artifact behaves correctly, that its source is safe, or that a host admits it. Provenance answers "who built it", not "does it run". |
| **E. Install smoke** (test-drive) | The recorded version installs into a throwaway profile and boots keyless on the recorded host version (tree-load proof), with a reproduction command. | **ENTRY** — G2 *install observed on the recorded host*; G3 *boot only* (no per-row ACTIVE/disabled assertion). | That every target row is ACTIVE/disabled (G3), that another host version admits it (G2), composition (G1), client state (G4), removal cleanliness (FLOW), or that any feature works. `ok` is not `runtime`. |
| **Security veto** (not a dimension) | No obfuscated code, credential exfiltration or surprising install-time behaviour was found in the reviewed artifact at the snapshot date. | **No ENTRY gate** — ENTRY explicitly does not audit security. It is this repository's own precondition: no grade is published over a veto hit. | Security. A veto hit is not a CVE, a sandbox result or a red-team finding; a clear veto is the absence of detected patterns, not proof of safety. |

**"Can feed" is not "passes."** This repository does not run a G0–G5 gate and the registry records no gate result. Saying a dimension "can feed G2" means it supplies an input a gate could read — not that the host admits the plugin, and not that the gate ran.

## 3. ENTRY mapping: necessary, not sufficient

**A (manifest) + E (install smoke) + a clear security veto are necessary but not sufficient for ENTRY `runtime`. The standards repository's G0–G5 gates still decide it, and none of them is run here.**

What "necessary" means, precisely, because it is easy to overread:

- It is **this repository's precondition for lending evidence** to an ENTRY claim, not a definition of ENTRY.
- Only part of A is ENTRY-relevant: the `dsh.bundle` and `engines` declarations. The license, keyword/topic and five-language-README checks are this repository's criteria; ENTRY does not require them. A plugin can be `ENTRY = runtime` without passing dimension A.
- The security veto is **not an ENTRY gate**. `31-DSH-ENTRY入门规范.md` §2.2 sends security and brand findings to the FLOW/governance track and says ENTRY does not audit security; `90-兼容运行时保证.md` §3.2 lists security as WARN-only. A vetoed plugin can still be G0–G5 runtime. The veto is this repository's promise not to publish a grade on top of a hit.
- The standards repo's own gate list is `spec/levels.json` `levels[entry].gates`; G4 is static and G5 is a freshness gate, not runtime evidence.

What is still missing, gate by gate:

| Gate | What the standard requires | What this repository supplies | What is still missing |
|---|---|---|---|
| **G0** | `dsh.bundle.patch` parses | A confirms a `dsh.bundle` manifest is declared | The patch document is never parsed here |
| **G1** | base + sample compose; inserted row names resolve | B checks the `files` allowlist (tarball completeness is an input) | No composition, no row-name resolution |
| **G2** | `evaluatePluginCompatibility` admits, or an explicit exact-version exemption applies | A/B supply the declared `engines`/peer ranges; E records an install the recorded host accepted | No gate evaluation and no exemption record; the recorded host version may differ from the current anchor |
| **G3** | real `boot()`; every target row `ACTIVE` or `disabled` | E records a keyless boot reaching `MISSING_CREDENTIAL` (tree-load proof) | Per-row state is never asserted; a tree that loads is not a row that is ACTIVE |
| **G4** | when `dsh.client` exists: `exports["./client"]` and a package-root row | nothing | No dimension checks `dsh.client`, the export or the root row |
| **G5** | report carries runtime version/commit/artifact mtime; stale evidence is marked `stale` | a snapshot date and prose evidence, plus a separate 30-day registry gate | No structured runtime/commit anchor, no artifact mtime, no per-plugin `stale` state |

Two further reasons this cannot be closed by relabelling:

- **E is host-pinned.** The single registry entry shows the shape in its own `installSmoke.evidence`: it names the exact `@deepseek-ai/dsh` pin used and warns to re-pin before reuse. A G2/G3 verdict is bound to the host version tested; a certification snapshot is not that anchor.
- **Three clocks, none interchangeable.** (1) This repository's `scripts/check-freshness.mjs` fails when the registry `generatedAt` or an entry `snapshot` is more than 30 days old. (2) G5 asks whether the *report* carries a runtime version, commit and artifact mtime, and whether the artifact is newer than the report. (3) The standards' own expiry is recorded in `spec/levels.json` `review.expiryDays` (entry 90 / flow 180 / boost 365 days, draft). The 30-day gate is not G5, and G5 is not the standards' expiry.

If this repository ever displays an ENTRY state, it must be a **quotation from a standards-run record** carrying the anchor fields `spec/levels.json` requires (`level`, `levelVersion`, `dshVersion`, `cordisVersion`, `commit`, `generatedAt`, `scope`, `notClaimed`), and it must say who ran it. This repository does not do that today.

## 4. FLOW mapping: `not-covered`

**No certification dimension measures J1–J8. `FLOW` is `not-covered` in [`data/standards-crosswalk.json`](./data/standards-crosswalk.json) — not `warn`, not `partial`.**

- The registry record has no journey field, no per-journey command/environment/log/timestamp, and no `manual` / `runtime` / `not-run` state.
- Nothing here removes a plugin, disables it, feeds it a bad configuration, rolls back an upgrade, or checks README quickstart, permissions or error content.
- Two adjacencies are worth naming so they are not mistaken for coverage:
  - **E** installs into a throwaway profile and prints the resulting profile row — the *install* half of the install/remove journey. It never removes the plugin, never asserts that the layer and dependencies disappear, and records no journey state.
  - **A** checks that five-language READMEs exist. It does not check quickstart content, permissions text or the error three-part structure.

  Adjacency is not coverage: a plugin can be grade `A` with E `ok` and still have a broken uninstall.

What would be needed before this repository could claim any FLOW coverage:

1. a journey record per J1–J8 — command, environment, expected vs actual, log path, timestamp, and a state from `spec/levels.json` (`manual` / `runtime` / `not-run`);
2. a harness that actually runs install/dump/remove, enable/disable, bad configuration, quickstart, permissions, upgrade/rollback/uninstall, diagnostics and headless/web client states in a throwaway `DSH_HOME` against a published tarball (the standards repo's `journey-runtime.mjs` does J1 only; J2–J8 are `not-run` there too);
3. a coverage rule where a skip is not a pass and a manual journey is labelled `manual`;
4. a freshness rule for journey evidence, and a reviewer able to reproduce it;
5. a submission-format change and a gate change here — **before** any `dsh-flow:*` label appears.

## 5. BOOST mapping: `not-covered`

**No certification dimension measures LEV-1..LEV-8.**

- BOOST is a practice library in the standards repository, not a plugin level: `33-DSH-BOOST加速实践.md` §4 defines the evidence card (baseline/after/environment/command/result/caveats), and `spec/levels.json` lists the eight practices.
- A, B, C, D and E are not LEV evidence. A declared lint gate is not LEV-8's "one added layer"; provenance is not LEV-6's byte-stable prefix; a boot is not LEV-1's effect-baseline check. No LEV number is computed anywhere in this repository.
- Nothing here may attach a `dsh-boost:*` label to an entry. A practice card names a practice and a plugin version; it is not a grade and not a badge.

What would be needed: one card per practice with environment, input scale, command, negative control, result, version anchor and limitations; storage that lets the card be **re-run**, not prose; a rule that "described" is not "measured" and that a single run is not a production benchmark. The cards live in the standards repository; this registry has no place for them today.

## 6. The two vocabularies do not translate

| This repository's words | The standards' words (`spec/levels.json`) |
|---|---|
| dimensions A–D: `pass` / `fail`, with absent evidence recorded as `no-evidence` | ENTRY: `recognized`, `static`, `runtime`, `blocked`, `failed`, `not-run`, `stale` |
| dimension E: `ok` / `load-fail` / `install-fail` / `skip` | FLOW: `manual`, `runtime`, `not-run`, `failed`, `stale` |
| grade: `A`–`D`; badge-only `no-data` | BOOST: `measured`, `not-measured`, `failed`, `stale` |

No mapping is defined and none should be invented: E `ok` is not `runtime`; E `skip` is not a pass and does not carry the standards' coverage obligation for `not-run`; a dimension `pass` is not `recognized`. Keep the words apart when quoting either side.

## 7. What this repository will not claim

- That an `A`–`D` grade is a DSH level, or that `ENTRY` / `FLOW` / `BOOST` is a grade.
- An `ENTRY runtime` state from certification evidence alone.
- That `installSmoke: ok` equals ENTRY `runtime`, or that a keyless boot equals a row-ACTIVE assertion.
- Coverage of FLOW J1–J8 or of BOOST LEV-1..LEV-8.
- A security verdict from the security veto, the OpenSSF Scorecard or npm provenance. A clear veto is not "safe"; a score is not an audit.
- Official status, DeepSeek endorsement, or compliance with GB, GB/T or GB/Z. The analogy has no legal force and this project is not a standards body.
- A combined score, ranking or ordering derived from a grade plus a level.
- That a stale snapshot describes a plugin as it is now. The 30-day gate exists because it does not.

This document adds no attested entry and changes no grade. `data/attestations.json`, `badges/` and the freshness gate are untouched.

## 8. Maintaining this crosswalk

- **Curated, not generated.** Like the registry, this file is hand-written. `scripts/check-freshness.mjs` does not read it, so a mistake here cannot change a grade — and nothing catches drift, so review it by hand.
- **One-way mirror.** The standards repository already carries a crosswalk entry for this repo in `spec/levels.json` (`crosswalk.dsh-plugin-certification`: `entry: [manifest, installSmoke, securityVeto]`, `flow`/`boost`: `not-covered`). This file splits the veto out as `vetoGate` because it is this repository's policy precondition, not an ENTRY gate. That is a deliberate difference in shape, not extra coverage.
- **Sync rule.** Change both sides in the same review. Never add coverage before the harness exists; never remove a `not-covered` because a grade is high.
- **Version pin.** Reviewed against `dsh-levels/1` `1.0.0-rc.1` (draft). Re-review when the standards repository bumps the schema or the gate list.

## 9. References

- Canonical standards project: private `PerryLink/dsh-standards` (draft at the time of writing; ask the maintainer)
- Public teaching copy: [dsh-plugin-guide/guide/standards.md](https://github.com/PerryLink/dsh-plugin-guide/blob/main/guide/standards.md)
- Machine-readable levels: `spec/levels.json` in the canonical project
- ENTRY: `31-DSH-ENTRY入门规范.md`, `90-兼容运行时保证.md`, `92-兼容运行时实测.md`
- FLOW: `32-DSH-FLOW顺畅规范.md`
- BOOST: `33-DSH-BOOST加速实践.md`
- Orthogonality with grades: `34-三层分级模型-GB-GBT-GBZ类比.md` §5
- This repository's spec: [`README.md`](./README.md) (five dimensions, grades, evidence discipline); registry: [`data/attestations.json`](./data/attestations.json)
