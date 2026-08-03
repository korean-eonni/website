import { google } from 'googleapis'
import { Readable } from 'stream'
import fs from 'fs'

async function main() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
  const drive = google.drive({ version: 'v3', auth })
  const FOLDER = process.env.GOOGLE_DRIVE_PHOTOS_FOLDER_ID!
  
  const buffer = fs.readFileSync('/tmp/test-product.png')
  console.log('Uploading test file...')
  try {
    const r = await drive.files.create({
      requestBody: {
        name: 'TEST Eonni Admin Upload_1.png',
        parents: [FOLDER],
      },
      media: { mimeType: 'image/png', body: Readable.from(buffer) },
      fields: 'id, name',
      supportsAllDrives: true,
    })
    console.log('SUCCESS', r.data)
    // Now try permissions
    try {
      const p = await drive.permissions.create({
        fileId: r.data.id!,
        requestBody: { role: 'reader', type: 'anyone' },
        supportsAllDrives: true,
      })
      console.log('Permission SUCCESS', p.data)
    } catch (pe: any) {
      console.error('Permission FAIL:', pe.message)
    }
  } catch (e: any) {
    console.error('Upload FAILED:', e.message)
    if (e.errors) console.error('Details:', JSON.stringify(e.errors))
  }
}
main().catch(e => { console.error(e); process.exit(1) })
