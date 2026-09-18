// Gate for this data repository (the non-plugin door of the upgrade corridor).
//
// Three assertions, each checked against a machine-readable source instead of
// hand-typed prose:
//
//   1. freshness - the registry root `generatedAt` and every entry `snapshot`
//      must be no older than MAX_AGE_DAYS. A certification grade claims to
//      describe a plugin as it is now; stale evidence is a correctness bug, not
//      a cosmetic one, so this is a hard fail.
//   2. mirror    - the read-only MCP mirror served by `dsh-cert-mcp` must be
//      byte-identical to this registry. A drifted mirror publishes stale grades
//      under a live URL. A missing mirror (a lone clone) is reported as SKIP,
//      never as a pass that pretends to have compared something.
//   3. markers   - the machine-readable denominators in README.md
//      (`<!-- roster-count: N -->`, `<!-- certified-count: M -->`) must equal
//      the values derived from `dsh-plugin-kit/data/repos.json` and from this
//      registry. Prose numbers drift; markers fail loudly instead.
//
// External sources are read-only. When one is absent the check reports SKIP and
// does not fail, so this gate is honest on a lone clone and loud in the fleet.
//
// Usage: node scripts/check-freshness.mjs
// Verification overrides (read-only debug switches; the defaults below are what
// the gate uses in the fleet, and neither switch is required for a normal run):
//   DSH_CERT_MIRROR, DSH_KIT_ROSTER - absolute or cwd-relative paths.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const MAX_AGE_DAYS = 30
const REGISTRY = path.join(root, 'data', 'certified.json')
const README = path.join(root, 'README.md')
const MIRROR = path.resolve(process.env.DSH_CERT_MIRROR ?? path.join(root, '..', 'dsh-cert-mcp', 'data', 'certified.json'))
const ROSTER = path.resolve(process.env.DSH_KIT_ROSTER ?? path.join(root, '..', 'dsh-plugin-kit', 'data', 'repos.json'))

const DAY_MS = 86_400_000
const failures = []
const notes = []
const fail = (message) => failures.push(message)

/** Read + parse JSON, turning any failure into a loud, labelled message. */
function readJson(file, label) {
  let raw
  try {
    raw = fs.readFileSync(file, 'utf8')
  } catch (error) {
    return { absent: error.code === 'ENOENT', message: `${label}: cannot read ${file} (${error.code ?? error.message})` }
  }
  try {
    return { raw, json: JSON.parse(raw) }
  } catch (error) {
    return { message: `${label}: invalid JSON in ${file} - ${error.message}` }
  }
}

/** Whole days between a `YYYY-MM-DD` stamp and today (UTC), or null if unusable. */
function ageInDays(stamp, todayUtc) {
  if (typeof stamp !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(stamp)) return null
  const parsed = Date.parse(`${stamp}T00:00:00Z`)
  if (Number.isNaN(parsed)) return null
  return Math.round((todayUtc - parsed) / DAY_MS)
}

const now = new Date()
const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

// 1. freshness ---------------------------------------------------------------
const registry = readJson(REGISTRY, 'registry')
if (registry.message) {
  fail(registry.message)
} else {
  const ages = []
  const rootAge = ageInDays(registry.json.generatedAt, todayUtc)
  if (rootAge === null) fail(`freshness: registry generatedAt is missing or not YYYY-MM-DD (got ${JSON.stringify(registry.json.generatedAt)})`)
  else ages.push(['generatedAt', registry.json.generatedAt, rootAge])

  const entries = Array.isArray(registry.json.entries) ? registry.json.entries : null
  if (entries === null) fail('freshness: registry entries is not an array')
  else {
    if (entries.length === 0) fail('freshness: registry has no entries')
    for (const entry of entries) {
      const label = `snapshot(${entry?.repo ?? 'unknown'})`
      const age = ageInDays(entry?.snapshot, todayUtc)
      if (age === null) fail(`freshness: ${label} is missing or not YYYY-MM-DD (got ${JSON.stringify(entry?.snapshot)})`)
      else ages.push([label, entry.snapshot, age])
    }
    for (const [label, stamp, age] of ages) {
      if (age > MAX_AGE_DAYS) fail(`freshness: ${label} ${stamp} is ${age} days old (limit ${MAX_AGE_DAYS})`)
    }
    if (failures.length === 0) {
      const oldest = ages.reduce((a, b) => (a[2] >= b[2] ? a : b))
      notes.push(`freshness: ok (oldest ${oldest[0]} ${oldest[1]}, ${oldest[2]}d old, limit ${MAX_AGE_DAYS}d)`)
    }
  }
}

// 2. mirror ------------------------------------------------------------------
if (registry.message) {
  // Cannot compare without a parsed local registry.
} else {
  const mirror = readJson(MIRROR, 'mirror')
  if (mirror.absent) {
    notes.push(`mirror: SKIP (no mirror at ${MIRROR}; nothing compared)`)
  } else if (mirror.message) {
    fail(mirror.message)
  } else {
    const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
    const mine = sha(REGISTRY)
    const theirs = sha(MIRROR)
    if (mine !== theirs) {
      fail(`mirror: drifted - ${MIRROR} is not byte-identical to data/certified.json (local ${mine.slice(0, 16)}…, mirror ${theirs.slice(0, 16)}…)`)
      notes.push('mirror: remedy - re-run the registry refresh in dsh-cert-mcp so its served copy matches this repository')
    } else {
      notes.push(`mirror: ok (sha256 ${mine.slice(0, 16)}… identical)`)
    }
  }
}

// 3. markers -----------------------------------------------------------------
if (!registry.message) {
  const roster = readJson(ROSTER, 'roster')
  if (roster.absent) {
    notes.push(`markers: SKIP (no roster at ${ROSTER}; nothing compared)`)
  } else if (roster.message) {
    fail(roster.message)
  } else {
    let readme
    try {
      readme = fs.readFileSync(README, 'utf8')
    } catch (error) {
      readme = null
      fail(`markers: cannot read ${README} (${error.code ?? error.message})`)
    }
    if (readme !== null) {
      const repos = Array.isArray(roster.json.repos) ? roster.json.repos : []
      const pluginRepos = repos.filter((repo) => repo?.role !== 'infra').length
      const certified = Array.isArray(registry.json.entries) ? registry.json.entries.length : 0
      const expected = [
        ['roster-count', pluginRepos, `entries in ${path.basename(ROSTER)} with role != infra`],
        ['certified-count', certified, 'entries in data/certified.json'],
      ]
      for (const [name, want, source] of expected) {
        const match = readme.match(new RegExp(`<!--\\s*${name}:\\s*(\\d+)\\s*-->`))
        if (match === null) {
          fail(`markers: README.md has no <!-- ${name}: N --> marker (expected ${want} from ${source})`)
        } else if (Number(match[1]) !== want) {
          fail(`markers: README.md says ${name} ${match[1]} but ${source} says ${want}`)
        } else {
          notes.push(`markers: ${name} ${want} ok`)
        }
      }
    }
  }
}

// Report ---------------------------------------------------------------------
for (const note of notes) console.log(note)
for (const message of failures) console.error(message)
if (failures.length > 0) {
  console.error(`check-freshness: FAILED (${failures.length} assertion${failures.length === 1 ? '' : 's'})`)
  process.exit(1)
}
console.log('check-freshness: ok')
