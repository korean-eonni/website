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
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
  ],
})

// --- read sheet names ---
const sheets = google.sheets({ version: 'v4', auth })
const sres = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.GOOGLE_SHEETS_ID, range: 'Загальний!A1:AQ' })
const srows = sres.data.values || []
const sheaders = (srows[0] || []).map((h) => (h || '').toString().trim())
const nameIdx = sheaders.indexOf('Назва')
const sheetNames = srows.slice(1).map((r) => (r[nameIdx] || '').toString().trim()).filter(Boolean)

// --- read drive files ---
const drive = google.drive({ version: 'v3', auth })
let files = []
let pageToken
do {
  const res = await drive.files.list({
    q: `'${process.env.GOOGLE_DRIVE_PHOTOS_FOLDER_ID}' in parents and trashed = false`,
    fields: 'nextPageToken, files(id,name,mimeType)', pageSize: 1000, pageToken,
  })
  files = files.concat(res.data.files || [])
  pageToken = res.data.nextPageToken
} while (pageToken)

// strip extension + trailing " (N)" → product base name
function baseName(fn) {
  let s = fn.replace(/\.[a-z0-9]+$/i, '')      // extension
  s = s.replace(/\s*\(\d+\)\s*$/, '')           // (1), (2)
  return s.trim()
}
function key(s) { return s.toLowerCase().replace(/\s+/g, ' ').trim() }

const driveProducts = new Set()
for (const f of files) if ((f.mimeType || '').startsWith('image/')) driveProducts.add(baseName(f.name))

const sheetKeys = new Set(sheetNames.map(key))
const driveList = [...driveProducts]

const onDriveNotInSheet = driveList.filter((d) => !sheetKeys.has(key(d)))
const matched = driveList.filter((d) => sheetKeys.has(key(d)))

console.log('Sheet products:', sheetNames.length)
console.log('Distinct products on Drive (by filename):', driveList.length)
console.log('Drive products MATCHED to sheet (exact, normalized):', matched.length)
console.log('Drive products NOT in sheet (exact match):', onDriveNotInSheet.length)

// brand split for the missing ones (brand = text before first comma)
const byBrand = {}
for (const d of onDriveNotInSheet) {
  const brand = d.split(',')[0].trim()
  byBrand[brand] = (byBrand[brand] || 0) + 1
}
console.log('\n=== Missing-from-sheet products by brand (approx) ===')
for (const [k, v] of Object.entries(byBrand).sort((a, b) => b[1] - a[1])) console.log(String(v).padStart(4), k)

console.log('\n=== First 40 products that are on Drive but NOT in the sheet ===')
onDriveNotInSheet.slice(0, 40).forEach((d) => console.log(' -', d.slice(0, 90)))
