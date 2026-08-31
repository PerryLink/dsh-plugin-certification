# dsh-plugin-certification

Community certification for DeepSeek Harness plugins: a public spec, a machine-checkable scoring model, and an independent registry with badges. This project exists because the ecosystem's canonical list explicitly says it is "not a judge of plugin quality" and "listing is not a security review" — someone outside the listings should run that check, reproducibly, without claiming authority over them.

## The five dimensions

| Dimension | Evidence source | Checks |
|---|---|---|
| A. Manifest compliance | Static | `dsh.bundle` manifest, LICENSE (SPDX), keywords/topics alignment, five-language READMEs, engines |
| B. Build hygiene | Static | `files` allowlist completeness, dependency declarations (peer/optional), no malicious `postinstall` patterns, lint/typecheck gates present |
| C. Supply chain | OpenSSF Scorecard | The 18 upstream checks, via the official Scorecard API and badges |
| D. Release integrity | npm provenance | SLSA attestation verifiable with `npm audit signatures` |
| E. Install smoke | dsh-test-drive records | Real install/load/keyless boot in an isolated throwaway profile (four states: `ok` / `load-fail` / `install-fail` / `skip`) |

## Grades

- **A** — all five pass (E must be `ok`), no veto hit
- **B** — E passes and at least three of A/B/C/D pass
- **C** — E passes, the rest incomplete
- **D** — any hard gate fails (`dsh.bundle` missing, no license, malicious pattern hit)
- **Security veto** — obfuscated code, credential exfiltration, or surprising install-time behavior grades D immediately, with the reason published
- **Environment-blocked E** — when E ends `install-fail` purely because of an unattended-environment gate (e.g. pnpm's interactive `approve-builds` cannot be confirmed in a sandbox), the entry keeps grade **B** (if A–D pass) and records `environment-blocked` with the reproduction command. Environmental gates are never recorded as `D`.

## Evidence discipline (load-bearing)

Every score must come from real, reproducible execution — a probe result, a Scorecard run, a provenance check, or a test-drive record. Absent evidence is `no-evidence`, never a guess. Every dimension records audit links with a snapshot date.

## Registry and badges

- `data/certified.json` — daily CI refresh, one record per certified repository (dimension results + evidence links + spec version)
- Badge: `https://perrylink.github.io/dsh-plugin-certification/badge/<owner>/<repo>.svg` (A/B/C/D, plus a `no-data` gray state), linking back to the registry detail page
- Lists and marketplaces link the badge only — their "no endorsement" stance is unchanged

## Relationship to existing tools

- `dsh-test-drive` supplies dimension E records (already-open `test_drive` domain)
- `dsh-score` consumes certification records as install evidence
- `dsh-skill-pack-security` supplies the malicious-pattern vetting for dimension B
- OpenSSF Scorecard supplies dimension C wholesale — this project does not reinvent it
- Overlap with `dsh-plugin-scorecard`, `dsh-plugin-audit`, and friends: governance discussion is open in [issue #1](../../issues/1); the goal is one agreed standard, not a twenty-first scorer

## Roadmap

1. Publish spec v1 (this document)
2. Registry + badge CI
3. Certify the 33 PerryLink plugins as the first baseline batch
4. Pilot with other top plugin authors
5. Propose badge display to the canonical list and marketplaces (link-only, no endorsement)

## License

MIT. See [LICENSE](./LICENSE).
