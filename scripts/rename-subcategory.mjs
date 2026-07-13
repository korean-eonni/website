import { google } from 'googleapis'

function npk(k){let n=k.trim();if((n.startsWith('"')&&n.endsWith('"'))||(n.startsWith("'")&&n.endsWith("'")))n=n.slice(1,-1);let p=0;while(n.length!==p){p=n.length;n=n.replace(/\\n/g,'\n')}return n.replace(/\\r/g,'').replace(/\r/g,'')}

// trimmed source value -> new value (applied to the Субкатегорія column of "Загальний")
const FROM = 'Педи'
const TO = 'Пади'
const APPLY = process.argv.includes('--apply')

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: npk(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})
const sheets = google.sheets({ version: 'v4', auth })
const spreadsheetId = process.env.GOOGLE_SHEETS_ID

function colLetter(i){let s='';i+=1;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s}

const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Загальний!A1:AZ' })
const rows = res.data.values || []
const header = rows[0].map(h => (h||'').toString().trim())
const idx = header.indexOf('Субкатегорія')
if (idx === -1) { console.log('Субкатегорія column not found'); process.exit(1) }
const letter = colLetter(idx)

const updates = []
for (let r = 1; r < rows.length; r++) {
  const raw = (rows[r][idx] ?? '').toString()
  if (raw.trim() === FROM) updates.push({ range: `Загальний!${letter}${r+1}`, from: raw, to: TO })
}

console.log(`${APPLY ? 'APPLY' : 'DRY-RUN'} — cells "${FROM}" -> "${TO}": ${updates.length}`)
updates.forEach(u => console.log(`  ${u.range}: "${u.from}" -> "${u.to}"`))

if (APPLY && updates.length) {
  const resp = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: 'RAW', data: updates.map(u => ({ range: u.range, values: [[u.to]] })) },
  })
  console.log('\n✅ Updated cells:', resp.data.totalUpdatedCells)
} else if (!APPLY) {
  console.log('\n(dry-run — re-run with --apply to write)')
}
