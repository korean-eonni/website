// Black Friday 2026 prices (22.11–02.12.2026).
//   node scripts/black-friday-2026.mjs status   — show what is live now
//   node scripts/black-friday-2026.mjs apply    — set BF prices (crossed price = regular price)
//   node scripts/black-friday-2026.mjs revert   — restore the regular prices saved in black-friday-2026.json
// Each row is only touched if it still has the price we expect, so manual edits in the admin are never overwritten.
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const mode = process.argv[2]
if (!['status', 'apply', 'revert'].includes(mode)) { console.error('usage: status|apply|revert'); process.exit(1) }
const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const plan = JSON.parse(fs.readFileSync(path.join(here, 'black-friday-2026.json'), 'utf8'))

const envFile = path.join(root, '.env.bftmp')
execSync(`npx vercel env pull "${envFile}" --environment=production --yes`, { cwd: root, stdio: 'ignore' })
let env
try {
  env = Object.fromEntries(fs.readFileSync(envFile, 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '')] }))
} finally { try { fs.unlinkSync(envFile) } catch {} }
process.env.POSTGRES_URL = env.POSTGRES_URL
const { sql } = await import('@vercel/postgres')

const n = v => (v === null || v === undefined ? null : Number(v))
let changed = 0, skipped = 0
for (const p of plan) {
  const { rows } = await sql`SELECT sale_price, original_price, discount_amount FROM products WHERE id = ${p.id}`
  const cur = rows[0]
  if (!cur) { console.log('MISSING', p.name); skipped++; continue }
  const sale = n(cur.sale_price)
  if (mode === 'status') { console.log(`${p.pct}% | ${p.name} | now ${sale} (orig ${n(cur.original_price)}, -${n(cur.discount_amount) ?? 0}%) | regular ${p.old_sale} → BF ${p.new_sale}`); continue }
  const now = new Date().toISOString()
  if (mode === 'apply') {
    if (sale === p.new_sale && n(cur.discount_amount) === p.pct) { skipped++; continue }
    if (sale !== n(p.old_sale)) { console.log(`SKIP (price changed to ${sale}, expected ${p.old_sale})`, p.name); skipped++; continue }
    await sql`UPDATE products SET original_price = ${p.old_sale}, sale_price = ${p.new_sale}, discount_amount = ${p.pct}, updated_at = ${now} WHERE id = ${p.id}`
  } else {
    if (sale === n(p.old_sale)) { skipped++; continue }
    if (sale !== p.new_sale) { console.log(`SKIP (price changed to ${sale}, expected BF ${p.new_sale})`, p.name); skipped++; continue }
    await sql`UPDATE products SET sale_price = ${p.old_sale}, original_price = ${p.old_original}, discount_amount = ${p.old_discount}, updated_at = ${now} WHERE id = ${p.id}`
  }
  changed++
}
if (mode !== 'status') console.log(`${mode}: changed ${changed}, unchanged/skipped ${skipped}, total ${plan.length}`)
