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

async function listAll(q, fields = 'nextPageToken, files(id,name,mimeType,parents)') {
  let items = [], pageToken
  do {
    const res = await drive.files.list({ q, fields, pageSize: 1000, pageToken, supportsAllDrives: true, includeItemsFromAllDrives: true })
    items = items.concat(res.data.files || [])
    pageToken = res.data.nextPageToken
  } while (pageToken)
  return items
}

const photosFolderId = process.env.GOOGLE_DRIVE_PHOTOS_FOLDER_ID
console.log('Configured photos folder id:', photosFolderId)

// 1. Parent(s) of the photos folder
try {
  const meta = await drive.files.get({ fileId: photosFolderId, fields: 'id,name,parents', supportsAllDrives: true })
  console.log('Photos folder name:', JSON.stringify(meta.data.name), '| parents:', meta.data.parents)
  if (meta.data.parents) {
    for (const pid of meta.data.parents) {
      const pmeta = await drive.files.get({ fileId: pid, fields: 'id,name,parents', supportsAllDrives: true })
      console.log('  Parent folder:', JSON.stringify(pmeta.data.name), '(', pid, ')')
      const siblings = await listAll(`'${pid}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`)
      console.log('  Sibling subfolders under parent:', siblings.length)
      siblings.forEach((s) => console.log('     •', s.name, '(', s.id, ')'))
    }
  }
} catch (e) {
  console.log('Could not read photos folder parent:', e.message)
}

// 2. ALL folders visible to the service account
console.log('\n=== ALL folders visible to service account ===')
const allFolders = await listAll(`mimeType='application/vnd.google-apps.folder' and trashed=false`)
console.log('Total folders visible:', allFolders.length)
allFolders.forEach((f) => console.log(' •', JSON.stringify(f.name), '| id:', f.id, '| parents:', (f.parents || []).join(',')))
