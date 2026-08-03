import { google } from 'googleapis'
async function main() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
  const drive = google.drive({ version: 'v3', auth })
  const fileId = '1S1jpGJKlqYFJ5c1g-JvBU5Q_PBe5WXL-'
  try {
    const r = await drive.files.get({
      fileId,
      fields: 'id, name, parents, owners, mimeType, createdTime, webViewLink',
      supportsAllDrives: true,
    })
    console.log('FILE FOUND:')
    console.log('  Name:', r.data.name)
    console.log('  Owners:', JSON.stringify(r.data.owners?.map(o => o.emailAddress)))
    console.log('  Parents:', r.data.parents)
    console.log('  Created:', r.data.createdTime)
    console.log('  Web link:', r.data.webViewLink)
  } catch (e: any) {
    console.error('Error:', e.message)
  }
}
main().catch(e => { console.error(e); process.exit(1) })
