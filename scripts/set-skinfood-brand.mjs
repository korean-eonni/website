import { google } from 'googleapis'
function npk(k){let n=k.trim();let p=0;while(n.length!==p){p=n.length;n=n.replace(/\n/g,'\n')}return n.replace(/\r/g,'')}
const APPLY = process.argv.includes('--apply')
const auth = new google.auth.JWT({ email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, key: npk(process.env.GOOGLE_SERVICE_ACCOUNT_KEY), scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
const sheets = google.sheets({ version: 'v4', auth })
const spreadsheetId = process.env.GOOGLE_SHEETS_ID
const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Загальний!A1:E' })
const rows = res.data.values || []
const h = rows[0].map(x=>(x||'').toString().trim())
const ni = h.indexOf('Назва'), bi = h.indexOf('Бренд')
const updates = []
for (let r=1;r<rows.length;r++){ const name=(rows[r][ni]||'').toString(); if(name.toLowerCase().includes('skinfood')){ const cur=(rows[r][bi]||'').toString().trim(); updates.push({row:r+1,name:name.slice(0,50),cur}); } }
console.log(`${APPLY?'APPLY':'DRY-RUN'} — Skinfood rows: ${updates.length}`)
updates.forEach(u=>console.log(`  row ${u.row}: "${u.name}" | Бренд was "${u.cur}" -> "Skinfood"`))
const colE = 'E'
if (APPLY && updates.length){
  const resp = await sheets.spreadsheets.values.batchUpdate({ spreadsheetId, requestBody: { valueInputOption:'RAW', data: updates.map(u=>({range:`Загальний!${colE}${u.row}`, values:[['Skinfood']]})) } })
  console.log('✅ updated cells:', resp.data.totalUpdatedCells)
}
