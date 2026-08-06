/**
 * ONE-TIME MIGRATION — product photos: Google Drive/CDN → our own Blob storage.
 *
 * Downloads every product photo that still points at Google
 * (lh3.googleusercontent.com / drive.google.com) and re-uploads it to Vercel
 * Blob under the same human-readable name the Drive folder used:
 *
 *     products/<product id>/<Назва товару>.jpg        (slot 1)
 *     products/<product id>/<Назва товару> (2).jpg    (slot 2) …
 *
 * The bytes are copied as-is, so the site renders pixel-identical images.
 *
 * Safety:
 *   • idempotent — photos already on Blob are skipped, so it can be re-run
 *   • writes a full backup of the previous URLs before touching the DB
 *   • --dry-run shows exactly what would happen and changes nothing
 *   • a failed photo leaves the old URL in place (never blanks a product)
 *
 * Usage:
 *   node scripts/migrate-images-to-blob.mjs --dry-run
 *   node scripts/migrate-images-to-blob.mjs
 *   node scripts/migrate-images-to-blob.mjs --limit 5     # migrate a few first
 */
import fs from 'node:fs'
import path from 'node:path'
import { createPool } from '@vercel/postgres'
import { put } from '@vercel/blob'

// ---------- env ----------
function loadEnvLocal() {
  const p = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(p)) return
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = v
  }
}
loadEnvLocal()

const DRY_RUN = process.argv.includes('--dry-run')
const limitArg = process.argv.indexOf('--limit')
const LIMIT = limitArg !== -1 ? parseInt(process.argv[limitArg + 1], 10) : null

if (!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL is missing (run: vercel env pull .env.local)')
if (!DRY_RUN && !process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN is missing')

const IMAGE_COLUMNS = [
  'image_url', 'image_url_2', 'image_url_3', 'image_url_4', 'image_url_5', 'image_url_6',
  'image_url_7', 'image_url_8', 'image_url_9', 'image_url_10', 'image_url_11', 'image_url_12',
]

const isBlobUrl = (u) => !!u && u.includes('.blob.vercel-storage.com')
const isGoogleUrl = (u) => !!u && (u.includes('googleusercontent.com') || u.includes('drive.google.com'))

function sanitizeForFilename(name) {
  return (name || '').toString().replace(/[/\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
}
function buildKey(productId, productName, slot, ext) {
  const safe = sanitizeForFilename(productName) || 'product'
  return `products/${productId}/${safe}${slot > 1 ? ` (${slot})` : ''}.${ext}`
}
function extFromContentType(ct) {
  const c = (ct || '').split(';')[0].trim().toLowerCase()
  return { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif' }[c] || null
}

async function download(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EonniMigrator/1.0)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const ct = res.headers.get('content-type') || ''
  if (!ct.startsWith('image/')) throw new Error(`not an image (${ct})`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (!buf.length) throw new Error('empty body')
  return { buf, contentType: ct.split(';')[0].trim() }
}

// POSTGRES_URL is a pooled connection string, so use createPool().
const client = createPool({ connectionString: process.env.POSTGRES_URL })

const { rows } = await client.query('SELECT * FROM products ORDER BY created_at ASC')
const products = LIMIT ? rows.slice(0, LIMIT) : rows

console.log(`\n${DRY_RUN ? '🔍 DRY RUN — нічого не змінюється' : '🚀 МІГРАЦІЯ'}`)
console.log(`Товарів: ${products.length}\n`)

// ---------- backup ----------
const backup = products.map((p) => {
  const o = { id: p.id, name: p.name }
  for (const c of IMAGE_COLUMNS) o[c] = p[c] ?? null
  return o
})
const backupPath = path.join(process.cwd(), `image-urls-backup-${Date.now()}.json`)
if (!DRY_RUN) {
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2))
  console.log(`💾 Бекап старих URL: ${backupPath}\n`)
}

let migrated = 0, skippedBlob = 0, failed = 0, productsChanged = 0, bytes = 0
const failures = []

for (const p of products) {
  const updates = {}
  for (let i = 0; i < IMAGE_COLUMNS.length; i++) {
    const col = IMAGE_COLUMNS[i]
    const url = p[col]
    if (!url) continue
    if (isBlobUrl(url)) { skippedBlob++; continue }
    if (!isGoogleUrl(url)) continue // leave anything unexpected untouched

    const slot = i + 1
    try {
      const { buf, contentType } = await download(url)
      const ext = extFromContentType(contentType) || 'jpg'
      const key = buildKey(p.id, p.name, slot, ext)
      if (DRY_RUN) {
        console.log(`  [dry] ${p.name?.slice(0, 40)} → ${key} (${Math.round(buf.length / 1024)} KB)`)
      } else {
        const blob = await put(key, buf, {
          access: 'public',
          contentType,
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60 * 60 * 24 * 365,
        })
        updates[col] = blob.url
      }
      bytes += buf.length
      migrated++
    } catch (e) {
      failed++
      failures.push({ id: p.id, name: p.name, slot, url, error: e.message })
      console.warn(`  ⚠️  ${p.name?.slice(0, 40)} слот ${slot}: ${e.message} — залишаю старий URL`)
    }
  }

  const cols = Object.keys(updates)
  if (!DRY_RUN && cols.length) {
    // Build a parameterised UPDATE for just the columns that succeeded.
    const setSql = cols.map((c, i) => `${c} = $${i + 1}`).join(', ')
    const values = cols.map((c) => updates[c])
    await client.query(
      `UPDATE products SET ${setSql}, updated_at = $${cols.length + 1} WHERE id = $${cols.length + 2}`,
      [...values, new Date().toISOString(), p.id]
    )
    productsChanged++
    console.log(`  ✅ ${p.name?.slice(0, 50)} — ${cols.length} фото`)
  }
}

console.log(`\n──────── ПІДСУМОК ────────`)
console.log(`  перенесено фото:      ${migrated}`)
console.log(`  вже були у сховищі:   ${skippedBlob}`)
console.log(`  помилок:              ${failed}`)
console.log(`  товарів оновлено:     ${productsChanged}`)
console.log(`  обсяг:                ${(bytes / 1024 / 1024).toFixed(1)} MB`)
if (failures.length) {
  const fp = path.join(process.cwd(), `image-migration-failures-${Date.now()}.json`)
  fs.writeFileSync(fp, JSON.stringify(failures, null, 2))
  console.log(`  ⚠️  деталі помилок:   ${fp}`)
}
if (!DRY_RUN) console.log(`  бекап:                ${backupPath}`)
console.log(`──────────────────────────\n`)

await client.end()
