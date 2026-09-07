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

const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets(properties(sheetId,title,index,gridProperties(rowCount,columnCount)))' })
console.log('=== ALL TABS ===')
for (const s of meta.data.sheets) {
  const p = s.properties
  console.log(`gid=${p.sheetId}  "${p.title}"  rows=${p.gridProperties.rowCount} cols=${p.gridProperties.columnCount}`)
}

const targetGid = 185560236
const target = meta.data.sheets.find((s) => s.properties.sheetId === targetGid)
if (!target) {
  console.log(`\nTab with gid=${targetGid} not found.`)
} else {
  const title = target.properties.title
  console.log(`\n=== CONTENT of tab gid=${targetGid} ("${title}") ===`)
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${title}!A1:Z` })
  const rows = res.data.values || []
  console.log('Rows (incl header):', rows.length)
  console.log('Header:', JSON.stringify(rows[0]))
  console.log('\nFirst 40 rows:')
  rows.slice(0, 40).forEach((r, i) => console.log(String(i).padStart(3), JSON.stringify(r)))
}
