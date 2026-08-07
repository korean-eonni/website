'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  /** Current gallery in slot order (slot 1 first). Empty when creating a product. */
  initial: string[]
  max: number
  /** Creating a product requires at least one photo. */
  required?: boolean
}

type Pending = { file: File; preview: string }

/**
 * Admin thumbnails go through Next's image optimizer. The stored originals can
 * be several megabytes each, and a gallery of them made the edit page crawl —
 * especially on mobile. The full-size file is still what gets saved.
 */
function thumb(url: string, width = 256): string {
  if (!/^https?:\/\//.test(url)) return url
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=60`
}

/**
 * Gallery editor.
 *
 * Saved photos can be reordered by dragging (or with the ← → buttons, since
 * drag-and-drop does not work on touch screens) and removed individually. The
 * first one is the main photo.
 *
 * Newly picked files show up immediately as previews at the end of the grid,
 * marked as "нове", and can be dropped again before saving — the file input is
 * rebuilt from the kept list so the form submits exactly what is on screen.
 * They are uploaded when the product is saved.
 */
export default function ProductPhotos({ initial, max, required }: Props) {
  const [urls, setUrls] = useState<string[]>(initial)
  const [removed, setRemoved] = useState<string[]>([])
  const [pending, setPending] = useState<Pending[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Object URLs must be released or the page leaks memory as photos are swapped.
  useEffect(() => {
    return () => pending.forEach((p) => URL.revokeObjectURL(p.preview))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Keep the real <input type="file"> in sync with the pending list. */
  const syncInput = (files: Pending[]) => {
    if (!inputRef.current || typeof DataTransfer === 'undefined') return
    const dt = new DataTransfer()
    files.forEach((p) => dt.items.add(p.file))
    inputRef.current.files = dt.files
  }

  const room = max - urls.length - pending.length

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || [])
    if (!picked.length) return
    const accepted = picked.slice(0, Math.max(0, room))
    const next = [...pending, ...accepted.map((file) => ({ file, preview: URL.createObjectURL(file) }))]
    setPending(next)
    syncInput(next)
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

  const movePending = (from: number, to: number) => {
    if (to < 0 || to >= pending.length || from === to) return
    const next = pending.slice()
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setPending(next)
    syncInput(next)
  }

  const removePending = (index: number) => {
    const gone = pending[index]
    if (!gone) return
    URL.revokeObjectURL(gone.preview)
    const next = pending.filter((_, i) => i !== index)
    setPending(next)
    syncInput(next)
  }

  const total = urls.length + pending.length

  return (
    <div className="md:col-span-2 rounded-xl border border-[#CCCCCC] bg-white p-4">
      <p className="text-sm font-semibold mb-1">
        Фото ({total}/{max})
      </p>
      <p className="text-xs text-[#666] mb-3">
        Перше фото — головне. Перетягніть, щоб змінити порядок (або стрілками).
      </p>

      {/* The exact order + removals the server should apply. */}
      <input type="hidden" name="gallery_order" value={JSON.stringify(urls)} />
      <input type="hidden" name="gallery_removed" value={JSON.stringify(removed)} />

      {total === 0 && <p className="text-xs text-[#666] mb-3">Фото ще немає.</p>}

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

        {/* Just-picked files — visible straight away, uploaded on save. */}
        {pending.map((p, i) => (
          <div
            key={p.preview}
            className="relative rounded-lg border border-dashed border-[#0D7E2F] p-2 bg-[#F3FBF5]"
          >
            <span className="absolute top-1 left-1 z-[2] rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[#0D7E2F] text-white">
              {urls.length === 0 && i === 0 ? 'Головне · нове' : 'нове'}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.preview}
              alt={p.file.name}
              className="w-full aspect-square object-contain bg-white"
            />
            <div className="mt-2 flex items-center justify-between gap-1">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => movePending(i, i - 1)}
                  disabled={i === 0}
                  title="Лівіше"
                  className="w-6 h-6 rounded border border-[#CCCCCC] text-[12px] leading-none disabled:opacity-30 hover:bg-[#F5F3FF]"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => movePending(i, i + 1)}
                  disabled={i === pending.length - 1}
                  title="Правіше"
                  className="w-6 h-6 rounded border border-[#CCCCCC] text-[12px] leading-none disabled:opacity-30 hover:bg-[#F5F3FF]"
                >
                  →
                </button>
              </div>
              <button
                type="button"
                onClick={() => removePending(i)}
                title="Прибрати з вибраних"
                className="w-6 h-6 rounded border border-[#B91C1C] text-[#B91C1C] text-[12px] leading-none hover:bg-[#B91C1C] hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {removed.length > 0 && (
        <p className="mt-3 text-xs text-[#7F1D1D]">
          Буде видалено фото: {removed.length}. Зміни застосуються після збереження.
        </p>
      )}
      {pending.length > 0 && (
        <p className="mt-1 text-xs text-[#0D7E2F]">
          Буде додано фото: {pending.length}. Завантажаться після збереження.
        </p>
      )}

      <div className="mt-4">
        <label className="block text-sm mb-2">Додати фото</label>
        <input
          ref={inputRef}
          name="images"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          multiple
          required={required && total === 0}
          disabled={room <= 0}
          onChange={onPick}
          className="w-full"
        />
        <p className="mt-1 text-xs text-[#666]">
          {room > 0
            ? 'Нові фото додаються в кінець. Зберігаються у власному сховищі як «Назва товару.jpg», «Назва товару (2).jpg» …'
            : `Досягнуто ліміт у ${max} фото — видаліть якесь, щоб додати нове.`}
        </p>
      </div>
    </div>
  )
}
