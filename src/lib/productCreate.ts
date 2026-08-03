/**
 * Helpers used by the admin "Add product" flow:
 *
 *   1. uploadImagesToDrive — uploads files to the configured Drive folder as
 *      the OAuth-linked user (admin), because service accounts in personal
 *      Google projects have NO storage quota and can't own files.
 *      Naming pattern: "<Product Name>_<index>.<ext>".
 *
 *   2. appendProductToSheet — writes a new row to the `Загальний` sheet using
 *      the service account (Sheets API doesn't need storage quota).
 *
 * Required env vars:
 *   • GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_KEY (Sheet append)
 *   • GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET (Drive upload via user)
 *   • GOOGLE_SHEETS_ID, GOOGLE_DRIVE_PHOTOS_FOLDER_ID
 *
 * Before the first upload the admin must visit `/api/admin/oauth/start` to
 * link their Google account — this stores a refresh token in Postgres.
 */
import { google } from 'googleapis'
import { Readable } from 'stream'
import {
  getGoogleTokens,
  updateGoogleAccessToken,
} from '@/lib/oauthStore'

const SHEET_NAME = 'Загальний'
const TOTAL_COLUMNS = 43

export type NewProductInput = {
  name: string
  supplier?: string | null
  category?: string | null
  subcategory?: string | null
  brand?: string | null
  sku?: string | null
  weight_grams?: number | null
  cost_price?: number | null
  sale_price?: number | null
  original_price?: number | null
  discount_amount?: number | null
  tags?: string | null
  short_description?: string | null
  long_description?: string | null
  usage_instructions?: string | null
  clinical_proof?: string | null
  solves_problems?: string | null
  key_ingredients?: string | null
  fit_skin?: string | null
  compatibility?: string | null
  is_active?: boolean
  is_new?: boolean
  is_exclusive?: boolean
  photoUrls: (string | null)[]
  volume_options?: string | null
  rating?: number | null
  review_count?: number | null
  age_group?: string | null
  ingredients?: string | null
  skin_type?: string | null
  series?: string | null
  classification?: string | null
}

function normalizeKey(rawKey: string): string {
  return rawKey.includes('-----BEGIN') ? rawKey.replace(/\\n/g, '\n') : rawKey
}

function getServiceAccountAuth(scopes: string[]) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!email || !rawKey) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_KEY env var is missing'
    )
  }
  return new google.auth.JWT({ email, key: normalizeKey(rawKey), scopes })
}

/**
 * Refresh and return a valid Google access token using the stored refresh
 * token. Caches the access token in the DB so we don't refresh on every call.
 */
async function getOAuthAccessToken(): Promise<string> {
  const tokens = await getGoogleTokens()
  if (!tokens) {
    throw new Error(
      'Google Drive is not connected — visit /api/admin/oauth/start as admin to link an account'
    )
  }

  // Use cached access token if it's still valid for at least 60 more seconds.
  if (
    tokens.access_token &&
    tokens.access_token_expires_at &&
    tokens.access_token_expires_at.getTime() - Date.now() > 60_000
  ) {
    return tokens.access_token
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID/SECRET env vars missing')
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OAuth token refresh failed: ${res.status} ${text}`)
  }
  const body = (await res.json()) as { access_token: string; expires_in: number }
  const expiresAt = new Date(Date.now() + (body.expires_in - 60) * 1000)
  await updateGoogleAccessToken(body.access_token, expiresAt)
  return body.access_token
}

function safeFileName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
}

function extFromMime(mime: string): string {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg'
  return 'jpg'
}

async function uploadOneImageToDrive(
  drive: ReturnType<typeof google.drive>,
  folderId: string,
  file: File,
  productName: string,
  index: number
): Promise<string> {
  const ext = extFromMime(file.type)
  const fileName = `${safeFileName(productName)}_${index}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const body = Readable.from(buffer)

  const created = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId] },
    media: { mimeType: file.type, body },
    fields: 'id, name',
    supportsAllDrives: true,
  })

  const fileId = created.data.id
  if (!fileId) throw new Error('drive-create-no-id')

  // The storefront loads images via the public file URL, so the file MUST be
  // anyone-with-link readable. Retry once on transient failure; if it still
  // fails, surface the error rather than leaving a private file that renders
  // as a broken (403) image on the site.
  let permsOk = false
  for (let attempt = 0; attempt < 2 && !permsOk; attempt++) {
    try {
      await drive.permissions.create({
        fileId,
        requestBody: { role: 'reader', type: 'anyone' },
        supportsAllDrives: true,
      })
      permsOk = true
    } catch (e) {
      console.warn(
        `[productCreate] permissions.create attempt ${attempt + 1} failed:`,
        (e as Error).message
      )
    }
  }
  if (!permsOk) {
    throw new Error(
      `drive-permission-failed: uploaded ${fileName} but could not make it public`
    )
  }

  return `https://drive.google.com/file/d/${fileId}/view`
}

export async function uploadImagesToDrive(
  files: File[],
  productName: string
): Promise<string[]> {
  const folderId = process.env.GOOGLE_DRIVE_PHOTOS_FOLDER_ID
  if (!folderId) {
    throw new Error(
      'GOOGLE_DRIVE_PHOTOS_FOLDER_ID env var is not set — admin uploads cannot reach Drive'
    )
  }

  // Use a fresh OAuth access token (mint via refresh token).
  const accessToken = await getOAuthAccessToken()
  const oauthClient = new google.auth.OAuth2()
  oauthClient.setCredentials({ access_token: accessToken })
  const drive = google.drive({ version: 'v3', auth: oauthClient })

  const urls: string[] = []
  for (let i = 0; i < files.length; i++) {
    const url = await uploadOneImageToDrive(drive, folderId, files[i], productName, i + 1)
    urls.push(url)
  }
  return urls
}

export async function appendProductToSheet(input: NewProductInput): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID
  if (!spreadsheetId) throw new Error('GOOGLE_SHEETS_ID env var is missing')
  const auth = getServiceAccountAuth([
    'https://www.googleapis.com/auth/spreadsheets',
  ])
  const sheets = google.sheets({ version: 'v4', auth })

  const yesNo = (b: boolean | undefined): string => (b ? 'Так' : 'Ні')
  const num = (n: number | null | undefined): string =>
    n == null || !Number.isFinite(n) ? '' : String(n)
  const text = (s: string | null | undefined): string => (s ?? '').toString()
  const photo = (i: number): string => text(input.photoUrls?.[i] ?? '')

  const row: (string | number)[] = new Array(TOTAL_COLUMNS).fill('')
  row[0] = text(input.name)
  row[1] = text(input.supplier)
  row[2] = text(input.category)
  row[3] = text(input.subcategory)
  row[4] = text(input.brand)
  row[5] = text(input.sku)
  row[6] = num(input.weight_grams)
  row[7] = num(input.cost_price)
  row[8] = num(input.sale_price)
  row[9] = num(input.original_price)
  row[10] = num(input.discount_amount)
  row[11] = text(input.tags)
  row[12] = text(input.short_description)
  row[13] = text(input.long_description)
  row[14] = text(input.usage_instructions)
  row[15] = text(input.clinical_proof)
  row[16] = text(input.solves_problems)
  row[17] = text(input.key_ingredients)
  row[18] = text(input.fit_skin)
  row[19] = text(input.compatibility)
  row[20] = yesNo(input.is_active ?? true)
  row[21] = yesNo(input.is_new)
  row[22] = yesNo(input.is_exclusive)
  for (let i = 0; i < 10; i++) row[23 + i] = photo(i)
  row[35] = text(input.volume_options)
  row[36] = num(input.rating)
  row[37] = num(input.review_count)
  row[38] = text(input.age_group)
  row[39] = text(input.ingredients)
  row[40] = text(input.skin_type)
  row[41] = text(input.series)
  row[42] = text(input.classification)

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:AQ`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  })
}

/** Returns the linked Drive account email, or null if not yet connected. */
export async function getLinkedDriveAccount(): Promise<string | null> {
  const tokens = await getGoogleTokens()
  return tokens?.account_email ?? null
}
