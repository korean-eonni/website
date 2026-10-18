'use client'

import { useRef, useState } from 'react'
import { upload } from '@vercel/blob/client'

type Props = {
  /** Current gallery in slot order (slot 1 first). Empty when creating a product. */
  initial: string[]
  max: number
  /** Creating a product requires at least one photo (enforced on the server). */
  required?: boolean
  /** Product id — photos are stored under `products/<id>/…`. */
  productId: string
  /** Product name — used only to keep stored file names readable. */
  productName?: string
}

/**
 * Admin thumbnails go through Next's image optimizer. The stored originals can
 * be several megabytes each, and a gallery of them made the edit page crawl —
 * especially on mobile. The full-size file is still what gets saved.
 */
function thumb(url: string, width = 256): string {
  if (!/^https?:\/\//.test(url)) return url
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=60`
}

function fileExt(file: File): string {
  const t = (file.type || '').toLowerCase()
  if (t === 'image/png') return 'png'
  if (t === 'image/webp') return 'webp'
  if (t === 'image/avif') return 'avif'
  if (t === 'image/gif') return 'gif'
  if (t === 'image/jpeg' || t === 'image/jpg') return 'jpg'
  const m = file.name.toLowerCase().match(/\.(png|webp|avif|gif|jpe?g)$/)
  return m ? (m[1] === 'jpeg' ? 'jpg' : m[1]) : 'jpg'
}

function baseName(name: string | undefined): string {
  const safe = (name || '')
    .replace(/[/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
  return safe || 'photo'
}

/**
 * Gallery editor.
 *
 * Photos upload straight from the browser to Vercel Blob the moment they are
 * picked — the file never passes through the "save product" Server Action,
 * which Vercel caps at 4.5 MB (a phone photo alone can exceed that, which used
 * to make the save silently do nothing). Once uploaded, each photo is just a
 * URL like the existing ones, so the form submits only the ordered list of
 * URLs via `gallery_order`, plus whatever was removed via `gallery_removed`.
 *
 * Saved photos can be reordered by dragging (or with the ← → buttons, since
 * drag-and-drop does not work on touch screens) and removed individually. The
 * first one is the main photo.
 */
export default function ProductPhotos({ initial, max, required, productId, productName }: Props) {
  const [urls, setUrls] = useState<string[]>(initial)
  const [removed, setRemoved] = useState<string[]>([])
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const room = max - urls.length

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || [])
    // Clear the input so the same file can be picked again after a failure.
    e.target.value = ''
    if (!picked.length) return
    setError(null)
    // Only take as many as there is room for; uploads run one at a time so a
    // slow connection shows steady progress instead of stalling all at once.
    const toUpload = picked.slice(0, Math.max(0, room))
    for (const file of toUpload) {
      setUploading((n) => n + 1)
      try {
        const path = `products/${productId}/${baseName(productName)}.${fileExt(file)}`
        const blob = await upload(path, file, {
          access: 'public',
          handleUploadUrl: '/api/admin/blob-upload',
        })
        setUrls((prev) => (prev.length < max ? [...prev, blob.url] : prev))
      } catch (err) {
        console.error('[ProductPhotos] upload failed:', err)
        setError('Не вдалося завантажити фото. Спробуйте ще раз.')
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= urls.length || from === to) return
    setUrls((prev) => {
      const next = prev.slice()
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  // Both pieces of state are derived here rather than inside a setState updater:
  // React may invoke an updater more than once, which would queue the same photo
  // for deletion twice.
  const remove = (index: number) => {
    const gone = urls[index]
    if (!gone) return
    setUrls((prev) => prev.filter((_, i) => i !== index))
    setRemoved((prev) => (prev.includes(gone) ? prev : [...prev, gone]))
  }

  return (
    <div className="md:col-span-2 rounded-xl border border-[#CCCCCC] bg-white p-4">
      <p className="text-sm font-semibold mb-1">
        Фото ({urls.length}/{max})
      </p>
      <p className="text-xs text-[#666] mb-3">
        Перше фото — головне. Перетягніть, щоб змінити порядок (або стрілками).
      </p>

      {/* The exact order + removals the server should apply. */}
      <input type="hidden" name="gallery_order" value={JSON.stringify(urls)} />
      <input type="hidden" name="gallery_removed" value={JSON.stringify(removed)} />

      {error && (
        <p className="mb-3 rounded-lg border border-[#B91C1C] bg-[#FEE2E2] px-3 py-2 text-xs text-[#7F1D1D]">
          {error}
        </p>
      )}

      {urls.length === 0 && uploading === 0 && (
        <p className="text-xs text-[#666] mb-3">Фото ще немає.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {urls.map((url, i) => (
          <div
            key={url}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => {
              e.preventDefault()
              setOverIndex(i)
            }}
            onDragLeave={() => setOverIndex((v) => (v === i ? null : v))}
            onDrop={(e) => {
              e.preventDefault()
              if (dragIndex !== null) move(dragIndex, i)
              setDragIndex(null)
              setOverIndex(null)
            }}
            onDragEnd={() => {
              setDragIndex(null)
              setOverIndex(null)
            }}
            className={`relative rounded-lg border p-2 bg-white cursor-move transition-colors ${
              overIndex === i && dragIndex !== i
                ? 'border-[#4348AE] ring-2 ring-[#4348AE]/30'
                : 'border-[#E5E5E5]'
            } ${dragIndex === i ? 'opacity-40' : ''}`}
          >
            <span
              className={`absolute top-1 left-1 z-[2] rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                i === 0 ? 'bg-[#4348AE] text-white' : 'bg-black/60 text-white'
              }`}
            >
              {i === 0 ? 'Головне' : i + 1}
            </span>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb(url)}
              alt={`Фото ${i + 1}`}
              draggable={false}
              loading="lazy"
              className="w-full aspect-square object-contain bg-white pointer-events-none"
            />

            <div className="mt-2 flex items-center justify-between gap-1">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  title="Лівіше"
                  className="w-6 h-6 rounded border border-[#CCCCCC] text-[12px] leading-none disabled:opacity-30 hover:bg-[#F5F3FF]"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === urls.length - 1}
                  title="Правіше"
                  className="w-6 h-6 rounded border border-[#CCCCCC] text-[12px] leading-none disabled:opacity-30 hover:bg-[#F5F3FF]"
                >
                  →
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                title="Видалити фото"
                className="w-6 h-6 rounded border border-[#B91C1C] text-[#B91C1C] text-[12px] leading-none hover:bg-[#B91C1C] hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {/* Placeholders for photos still uploading. */}
        {Array.from({ length: uploading }).map((_, i) => (
          <div
            key={`uploading-${i}`}
            className="relative rounded-lg border border-dashed border-[#4348AE] p-2 bg-[#F5F3FF] flex items-center justify-center aspect-square"
          >
            <span className="text-[11px] text-[#4348AE] text-center px-1">
              Завантаження…
            </span>
          </div>
        ))}
      </div>

      {removed.length > 0 && (
        <p className="mt-3 text-xs text-[#7F1D1D]">
          Буде видалено фото: {removed.length}. Зміни застосуються після збереження.
        </p>
      )}

      <div className="mt-4">
        <label className="block text-sm mb-2">Додати фото</label>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          multiple
          disabled={room <= 0}
          onChange={onPick}
          className="w-full"
        />
        <p className="mt-1 text-xs text-[#666]">
          {room > 0
            ? 'Фото завантажуються одразу при виборі й зберігаються у власному сховищі. Нові додаються в кінець.'
            : `Досягнуто ліміт у ${max} фото — видаліть якесь, щоб додати нове.`}
        </p>
        {required && urls.length === 0 && (
          <p className="mt-1 text-xs text-[#7F1D1D]">Потрібне хоча б одне фото.</p>
        )}
      </div>
    </div>
  )
}
