/**
 * Product gallery images — stored in our own cloud storage (Vercel Blob).
 *
 * This replaces the old Google Drive + Google Sheet pipeline. Photos live in
 * Blob under `products/<product id>/<Product name> (N).<ext>`, which keeps the
 * SAME human-readable naming convention the Drive folder used:
 *
 *     slot 1 → "Назва товару.jpg"
 *     slot 2 → "Назва товару (2).jpg"
 *     slot N → "Назва товару (N).jpg"
 *
 * Namespacing by product id keeps names readable while making collisions
 * between two products with the same name impossible.
 */
import { put, del } from '@vercel/blob'

/** DB columns holding gallery images, in display order (slot 1 … slot 12). */
export const IMAGE_COLUMNS = [
  'image_url',
  'image_url_2',
  'image_url_3',
  'image_url_4',
  'image_url_5',
  'image_url_6',
  'image_url_7',
  'image_url_8',
  'image_url_9',
  'image_url_10',
  'image_url_11',
  'image_url_12',
] as const

export type ImageColumn = (typeof IMAGE_COLUMNS)[number]

export const MAX_PRODUCT_IMAGES = IMAGE_COLUMNS.length

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
}

/** Max upload size per photo. Generous — product shots are usually < 2 MB. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

/**
 * Make a product name safe for a file name. Mirrors the old Apps Script rule:
 * slashes are not allowed, whitespace is collapsed. Everything else (commas,
 * Cyrillic, parentheses) is preserved so names stay readable.
 */
export function sanitizeForFilename(name: string): string {
  return (name || '')
    .toString()
    .replace(/[/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
}

/**
 * Build the storage key for a photo, preserving the Drive naming convention.
 * `slot` is 1-based (1 = main photo).
 */
export function buildImageKey(
  productId: string,
  productName: string,
  slot: number,
  ext: string
): string {
  const safeName = sanitizeForFilename(productName) || 'product'
  const suffix = slot > 1 ? ` (${slot})` : ''
  return `products/${productId}/${safeName}${suffix}.${ext}`
}

function extFromContentType(contentType: string | null | undefined): string | null {
  if (!contentType) return null
  const clean = contentType.split(';')[0].trim().toLowerCase()
  return ALLOWED_TYPES[clean] ?? null
}

function extFromFilename(fileName: string | null | undefined): string | null {
  if (!fileName) return null
  const m = fileName.toLowerCase().match(/\.(jpe?g|png|webp|avif|gif)$/)
  if (!m) return null
  return m[1] === 'jpeg' ? 'jpg' : m[1]
}

/**
 * Upload one photo. `slot` is the index used in the file name (1 → «Назва.jpg»,
 * 2 → «Назва (2).jpg»); use nextImageIndex() to pick a free one when adding to
 * an existing product. Accepts a browser `File` (admin upload) or a raw Buffer
 * (used by the one-time migration from Google).
 *
 * Deterministic key + overwrite, so re-uploading the same slot replaces the
 * photo instead of piling up orphans.
 */
export async function uploadProductImage(opts: {
  data: File | Buffer
  productId: string
  productName: string
  slot: number
  contentType?: string
  fileName?: string
}): Promise<string> {
  const { data, productId, productName, slot } = opts

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('blob-token-missing')
  }
  // `slot` is the file-name index, not the gallery position — it may run past
  // MAX_PRODUCT_IMAGES as photos are added and removed over time. How many
  // photos a product may show is enforced by the caller.
  if (!Number.isInteger(slot) || slot < 1 || slot > 999) {
    throw new Error('invalid-slot')
  }

  let buffer: Buffer
  let contentType: string | undefined = opts.contentType
  let fileName: string | undefined = opts.fileName

  if (typeof File !== 'undefined' && data instanceof File) {
    if (data.size > MAX_IMAGE_BYTES) throw new Error('file-too-large')
    buffer = Buffer.from(await data.arrayBuffer())
    contentType = contentType || data.type
    fileName = fileName || data.name
  } else {
    buffer = data as Buffer
    if (buffer.length > MAX_IMAGE_BYTES) throw new Error('file-too-large')
  }

  const ext = extFromContentType(contentType) || extFromFilename(fileName) || 'jpg'
  const resolvedType =
    Object.entries(ALLOWED_TYPES).find(([, v]) => v === ext)?.[0] || 'image/jpeg'

  const key = buildImageKey(productId, productName, slot, ext)
  const blob = await put(key, buffer, {
    access: 'public',
    contentType: resolvedType,
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  })
  return blob.url
}

/**
 * The next file-name index that is free for this product.
 *
 * The storage key must NOT be derived from the display position: after removing
 * a photo from the middle, an existing photo can already occupy the key that the
 * new position would produce, and the upload (which overwrites by design) would
 * destroy it. Reading the indices already in use and continuing past the highest
 * keeps names in the familiar «Назва (N)» form while staying collision-free.
 */
export function nextImageIndex(existingUrls: (string | null | undefined)[]): number {
  let highest = 0
  for (const url of existingUrls) {
    if (!url) continue
    const file = decodeURIComponent(url.split('?')[0].split('/').pop() ?? '')
    const m = file.match(/\((\d+)\)\.[^.]+$/)
    const idx = m ? parseInt(m[1], 10) : 1
    if (Number.isFinite(idx) && idx > highest) highest = idx
  }
  return highest + 1
}

/** True when the URL points at our own Blob storage (safe to delete). */
export function isOwnBlobUrl(url: string | null | undefined): boolean {
  return !!url && url.includes('.blob.vercel-storage.com')
}

/** Delete a photo from Blob. External (e.g. Google) URLs are ignored. */
export async function deleteProductImage(url: string | null | undefined): Promise<void> {
  if (!isOwnBlobUrl(url)) return
  try {
    await del(url as string)
  } catch {
    // Blob delete failures must never block an admin action.
  }
}

/**
 * Compact a gallery so there are no gaps: [a, null, b] → [a, b].
 * Returns exactly MAX_PRODUCT_IMAGES entries, padded with null.
 */
export function compactGallery(urls: (string | null | undefined)[]): (string | null)[] {
  const kept = urls.filter((u): u is string => !!u && u.trim().length > 0).slice(0, MAX_PRODUCT_IMAGES)
  return Array.from({ length: MAX_PRODUCT_IMAGES }, (_, i) => kept[i] ?? null)
}

/** Read a product's gallery (in slot order) from a DB row. */
export function galleryFromRecord(record: Record<string, unknown>): (string | null)[] {
  return IMAGE_COLUMNS.map((col) => {
    const v = record[col]
    return typeof v === 'string' && v.trim() ? v : null
  })
}

/** Spread a gallery array back onto the DB column names. */
export function galleryToColumns(urls: (string | null)[]): Record<ImageColumn, string | null> {
  const out = {} as Record<ImageColumn, string | null>
  IMAGE_COLUMNS.forEach((col, i) => {
    out[col] = urls[i] ?? null
  })
  return out
}
