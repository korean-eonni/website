import { google } from 'googleapis'

async function main() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
  const drive = google.drive({ version: 'v3', auth })
  const FOLDER = '1l0OnOXF3O8W1mGzg0vNz_aY50IH3rrXc'
  
  try {
    const meta = await drive.files.get({
      fileId: FOLDER, fields: 'id, name, mimeType, owners',
      supportsAllDrives: true,
    })
    console.log('Folder:', meta.data.name, '(mime:', meta.data.mimeType, ')')
  } catch (e: any) {
    console.error('Folder access error:', e.message)
    console.error('Service account may need access to the folder')
    return
  }
  
  const list = await drive.files.list({
    q: `'${FOLDER}' in parents and trashed=false`,
    fields: 'files(id, name, mimeType, modifiedTime)',
    pageSize: 30,
    orderBy: 'name',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })
  console.log(`\nFound ${list.data.files?.length || 0} files (first 30):\n`)
  list.data.files?.forEach(f => console.log(`  ${f.name}`))
}
main().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
