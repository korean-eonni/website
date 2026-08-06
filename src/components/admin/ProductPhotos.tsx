'use client'

import { useState } from 'react'

type Props = {
  /** Current gallery in slot order (slot 1 first). */
  initial: string[]
  max: number
}

/**
 * Gallery editor: drag a photo to change its position, or use the ← → buttons
 * (drag-and-drop is unreliable on touch screens). The first photo is the main
 * one shown in the catalogue.
 *
 * The resulting order and the removals are submitted as hidden fields, so the
 * server action gets the exact gallery the admin sees — no guessing from slots.
 */
export default function ProductPhotos({ initial, max }: Props) {
  const [urls, setUrls] = useState<string[]>(initial)
  const [removed, setRemoved] = useState<string[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

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

      {urls.length === 0 && <p className="text-xs text-[#666] mb-3">Фото ще немає.</p>}

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
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
              src={url}
              alt={`Фото ${i + 1}`}
              draggable={false}
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
      </div>

      {removed.length > 0 && (
        <p className="mt-3 text-xs text-[#7F1D1D]">
          Буде видалено фото: {removed.length}. Зміни застосуються після збереження.
        </p>
      )}

      <div className="mt-4">
        <label className="block text-sm mb-2">Додати фото</label>
        <input
          name="images"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          multiple
          className="w-full"
        />
        <p className="mt-1 text-xs text-[#666]">
          Нові фото додаються в кінець. Зберігаються у власному сховищі як «Назва товару.jpg»,
          «Назва товару (2).jpg» …
        </p>
      </div>
    </div>
  )
}
