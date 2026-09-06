'use client'

import { useState } from 'react'

/**
 * Live filter for the admin product table. The table rows are server-rendered
 * with `data-product-row` and a lowercase `data-search` haystack; this box just
 * toggles their visibility, so it works over ALL products without another fetch.
 */
export default function ProductSearchBox({ total }: { total: number }) {
  const [q, setQ] = useState('')
  const [shown, setShown] = useState(total)

  const apply = (raw: string) => {
    setQ(raw)
    const query = raw.trim().toLowerCase()
    const rows = document.querySelectorAll<HTMLElement>('[data-product-row]')
    let n = 0
    rows.forEach((row) => {
      const hay = row.dataset.search || ''
      const match = query === '' || hay.includes(query)
      row.hidden = !match
      if (match) n++
    })
    setShown(n)
  }

  return (
    <div className="mb-5">
      <div className="relative max-w-[520px]">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A8A] pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={(e) => apply(e.target.value)}
          placeholder="Пошук товару за назвою або категорією…"
          className="w-full h-12 pl-11 pr-10 rounded-xl border border-[#BBBBBB] bg-white text-[15px] outline-none focus:border-[#4348AE] transition-colors"
        />
        {q && (
          <button
            type="button"
            onClick={() => apply('')}
            aria-label="Очистити пошук"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-[#8A8A8A] hover:text-black"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {q.trim() !== '' && (
        <p className="mt-2 text-[13px] text-[#555]">
          Знайдено: {shown} з {total}
        </p>
      )}
    </div>
  )
}
