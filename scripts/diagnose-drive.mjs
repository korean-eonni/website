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
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
})
const drive = google.drive({ version: 'v3', auth })
const folderId = process.env.GOOGLE_DRIVE_PHOTOS_FOLDER_ID
console.log('Photos folder id:', folderId)

async function listAll(q) {
  let items = []
  let pageToken
  do {
    const res = await drive.files.list({
      q,
      fields: 'nextPageToken, files(id,name,mimeType)',
      pageSize: 1000,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })
    items = items.concat(res.data.files || [])
    pageToken = res.data.nextPageToken
  } while (pageToken)
  return items
}

const children = await listAll(`'${folderId}' in parents and trashed = false`)
const folders = children.filter((f) => f.mimeType === 'application/vnd.google-apps.folder')
const images = children.filter((f) => (f.mimeType || '').startsWith('image/'))
console.log('Direct children:', children.length, '| subfolders:', folders.length, '| images:', images.length)

if (folders.length > 0) {
  console.log('\n=== Sample subfolders (likely 1 per product) — first 30 ===')
  folders.slice(0, 30).forEach((f) => console.log(' -', f.name))
  console.log(`\nTOTAL product subfolders on Drive: ${folders.length}`)
} else {
  console.log('\n=== Sample image files — first 30 ===')
  images.slice(0, 30).forEach((f) => console.log(' -', f.name))
}
