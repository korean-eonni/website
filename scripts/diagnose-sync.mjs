import { google } from 'googleapis'
import crypto from 'crypto'

const SHEET_RANGE = 'Загальний!A1:AQ'

function normalizePrivateKey(key) {
  let n = key.trim()
  if ((n.startsWith('"') && n.endsWith('"')) || (n.startsWith("'") && n.endsWith("'"))) n = n.slice(1, -1)
  let prev = 0
  while (n.length !== prev) { prev = n.length; n = n.replace(/\\n/g, '\n') }
  n = n.replace(/\\r/g, '').replace(/\r/g, '')
  return n
}
function slugFromName(name, index) {
  const base = name.toLowerCase().replace(/[^a-zа-яёіїєґ0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 40)
  return base ? `${base}-${index}` : crypto.randomUUID()
}

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: normalizePrivateKey(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})
const sheets = google.sheets({ version: 'v4', auth })
const res = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.GOOGLE_SHEETS_ID, range: SHEET_RANGE })
const rows = res.data.values || []
const headers = (rows[0] || []).map((h) => (h || '').toString().trim())
const data = rows.slice(1).map((row) => {
  const e = {}
  headers.forEach((h, i) => { if (h) e[h] = (row[i] ?? '').toString().trim() })
  return e
})

console.log('Sheet headers count:', headers.length)
console.log('Total data rows in sheet:', data.length)

let named = 0
const idCounts = {}
const idToNames = {}
const cats = {}
for (let i = 0; i < data.length; i++) {
  const r = data[i]
  const name = (r['Назва'] || '').trim()
  if (!name) continue
  named++
  const sku = (r['SKU'] || '').trim()
  const barcode = (r['Штрихкод'] || '').trim()
  const id = (sku || barcode || slugFromName(name, i)).toLowerCase().replace(/\s+/g, '-')
  idCounts[id] = (idCounts[id] || 0) + 1
  ;(idToNames[id] = idToNames[id] || []).push(name)
  const c = (r['Категорія'] || '(порожньо)').trim() || '(порожньо)'
  cats[c] = (cats[c] || 0) + 1
}

const uniqueIds = Object.keys(idCounts).length
const collisionGroups = Object.entries(idCounts).filter(([, c]) => c > 1)
const lostToCollisions = collisionGroups.reduce((acc, [, c]) => acc + (c - 1), 0)

console.log('Named rows (have Назва):', named)
console.log('UNIQUE ids:', uniqueIds)
console.log('Collision groups (same id used by >1 row):', collisionGroups.length)
console.log('Products LOST to id collisions (only 1 of each survives insert):', lostToCollisions)
console.log('\n=== Category distribution IN SHEET ===')
for (const [k, v] of Object.entries(cats).sort((a, b) => b[1] - a[1])) console.log(String(v).padStart(4), k)

console.log('\n=== Sample collision groups (first 15) ===')
for (const [id, c] of collisionGroups.slice(0, 15)) {
  console.log(`id="${id}" used ${c}x:`, idToNames[id].slice(0, c).map((n) => n.slice(0, 40)))
}

// How are SKUs distributed?
let blankSku = 0, withSku = 0
for (const r of data) {
  const name = (r['Назва'] || '').trim()
  if (!name) continue
  if ((r['SKU'] || '').trim()) withSku++; else blankSku++
}
console.log('\nNamed rows with SKU:', withSku, '| blank SKU:', blankSku)
