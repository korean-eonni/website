import { google } from 'googleapis'

function normalizePrivateKey(key) {
  let n = key.trim()
  if ((n.startsWith('"') && n.endsWith('"')) || (n.startsWith("'") && n.endsWith("'"))) n = n.slice(1, -1)
  let prev = 0
  while (n.length !== prev) { prev = n.length; n = n.replace(/\\n/g, '\n') }
  return n.replace(/\\r/g, '').replace(/\r/g, '')
}

// Map: spreadsheet value -> site value (what we want the sheet to read)
const MAP = {
  'Догляд за тілом': 'Тіло',
  'Косметичні прилади': 'Косметичні девайси',
  'Health&Care': 'Health & Care',
}

const APPLY = process.argv.includes('--apply')

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: normalizePrivateKey(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'], // write scope (used only with --apply)
})
const sheets = google.sheets({ version: 'v4', auth })
const spreadsheetId = process.env.GOOGLE_SHEETS_ID

function colLetter(idx) {
  let s = ''
  idx += 1
  while (idx > 0) { const m = (idx - 1) % 26; s = String.fromCharCode(65 + m) + s; idx = Math.floor((idx - 1) / 26) }
  return s
}

const updates = [] // {range, value, from, sheet}

async function scanTab(tabTitle, headerName) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${tabTitle}!A1:AZ` })
  const rows = res.data.values || []
  if (!rows.length) return
  const header = rows[0].map((h) => (h || '').toString().trim())
  const colIdx = header.indexOf(headerName)
  if (colIdx === -1) { console.log(`  [${tabTitle}] header "${headerName}" not found`); return }
  const letter = colLetter(colIdx)
  for (let r = 1; r < rows.length; r++) {
    const raw = (rows[r][colIdx] ?? '').toString()
    const trimmed = raw.trim()
    if (MAP[trimmed]) {
      updates.push({ range: `${tabTitle}!${letter}${r + 1}`, value: MAP[trimmed], from: trimmed, tab: tabTitle })
    }
  }
}

await scanTab('Загальний', 'Категорія')
await scanTab('Допоміжний', 'Категорії')

console.log(`=== ${APPLY ? 'APPLY' : 'DRY-RUN'} — planned cell changes: ${updates.length} ===`)
const byChange = {}
for (const u of updates) {
  const k = `${u.from} -> ${u.value}`
  byChange[k] = (byChange[k] || 0) + 1
}
for (const [k, v] of Object.entries(byChange)) console.log(`  ${String(v).padStart(3)}×  ${k}`)
console.log('\nCells:')
updates.forEach((u) => console.log(`  ${u.range}: "${u.from}" -> "${u.value}"`))

if (APPLY && updates.length) {
  const data = updates.map((u) => ({ range: u.range, values: [[u.value]] }))
  const resp = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: 'RAW', data },
  })
  console.log('\n✅ Applied. Updated cells:', resp.data.totalUpdatedCells)
} else if (!APPLY) {
  console.log('\n(dry-run — nothing written. Re-run with --apply to write.)')
}
