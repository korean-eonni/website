import { google } from 'googleapis'

function normalizePrivateKey(key) {
  let n = key.trim()
  if ((n.startsWith('"') && n.endsWith('"')) || (n.startsWith("'") && n.endsWith("'"))) n = n.slice(1, -1)
  let prev = 0
  while (n.length !== prev) { prev = n.length; n = n.replace(/\\n/g, '\n') }
  return n.replace(/\\r/g, '').replace(/\r/g, '')
}
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: normalizePrivateKey(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})
const sheets = google.sheets({ version: 'v4', auth })
const spreadsheetId = process.env.GOOGLE_SHEETS_ID

// --- Допоміжний tab (dropdown definitions) ---
console.log('=== "Допоміжний" tab (first 30 rows, cols A:H) ===')
try {
  const aux = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Допоміжний!A1:H40' })
  ;(aux.data.values || []).slice(0, 30).forEach((r, i) => console.log(String(i).padStart(3), JSON.stringify(r)))
} catch (e) { console.log('  err:', e.message) }

// --- Категорія + Субкатегорія distribution in Загальний ---
const gen = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Загальний!A1:E' })
const rows = gen.data.values || []
const header = rows[0].map((h) => (h || '').toString().trim())
const ci = header.indexOf('Категорія')
const si = header.indexOf('Субкатегорія')
const ni = header.findIndex((h) => h === 'Назва')
const cat = {}, sub = {}, catSub = {}
for (const r of rows.slice(1)) {
  const name = (r[ni] || '').toString().trim()
  if (!name) continue
  const c = (r[ci] || '(порожньо)').toString().trim() || '(порожньо)'
  const s = (r[si] || '(порожньо)').toString().trim() || '(порожньо)'
  cat[c] = (cat[c] || 0) + 1
  sub[s] = (sub[s] || 0) + 1
  ;(catSub[c] = catSub[c] || new Set()).add(s)
}
console.log('\n=== Категорія values in Загальний ===')
for (const [k, v] of Object.entries(cat).sort((a, b) => b[1] - a[1])) console.log(String(v).padStart(4), JSON.stringify(k))
console.log('\n=== Субкатегорія per Категорія ===')
for (const [c, set] of Object.entries(catSub)) console.log(`• ${c}:`, [...set].join(' | '))
