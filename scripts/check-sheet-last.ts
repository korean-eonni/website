import { google } from 'googleapis'
async function main() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
  const sheets = google.sheets({ version: 'v4', auth })
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: 'Загальний!A:I',
  })
  const rows = r.data.values || []
  console.log('Total rows:', rows.length)
  console.log('Last row:')
  const last = rows[rows.length - 1]
  console.log('  A (Назва):', last[0])
  console.log('  E (Бренд):', last[4])
  console.log('  I (Ціна):', last[8])
}
main().catch(e => { console.error(e); process.exit(1) })
