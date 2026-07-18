import { google } from 'googleapis'
import { put } from '@vercel/blob'
import { randomUUID } from 'crypto'
import { replaceAllProducts } from '@/lib/productStore'

// Read through AS so newly added operational/catalogue columns are included.
// Mapping below is header-name driven, so physical column reordering is safe.
const SHEET_RANGE = 'Загальний!A1:AS'

// Column layout (0-indexed). Code reads by HEADER NAME — these comments are just for reference.
// A=0:  Назва                F=5:  SKU                       L=11: Теги
// B=1:  Постачальник         G=6:  Вага                      M=12: Короткий опис
// C=2:  Категорія            H=7:  Собівартість (₴)          N=13: Довгий опис (intro paragraph only)
// D=3:  Субкатегорія         I=8:  Ціна продажу (₴)          O=14: Спосіб застосування  ← NEW
// E=4:  Бренд                J=9:  Стара ціна (₴)            P=15: Клінічно підтверджено ← NEW
//                            K=10: Знижка (₴)                Q=16: Які проблеми вирішує  ← NEW
//                                                            R=17: Ключові інгредієнти   ← NEW
//                                                            S=18: Для якої шкіри підходить ← NEW
//                                                            T=19: Сумісність з іншими компонентами ← NEW
// U=20: Активний товар       X=23: Фото 1   AD=29: Фото 7    AJ=35: Об'єм/Варіанти
// V=21: Позначити як новинку Y=24: Фото 2   AE=30: Фото 8    AK=36: Рейтинг
// W=22: Позначити як ексклюзив Z=25: Фото 3 AF=31: Фото 9    AL=37: Кількість відгуків
//                            AA=26: Фото 4  AG=32: Фото 10   AM=38: Вік
//                            AB=27: Фото 5  AH=33: (empty Фото 11 placeholder) AN=39: Інгредієнти
//                            AC=28: Фото 6  AI=34: (empty Фото 12 placeholder) AO=40: Тип шкіри
//                                                                              AP=41: Серія
//                                                                              AQ=42: Класифікація

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
  'Кількість'?: string            // stock quantity (actual sheet header)
  'Кількість на складі'?: string  // legacy header name
  'Вага'?: string
  'Вага (г)'?: string
  'Теги (через кому)'?: string
  'Короткий опис'?: string
  'Довгий опис'?: string
  // Long-description sections (NEW, split out 2026-05-06)
  'Спосіб застосування'?: string
  'Клінічно підтверджено'?: string
  'Які проблеми вирішує'?: string
  'Ключові інгредієнти'?: string
  'Для якої шкіри підходить'?: string
  'Сумісність та застереження'?: string
  'Сумісність з іншими компонентами'?: string // legacy header name
  'Активний товар'?: string
  'Позначити як новинку'?: string
  'Позначити як ексклюзив'?: string
  'Скоро в наявності'?: string
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
  'Фото 11'?: string
  'Фото 12'?: string
  // New fields for product page
  "Об'єм/Варіанти"?: string  // e.g., "20 мл,40 мл,80 мл"
  'Рейтинг'?: string         // e.g., "4.5"
  'Кількість відгуків'?: string // e.g., "12"
  // Extended product attributes
  'Вік'?: string             // e.g., "18+", "25+", "Всі віки"
  'Інгредієнти'?: string     // Key ingredients
  'Тип шкіри'?: string       // e.g., "Всі типи", "Жирна", "Суха"
  'Тип шкіри '?: string      // header has trailing space in some sheets
  'Серія'?: string           // Product series/line
  'Класифікація'?: string    // e.g., "Натуральна", "Професійна"
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
 * Download image from Google Drive
 * First tries the Drive API (for private files), then falls back to public URL
 */
async function downloadDriveImage(
  fileId: string,
  auth: any
): Promise<{ buffer: Buffer; contentType: string } | null> {
  // Method 1: Try Drive API first (works for files shared with service account)
  try {
    const drive = google.drive({ version: 'v3', auth })
    
    // Get file metadata
    const metadata = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,size',
    })

    if (!metadata.data.mimeType?.startsWith('image/')) {
      console.warn(`[image] File ${fileId} is not an image: ${metadata.data.mimeType}`)
      return null
    }

    // Download the file content
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    )

    console.log(`[image] Downloaded via Drive API: ${fileId}`)
    return {
      buffer: Buffer.from(response.data as ArrayBuffer),
      contentType: metadata.data.mimeType || 'image/jpeg',
    }
  } catch (driveError: any) {
    console.warn(`[image] Drive API failed for ${fileId}: ${driveError.message}`)
  }

  // Method 2: Try public download URL (works for publicly shared files)
  try {
    const publicUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
    const response = await fetch(publicUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EonniBot/1.0)',
      },
    })

    if (!response.ok) {
      console.warn(`[image] Public URL failed for ${fileId}: ${response.status}`)
      return null
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      // Might be a Google warning page, not the actual image
      console.warn(`[image] Public URL returned non-image: ${contentType}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log(`[image] Downloaded via public URL: ${fileId}`)
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType,
    }
  } catch (fetchError: any) {
    console.error(`[image] All methods failed for ${fileId}: ${fetchError.message}`)
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
  // Don't log service-account email — it leaks into Vercel logs which may be
  // shared. Gate verbose auth diagnostics behind an explicit debug flag.
  if (process.env.DEBUG_SHEET_SYNC === '1') {
    console.log(`[auth] Key info: lines=${lineCount}, hasPKCS8=${hasBegin}, hasRSA=${hasRSABegin}`)
  }

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

      // Helper function to get a directly-loadable thumbnail URL from a photo field.
      // We use lh3.googleusercontent.com because drive.google.com/thumbnail returns a 302
      // redirect that Next.js's image optimizer rejects with 400.
      const getDriveThumbnail = (photoUrl?: string): string | null => {
        if (!photoUrl || !photoUrl.includes('drive.google.com')) return null
        const fileId = extractDriveFileId(photoUrl)
        if (!fileId) return null
        return `https://lh3.googleusercontent.com/d/${fileId}=w800`
      }

      // Get all photo URLs (Фото 1-12) — dedupe by Drive file ID to handle the
      // legacy Apps Script bug that wrote the same URL into multiple slots.
      const photoSlots: (string | undefined)[] = [
        row['Фото 1'], row['Фото 2'], row['Фото 3'], row['Фото 4'],
        row['Фото 5'], row['Фото 6'], row['Фото 7'], row['Фото 8'],
        row['Фото 9'], row['Фото 10'], row['Фото 11'], row['Фото 12'],
      ]
      const seenIds = new Set<string>()
      const dedupedThumbs: (string | null)[] = photoSlots.map(slot => {
        if (!slot) return null
        const id = extractDriveFileId(slot)
        if (id) {
          if (seenIds.has(id)) return null
          seenIds.add(id)
        }
        return getDriveThumbnail(slot)
      })
      const [
        imageUrl, imageUrl2, imageUrl3, imageUrl4,
        imageUrl5, imageUrl6, imageUrl7, imageUrl8,
        imageUrl9, imageUrl10, imageUrl11, imageUrl12,
      ] = dedupedThumbs

      const imageCount = dedupedThumbs.filter(Boolean).length
      if (imageCount > 0) {
        console.log(`Row ${rowNum}: Found ${imageCount} unique images`)
      }

      const now = new Date().toISOString()

      products.push({
        id,
        name,
        image_url: imageUrl,
        image_path: null,
        image_url_2: imageUrl2,
        image_url_3: imageUrl3,
        image_url_4: imageUrl4,
        image_url_5: imageUrl5,
        image_url_6: imageUrl6,
        image_url_7: imageUrl7,
        image_url_8: imageUrl8,
        image_url_9: imageUrl9,
        image_url_10: imageUrl10,
        image_url_11: imageUrl11,
        image_url_12: imageUrl12,
        short_description: row['Короткий опис']?.trim() || null,
        // Intro paragraph only. Each rich section is stored in its own column
        // below so the product-page tabs can render them individually.
        long_description: row['Довгий опис']?.trim() || null,
        supplier: row.Постачальник?.trim() || null,
        cost_price: parseNumber(row['Собівартість (₴)']),
        sale_price: salePrice,
        original_price: originalPrice,
        discount_amount: discountAmount,
        stock_quantity: parseNumber(row['Кількість'] ?? row['Кількість на складі']) ?? 0,
        category: row.Категорія?.trim() || null,
        subcategory: row.Субкатегорія?.trim() || null,
        weight_grams: parseNumber(row['Вага (г)'] ?? row['Вага']),
        tags: row['Теги (через кому)']?.trim() || null,
        sku: sku || null,
        barcode: barcode || null,
        brand: row.Бренд?.trim() || null,
        // New fields for product page
        volume_options: row["Об'єм/Варіанти"]?.trim() || null,
        rating: parseNumber(row['Рейтинг']),
        review_count: parseNumber(row['Кількість відгуків']) ? Math.round(parseNumber(row['Кількість відгуків'])!) : null,
        // Extended product attributes
        age_group: row['Вік']?.trim() || null,
        ingredients: row['Інгредієнти']?.trim() || null,
        skin_type: (row['Тип шкіри'] ?? row['Тип шкіри '])?.trim() || null,
        series: row['Серія']?.trim() || null,
        classification: row['Класифікація']?.trim() || null,
        // Rich sections — one per product-page tab (read by exact sheet header)
        usage_instructions: row['Спосіб застосування']?.trim() || null,
        clinical_proof: row['Клінічно підтверджено']?.trim() || null,
        solves_problems: row['Які проблеми вирішує']?.trim() || null,
        key_ingredients: row['Ключові інгредієнти']?.trim() || null,
        fit_skin: row['Для якої шкіри підходить']?.trim() || null,
        compatibility: (row['Сумісність та застереження'] ?? row['Сумісність з іншими компонентами'])?.trim() || null,
        // ALWAYS set to active (1) - we want all imported products to be visible
        is_active: 1,
        is_new: parseBool(row['Позначити як новинку']),
        is_exclusive: parseBool(row['Позначити як ексклюзив']),
        coming_soon: parseBool(row['Скоро в наявності']),
        created_at: now,
        updated_at: now,
      })

      console.log(`Row ${rowNum}: Processed "${name}" (${id})`)
    } catch (err: any) {
      console.error(`Row ${rowNum}: Error - ${err.message}`)
      errors++
    }
  }

  // Sync Sheet-owned catalogue metadata while preserving DB-owned runtime
  // stock. Products absent from a fully successful import are deactivated.
  let imported = 0
  if (products.length > 0) {
    const result = await replaceAllProducts(products)
    imported = result.inserted
    errors += result.errors
    console.log(`Upserted ${result.inserted} products from sheet (${result.errors} errors)`)
  }

  const duration = Date.now() - startTime
  console.log(`Sync completed in ${duration}ms: ${imported} imported, ${skipped} skipped, ${errors} errors`)

  return {
    imported,
    skipped,
    errors,
    duration,
  }
}
