import { google } from 'googleapis'
import { put } from '@vercel/blob'
import { randomUUID } from 'crypto'
import { replaceAllProducts } from '@/lib/productStore'

// Sheet "Загальний" - columns A through AD (30 columns for Фото 1-10)
const SHEET_RANGE = 'Загальний!A1:AD'

// Column indices based on actual Google Sheet structure (0-indexed)
// A=0: Назва, B=1: Постачальник, C=2: Категорія, D=3: Субкатегорія, E=4: Бренд
// F=5: SKU, G=6: Штрихкод, H=7: Собівартість, I=8: Ціна продажу, J=9: Стара ціна
// K=10: Знижка, L=11: Кількість на складі, M=12: Вага, N=13: Теги
// O=14: Короткий опис, P=15: Довгий опис, Q=16: Активний товар
// R=17: Позначити як новинку, S=18: Позначити як ексклюзив
// T=19: Фото 1, U=20: Фото 2, V=21: Фото 3, W=22: Фото 4, X=23: Фото 5
// Y=24: Фото 6, Z=25: Фото 7, AA=26: Фото 8, AB=27: Фото 9, AC=28: Фото 10

type SheetRow = {
  Назва: string
  Постачальник?: string
  Категорія?: string
  Субкатегорія?: string
  Бренд?: string
  SKU?: string
  Штрихкод?: string
  'Собівартість (₴)'?: string
  'Ціна продажу (₴)'?: string
  'Стара ціна (₴)'?: string
  'Знижка (₴)'?: string
  'Кількість на складі'?: string
  'Вага (г)'?: string
  'Теги (через кому)'?: string
  'Короткий опис'?: string
  'Довгий опис'?: string
  'Активний товар'?: string
  'Позначити як новинку'?: string
  'Позначити як ексклюзив'?: string
  'Фото 1'?: string
  'Фото 2'?: string
  'Фото 3'?: string
  'Фото 4'?: string
  'Фото 5'?: string
  'Фото 6'?: string
  'Фото 7'?: string
  'Фото 8'?: string
  'Фото 9'?: string
  'Фото 10'?: string
}

function parseBool(input?: string) {
  if (!input) return 0
  const value = input.trim().toLowerCase()
  return ['1', 'true', 'так', 'yes', 'y', 'on', '+'].includes(value) ? 1 : 0
}

function parseNumber(input?: string) {
  if (!input) return null
  // Remove currency symbols, spaces, and handle Ukrainian number format
  const cleaned = input
    .replace(/[₴грн\s]/gi, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.-]/g, '')
    .trim()
  if (!cleaned) return null
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : null
}

function slugFromName(name: string, index: number) {
  const base = name
    .toLowerCase()
    .replace(/[^a-zа-яёіїєґ0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return base ? `${base}-${index}` : randomUUID()
}

/**
 * Extract Google Drive file ID from various URL formats
 */
function extractDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null
  
  const trimmed = url.trim()
  if (!trimmed) return null

  // Pattern 1: /file/d/FILE_ID/view or /file/d/FILE_ID
  const filePattern = /\/file\/d\/([a-zA-Z0-9_-]+)/
  const fileMatch = trimmed.match(filePattern)
  if (fileMatch?.[1]) return fileMatch[1]

  // Pattern 2: ?id=FILE_ID or &id=FILE_ID
  const idPattern = /[?&]id=([a-zA-Z0-9_-]+)/
  const idMatch = trimmed.match(idPattern)
  if (idMatch?.[1]) return idMatch[1]

  // Pattern 3: open?id=FILE_ID
  const openPattern = /open\?id=([a-zA-Z0-9_-]+)/
  const openMatch = trimmed.match(openPattern)
  if (openMatch?.[1]) return openMatch[1]

  return null
}

/**
 * Download image from Google Drive using service account authentication
 * This is more reliable than public download links
 */
async function downloadDriveImage(
  fileId: string,
  auth: any
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const drive = google.drive({ version: 'v3', auth })
    
    // Get file metadata to check if it's accessible
    const metadata = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,size',
    })

    if (!metadata.data.mimeType?.startsWith('image/')) {
      console.warn(`File ${fileId} is not an image: ${metadata.data.mimeType}`)
      return null
    }

    // Download the file content
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    )

    return {
      buffer: Buffer.from(response.data as ArrayBuffer),
      contentType: metadata.data.mimeType || 'image/jpeg',
    }
  } catch (error: any) {
    // Log specific error for debugging
    const errorMsg = error?.errors?.[0]?.message || error?.message || 'Unknown error'
    console.error(`Failed to download Drive file ${fileId}: ${errorMsg}`)
    return null
  }
}

/**
 * Upload image to Vercel Blob storage
 */
async function uploadImageToBlob(
  buffer: Buffer,
  contentType: string,
  key: string
): Promise<string | null> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  if (!blobToken) {
    console.warn('BLOB_READ_WRITE_TOKEN not set, skipping image upload')
    return null
  }

  try {
    const ext = contentType.split('/')[1]?.split(';')[0] || 'jpg'
    const blobKey = `products/${key}.${ext}`
    
    const uploaded = await put(blobKey, buffer, {
      access: 'public',
      token: blobToken,
      contentType,
    })
    
    return uploaded.url
  } catch (error: any) {
    console.error(`Failed to upload to Blob: ${error.message}`)
    return null
  }
}

/**
 * Process and upload an image from Google Drive link
 */
async function processImage(
  driveUrl: string,
  productId: string,
  photoIndex: number,
  auth: any
): Promise<string | null> {
  const fileId = extractDriveFileId(driveUrl)
  if (!fileId) {
    console.warn(`Invalid Drive URL: ${driveUrl}`)
    return null
  }

  // Download from Google Drive
  const imageData = await downloadDriveImage(fileId, auth)
  if (!imageData) return null

  // Upload to Vercel Blob
  const key = `${productId}-${photoIndex}-${Date.now()}`
  return uploadImageToBlob(imageData.buffer, imageData.contentType, key)
}

/**
 * Normalize PEM private key from environment variable
 * Handles various formats: JSON escaped, base64, literal newlines, etc.
 * 
 * The key should look like:
 * -----BEGIN PRIVATE KEY-----
 * MIIEvgIBADANBgkqhkiG9w0BAQE...
 * -----END PRIVATE KEY-----
 */
function normalizePrivateKey(key: string): string {
  let normalized = key
  
  // Step 1: Remove surrounding whitespace and quotes
  normalized = normalized.trim()
  if ((normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'"))) {
    normalized = normalized.slice(1, -1)
  }
  
  // Step 2: Replace ALL literal \n with actual newlines
  // Use a loop to handle multiple passes if needed
  let prevLength = 0
  while (normalized.length !== prevLength) {
    prevLength = normalized.length
    normalized = normalized.replace(/\\n/g, '\n')
  }
  
  // Step 3: Remove \r characters
  normalized = normalized.replace(/\\r/g, '').replace(/\r/g, '')
  
  // Step 4: Handle URL-encoded newlines
  if (normalized.includes('%0A')) {
    normalized = decodeURIComponent(normalized)
  }
  
  // Step 5: Clean up any double newlines or trailing newlines in the middle
  normalized = normalized.replace(/\n+/g, '\n').trim()
  
  // Step 6: Reconstruct the key if it's malformed
  // Extract the base64 content and rebuild with proper formatting
  const beginMatch = normalized.match(/-----BEGIN ([A-Z ]+)-----/)
  const endMatch = normalized.match(/-----END ([A-Z ]+)-----/)
  
  if (beginMatch && endMatch) {
    const keyType = beginMatch[1]
    const header = `-----BEGIN ${keyType}-----`
    const footer = `-----END ${keyType}-----`
    
    // Extract everything between header and footer
    const startIdx = normalized.indexOf(header) + header.length
    const endIdx = normalized.indexOf(footer)
    let body = normalized.substring(startIdx, endIdx)
    
    // Remove all whitespace from body
    body = body.replace(/\s+/g, '')
    
    // Validate body is base64
    if (!/^[A-Za-z0-9+/=]+$/.test(body)) {
      throw new Error('Invalid private key: body contains non-base64 characters')
    }
    
    // Rebuild with proper 64-char line breaks
    const lines: string[] = []
    for (let i = 0; i < body.length; i += 64) {
      lines.push(body.substring(i, i + 64))
    }
    
    normalized = [header, ...lines, footer].join('\n')
  }
  
  // Step 7: Final validation
  if (!normalized.includes('-----BEGIN')) {
    throw new Error(`Invalid private key format: missing BEGIN marker`)
  }
  if (!normalized.includes('-----END')) {
    throw new Error(`Invalid private key format: missing END marker`)
  }
  
  // Count lines - a valid RSA/PKCS8 private key should have 25+ lines
  const lineCount = normalized.split('\n').length
  if (lineCount < 10) {
    throw new Error(`Invalid private key: only ${lineCount} lines (expected 25+)`)
  }
  
  return normalized
}

/**
 * Create Google Auth client
 */
function createAuthClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  
  if (!clientEmail) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL environment variable')
  }
  if (!privateKey) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_KEY environment variable')
  }

  let normalizedKey: string
  try {
    normalizedKey = normalizePrivateKey(privateKey)
  } catch (e: any) {
    throw new Error(`Failed to normalize private key: ${e.message}`)
  }
  
  // Debug: log key info (safe preview only)
  const hasBegin = normalizedKey.includes('-----BEGIN PRIVATE KEY-----')
  const hasRSABegin = normalizedKey.includes('-----BEGIN RSA PRIVATE KEY-----')
  const lineCount = normalizedKey.split('\n').length
  console.log(`[auth] Key info: lines=${lineCount}, hasPKCS8=${hasBegin}, hasRSA=${hasRSABegin}`)
  console.log(`[auth] Email: ${clientEmail}`)

  try {
    return new google.auth.JWT({
      email: clientEmail,
      key: normalizedKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly',
      ],
    })
  } catch (e: any) {
    throw new Error(`Failed to create JWT auth: ${e.message}`)
  }
}

/**
 * Fetch rows from Google Sheet
 */
async function fetchSheetRows(auth: any): Promise<SheetRow[]> {
  const sheetId = process.env.GOOGLE_SHEETS_ID
  if (!sheetId) {
    throw new Error('Missing GOOGLE_SHEETS_ID environment variable')
  }

  const sheets = google.sheets({ version: 'v4', auth })
  
  let response
  try {
    response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: SHEET_RANGE,
    })
  } catch (err: any) {
    const msg = err?.errors?.[0]?.message || err?.message || 'Sheets API error'
    throw new Error(`Failed to fetch sheet data: ${msg}`)
  }

  const rows = response.data.values
  if (!rows || rows.length < 2) {
    console.log('Sheet is empty or has only headers')
    return []
  }

  // First row is headers
  const headers = rows[0] as string[]
  console.log(`Sheet headers: ${headers.join(', ')}`)
  
  // Map remaining rows to objects
  return rows.slice(1).map((row) => {
    const entry: Record<string, string> = {}
    headers.forEach((header, idx) => {
      if (header && header.trim()) {
        entry[header.trim()] = (row[idx] ?? '').toString().trim()
      }
    })
    return entry as SheetRow
  })
}

/**
 * Main sync function - fetches from Google Sheet and updates database
 */
export async function syncSheetToDatabase() {
  console.log('Starting Google Sheet sync...')
  const startTime = Date.now()
  
  // Create auth client (used for both Sheets and Drive)
  const auth = createAuthClient()
  
  // Fetch sheet data
  const sheetRows = await fetchSheetRows(auth)
  console.log(`Fetched ${sheetRows.length} rows from sheet`)
  
  if (sheetRows.length === 0) {
    return { imported: 0, skipped: 0, errors: 0 }
  }

  const products = []
  let skipped = 0
  let errors = 0

  for (let i = 0; i < sheetRows.length; i++) {
    const row = sheetRows[i]
    const rowNum = i + 2 // Account for header row and 0-indexing
    
    try {
      const name = row.Назва?.trim()
      if (!name) {
        console.log(`Row ${rowNum}: Skipping - no name`)
        skipped++
        continue
      }

      // Generate unique ID from SKU, barcode, or name
      const sku = row.SKU?.trim()
      const barcode = row.Штрихкод?.trim()
      const id = (sku || barcode || slugFromName(name, i)).toLowerCase().replace(/\s+/g, '-')

      // Parse prices
      const salePrice = parseNumber(row['Ціна продажу (₴)'])
      const originalPrice = parseNumber(row['Стара ціна (₴)'])
      const discountAmount = parseNumber(row['Знижка (₴)']) ??
        (originalPrice && salePrice && originalPrice > salePrice
          ? Math.round(originalPrice - salePrice)
          : null)

      // Process first available photo
      let imageUrl: string | null = null
      const photoFields = ['Фото 1', 'Фото 2', 'Фото 3', 'Фото 4', 'Фото 5'] as const
      
      for (let photoIdx = 0; photoIdx < photoFields.length; photoIdx++) {
        const photoField = photoFields[photoIdx]
        const photoUrl = row[photoField]
        if (photoUrl && photoUrl.includes('drive.google.com')) {
          imageUrl = await processImage(photoUrl, id, photoIdx + 1, auth)
          if (imageUrl) {
            console.log(`Row ${rowNum}: Uploaded image from ${photoField}`)
            break // Use first successful image
          }
        }
      }

      const now = new Date().toISOString()

      products.push({
        id,
        name,
        image_url: imageUrl,
        image_path: null,
        short_description: row['Короткий опис']?.trim() || null,
        long_description: row['Довгий опис']?.trim() || null,
        supplier: row.Постачальник?.trim() || null,
        cost_price: parseNumber(row['Собівартість (₴)']),
        sale_price: salePrice,
        original_price: originalPrice,
        discount_amount: discountAmount,
        stock_quantity: parseNumber(row['Кількість на складі']) ?? 0,
        category: row.Категорія?.trim() || null,
        subcategory: row.Субкатегорія?.trim() || null,
        weight_grams: parseNumber(row['Вага (г)']),
        tags: row['Теги (через кому)']?.trim() || null,
        sku: sku || null,
        barcode: barcode || null,
        brand: row.Бренд?.trim() || null,
        // ALWAYS set to active (1) - we want all imported products to be visible
        // The sheet doesn't have this column filled, so we default to active
        is_active: 1,
        is_new: parseBool(row['Позначити як новинку']),
        is_exclusive: parseBool(row['Позначити як ексклюзив']),
        created_at: now,
        updated_at: now,
      })

      console.log(`Row ${rowNum}: Processed "${name}" (${id})`)
    } catch (err: any) {
      console.error(`Row ${rowNum}: Error - ${err.message}`)
      errors++
    }
  }

  // Replace ALL products in database with sheet data
  // This ensures the database is always in sync with the Google Sheet
  if (products.length > 0) {
    await replaceAllProducts(products)
    console.log(`Replaced all products with ${products.length} from sheet`)
  }

  const duration = Date.now() - startTime
  console.log(`Sync completed in ${duration}ms: ${products.length} imported, ${skipped} skipped, ${errors} errors`)

  return {
    imported: products.length,
    skipped,
    errors,
    duration,
  }
}
