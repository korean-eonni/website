import { google } from 'googleapis'
async function main() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
  const sheets = google.sheets({ version: 'v4', auth })
  const headerR = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!, range: 'Загальний!1:1',
  })
  const dataR = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!, range: 'Загальний!A:AQ',
  })
  const headers = headerR.data.values?.[0] || []
  const rows = dataR.data.values || []
  const last = rows[rows.length - 1]
  console.log('Last row vs headers (only non-empty cells):')
  for (let i = 0; i < headers.length; i++) {
    const val = (last[i] ?? '').toString()
    if (val.trim()) {
      const col = i < 26 ? String.fromCharCode(65+i) : 'A'+String.fromCharCode(65+i-26)
      console.log(`  ${col.padEnd(3)} "${headers[i]}" = "${val.slice(0,55)}"`)
    }
  }
}
main().catch(e => { console.error(e.message); process.exit(1) })
