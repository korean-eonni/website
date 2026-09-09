'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/layout/Footer'
import WishlistButton from '@/components/WishlistButton'
import { useWishlist } from '@/contexts/WishlistContext'
import { useCart } from '@/contexts/CartContext'
import { isPurchasable } from '@/lib/stock'

type Product = {
  id: string
  name: string
  sale_price: number | null
  original_price: number | null
  image_url: string | null
  image_path: string | null
  // Needed to tell whether the item can still be bought — a saved product may
  // have sold out or been flagged "coming soon" since it was added.
  stock_quantity: number | null
  coming_soon: number | null
  is_active: number | null
}

export default function WishlistPage() {
  const { ids, ready, count } = useWishlist()
  const { addToCart } = useCart()
  // Поки запит у дорозі — кнопка вимкнена; галочка зʼявляється лише після
  // підтвердження сервера, а причину відмови покаже кошик.
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addedId, setAddedId] = useState<string | null>(null)

  const handleAdd = async (id: string) => {
    setAddingId(id)
    const ok = await addToCart(id)
    setAddingId(null)
    if (!ok) return
    setAddedId(id)
    setTimeout(() => setAddedId((v) => (v === id ? null : v)), 1500)
  }
  const [productMap, setProductMap] = useState<Record<string, Product>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return
        const arr: Product[] = Array.isArray(data) ? data : data.products || []
        const map: Record<string, Product> = {}
        for (const p of arr) map[p.id] = p
        setProductMap(map)
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const products = ids.map((id) => productMap[id]).filter(Boolean) as Product[]

  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      <section className="py-10 sm:py-14">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="font-bebas uppercase text-black text-[40px] sm:text-[56px] leading-[1]">
            Список бажань{ready && count > 0 ? ` (${count})` : ''}
          </h1>

          {ready && count === 0 ? (
            <div className="mt-10 text-center bg-[#F8F7FB] rounded-[24px] py-20 px-6">
              <svg className="w-16 h-16 mx-auto text-[#BBBBBB] mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <h2 className="font-bebas text-[28px] text-black mb-3">Тут поки порожньо</h2>
              <p className="text-[#666] mb-6 font-gilroy text-[15px]">Додавайте товари в список бажань кнопкою-сердечком — і вони з'являться тут.</p>
              <Link href="/catalog" className="inline-block px-10 py-4 bg-[#4348AE] text-white font-semibold rounded-lg hover:bg-[#373B8A] transition-colors">
                Перейти до каталогу
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 xl:grid-cols-3 gap-x-3 sm:gap-x-6 gap-y-6 sm:gap-y-10">
              {products.map((p) => {
                const img = p.image_url || p.image_path || '/products/product-1.png'
                return (
                  <Link key={p.id} href={`/product/${p.id}`} className="group block">
                    <div className="product-card relative w-full rounded-[16px] sm:rounded-[20px] overflow-hidden p-[5px] sm:p-[6px] bg-white">
                      <div className="relative aspect-square rounded-[12px] sm:rounded-[15px] overflow-hidden bg-white z-[1]">
                        <Image src={img} alt={p.name} fill className="object-contain p-3" sizes="(min-width: 1280px) 288px, 50vw" loading="lazy" />
                        <WishlistButton productId={p.id} variant="icon" className="absolute top-3 right-3 z-[5]" />
                        {isPurchasable(p) ? (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAdd(p.id) }}
                            disabled={addingId === p.id}
                            aria-label="Додати в кошик"
                            className={`absolute bottom-3 right-3 w-[40px] h-[40px] rounded-lg flex items-center justify-center shadow-sm z-[4] disabled:cursor-not-allowed ${
                              addingId === p.id || addedId === p.id
                                ? 'bg-[#4348AE] text-white'
                                : 'bg-[#E2F9FF] hover:bg-white text-black'
                            }`}
                          >
                            {addingId === p.id ? (
                              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
                            ) : addedId === p.id ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                              </svg>
                            )}
                          </button>
                        ) : (
                          <span className="absolute bottom-3 left-3 right-3 rounded-lg bg-white/90 px-2 py-1.5 text-center text-[12px] font-semibold text-[#9B2C2C] z-[4]">
                            Скоро в наявності
                          </span>
                        )}
                      </div>
                      <div className="px-3 sm:px-4 pt-3 pb-3">
                        <h3 className="font-gilroy text-[13px] sm:text-[15px] leading-[18px] sm:leading-[20px] text-black mb-1.5 line-clamp-2 min-h-[36px] sm:min-h-[40px]">{p.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="font-gilroy font-semibold text-[15px] sm:text-[18px] text-black">₴{p.sale_price ?? 0}</span>
                          {p.original_price && p.original_price > (p.sale_price ?? 0) && (
                            <span className="font-gilroy text-[12px] sm:text-[14px] text-[#999999] line-through">₴{p.original_price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {!ready || (loading && count > 0) ? (
            <p className="mt-8 text-[#666] font-gilroy text-[14px]">Завантаження…</p>
          ) : null}
        </div>
      </section>
      <Footer />
    </main>
  )
}
