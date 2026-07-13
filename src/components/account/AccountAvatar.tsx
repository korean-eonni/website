'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Subtle account avatar. Shows the user's photo (saved locally) or their initials.
 * Click to upload an image — it's downscaled to 256×256 on the client and stored
 * in localStorage (per user), so no backend/upload is involved. A faint camera
 * overlay appears only on hover, to keep it unobtrusive.
 */
export default function AccountAvatar({ userId, initials }: { userId: string; initials: string }) {
  const key = `eonni_avatar_${userId}`
  const [src, setSrc] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      setSrc(localStorage.getItem(key))
    } catch {
      /* ignore */
    }
  }, [key])

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = () => {
      const img = new window.Image()
      img.onload = () => {
        const size = 256
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        // cover-fit (center-crop) the image into a square
        const scale = Math.max(size / img.width, size / img.height)
        const w = img.width * scale
        const h = img.height * scale
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        try {
          localStorage.setItem(key, dataUrl)
          setSrc(dataUrl)
        } catch {
          /* storage full / blocked — ignore */
        }
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const remove = (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    setSrc(null)
  }

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Змінити аватар"
        className="relative w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] rounded-full overflow-hidden flex items-center justify-center text-white text-[20px] sm:text-[24px] font-semibold bg-gradient-to-br from-[#BCC2F4] to-[#6046A3]"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="Аватар" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
        <span className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </span>
      </button>

      {/* Always-visible "edit photo" badge — clear that the avatar is changeable */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Завантажити фото"
        className="absolute bottom-0 right-0 w-6 h-6 sm:w-[26px] sm:h-[26px] rounded-full bg-[#6046A3] border-2 border-white text-white flex items-center justify-center shadow-md hover:bg-[#4D3882] transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </button>

      {src && (
        <button
          type="button"
          onClick={remove}
          aria-label="Прибрати аватар"
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-[#E5E5E5] text-[#999] hover:text-[#DC2626] shadow-sm flex items-center justify-center text-[14px] leading-none"
        >
          ×
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
    </div>
  )
}
