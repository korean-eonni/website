import fs from 'fs'
import path from 'path'
import { imageSize } from 'image-size'
import { put, del } from '@vercel/blob'

type StoredImage = {
  image_path: string | null
  image_url: string | null
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024
const MIN_WIDTH = 393
const MIN_HEIGHT = 400
const MIN_RATIO = 0.95
const MAX_RATIO = 1.05

export async function storeImage(
  file: File,
  id: string,
  existingUrl?: string | null,
  existingPath?: string | null
): Promise<StoredImage> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('invalid-type')
  }
  if (file.size > MAX_SIZE) {
    throw new Error('file-too-large')
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const dimensions = imageSize(buffer)
  if (!dimensions.width || !dimensions.height) {
    throw new Error('invalid-dimensions')
  }
  const ratio = dimensions.width / dimensions.height
  if (
    dimensions.width < MIN_WIDTH ||
    dimensions.height < MIN_HEIGHT ||
    ratio < MIN_RATIO ||
    ratio > MAX_RATIO
  ) {
    throw new Error('invalid-dimensions')
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`products/${id}.${ext}`, buffer, {
      access: 'public',
      contentType: file.type,
    })
    if (existingUrl && existingUrl.includes('.blob.vercel-storage.com')) {
      try {
        await del(existingUrl)
      } catch {
        // ignore delete errors
      }
    }
    return { image_path: null, image_url: blob.url }
  }

  if (process.env.VERCEL) {
    throw new Error('blob-token-required')
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
  const fileName = `${id}.${ext}`
  const filePath = path.join(uploadsDir, fileName)
  fs.writeFileSync(filePath, buffer)
  if (existingPath?.startsWith('/uploads/') && existingPath !== `/uploads/${fileName}`) {
    const oldPath = path.join(process.cwd(), 'public', existingPath)
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath)
    }
  }
  return { image_path: `/uploads/${fileName}`, image_url: null }
}
