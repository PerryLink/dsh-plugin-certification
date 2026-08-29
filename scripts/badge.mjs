// Badge generator: renders an SVG badge for one certified entry from
// data/certified.json. Usage: node scripts/badge.mjs <owner>/<repo> [outfile]
// Grades: A / B / C / D / no-data. Evidence discipline: the registry is the
// only source of truth; this script never invents a grade.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/certified.json'), 'utf8'))
const target = process.argv[2]
if (!target) {
  console.error('usage: node scripts/badge.mjs <owner>/<repo> [outfile]')
  process.exit(1)
}
const entry = registry.entries.find((e) => e.repo === target)
const grade = entry ? entry.grade : 'no-data'
const colors = { A: '#2da44e', B: '#1a7f37', C: '#9a6700', D: '#cf222e', 'no-data': '#6e7781' }
const color = colors[grade] || colors['no-data']
const label = 'dsh-certified'
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="132" height="20" role="img" aria-label="dsh-plugin-certification: ${grade}">
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="132" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)"><rect width="81" height="20" fill="#555"/><rect x="81" width="51" height="20" fill="${color}"/><rect width="132" height="20" fill="url(#s)"/></g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="41.5" y="14">${label}</text><text x="105.5" y="14">${grade}</text>
  </g>
</svg>
`
const out = process.argv[3] || path.join(root, 'badges', `${target.replace('/', '__')}.svg`)
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, svg.trim() + '\n')
console.log(`${target}: ${grade} -> ${out}`)
