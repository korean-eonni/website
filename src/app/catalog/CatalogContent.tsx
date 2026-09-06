'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import ExclusiveProducts from '@/components/sections/ExclusiveProducts'
import ReviewsSection from '@/components/sections/ReviewsSection'
import SubscribeSection from '@/components/sections/SubscribeSection'
import DeliverySection from '@/components/sections/DeliverySection'
import FloatingIcons from '@/components/FloatingIcons'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import WishlistButton from '@/components/WishlistButton'
import productColors from '@/lib/productColors.json'
import { isOutOfStock } from '@/lib/stock'

// Pre-computed dominant packaging colour per product id (see
// scripts/compute-product-colors.mjs). Used for the default "by colour" order:
// rainbow families (pink→red→orange→yellow→green→cyan→blue→violet→neutral), and
// within each family vivid tones first, paler/lighter tones last.
type ColorInfo = { family: string; order: number; sat: number; light: number; hue?: number | null }
const COLOR_MAP = productColors as Record<string, ColorInfo>

// Compare two product ids by colour order. Unknown ids fall to the end (neutral).
function compareByColor(aId: string, bId: string): number {
  const a = COLOR_MAP[aId]
  const b = COLOR_MAP[bId]
  const oa = a?.order ?? 9
  const ob = b?.order ?? 9
  if (oa !== ob) return oa - ob              // family order (rainbow)
  const sa = a?.sat ?? 0
  const sb = b?.sat ?? 0
  if (sb !== sa) return sb - sa              // vivid (high saturation) first
  return (a?.light ?? 1) - (b?.light ?? 1)   // lighter tones last
}

// Normalize raw product.category from the Google Sheet to one of the canonical buckets.
// Patterns are matched case-insensitively against substrings of the raw category string,
// so typo variants ("тіл", "тел", "хелз" etc) still land in the right bucket.
// Anything that doesn't match gets dropped from the filter list — products themselves
// are still listed in the catalog so nothing is lost.
const CATEGORY_BUCKETS = [
  { label: 'Обличчя', urlSlug: 'face', patterns: ['обличч', 'face'] },
  { label: 'Волосся', urlSlug: 'hair', patterns: ['волосс', 'волоссі', 'hair'] },
  { label: 'Тіло', urlSlug: 'body', patterns: ['тіл', 'body', 'тел'] },
  { label: 'Health & Care', urlSlug: 'health', patterns: ['health', 'кейр', 'care', 'хелс', 'хелз'] },
  { label: 'Косметичні девайси', urlSlug: 'devices', patterns: ['девайс', 'девай', 'devic', 'прилад', 'пристр', 'прибор'] },
  { label: 'Тестери та аксесуари', urlSlug: 'testers', patterns: ['тестер', 'аксесуар', 'tester', 'accessor'] },
] as const

function normalizeCategory(raw: string | null | undefined): string | null {
  if (!raw) return null
  const lower = raw.toLowerCase()
  for (const bucket of CATEGORY_BUCKETS) {
    if (bucket.patterns.some(p => lower.includes(p))) return bucket.label
  }
  return null
}

function bucketLabelFromUrlSlug(slug: string | null | undefined): string | null {
  if (!slug) return null
  const lower = slug.toLowerCase()
  return CATEGORY_BUCKETS.find(b => b.urlSlug === lower)?.label ?? null
}

// "Догляд за потребами" menu (?concern=…). No dedicated concern column exists, so we
// match keywords against the product's name + tags + description + skin type + ingredients.
// Fixed skin-type options for the sidebar filter. Products' `skin_type` column is
// still empty, so we ALSO match by keywords in the product text — this keeps the
// filter always visible and usable, and it starts matching the exact `skin_type`
// field automatically the moment that column is filled from the sheet.
const SKIN_TYPE_OPTIONS = ['Суха', 'Нормальна', 'Комбінована', 'Жирна', 'Чутлива']
const SKIN_TYPE_KEYWORDS: Record<string, string[]> = {
  'Суха': ['сух', 'зневодн', 'зволож', 'живл', 'церамід', 'гіалурон'],
  'Нормальна': ['нормальн', 'всіх тип', 'будь-як', 'універсал', 'баланс', 'зволож', 'сяйв', 'догляд', 'вітамін', 'пружн'],
  'Комбінована': ['комбінов', 'т-зон', 'себорегул', 'звуженн пор'],
  'Жирна': ['жирн', 'себорегул', 'матув', 'акне', 'висип', 'bha', 'ніацинамід', 'звуженн пор'],
  'Чутлива': ['чутлив', 'заспок', 'подразн', 'почервонін', 'центел', 'cica', 'пантенол'],
}

const CONCERN_KEYWORDS: Record<string, { label: string; keywords: string[] }> = {
  'acne':         { label: 'Акне та висипання', keywords: ['акне', 'висип', 'прищ', 'проблемн', 'себум', 'себоконтрол', 'протизапаль', 'bha', 'саліцил'] },
  'dry-skin':     { label: 'Суха шкіра',        keywords: ['суха шкір', 'сухої шкір', 'сухість', 'зволож', 'гіалурон', 'волог', 'dry'] },
  'sensitive':    { label: 'Чутлива шкіра',     keywords: ['чутлив', 'заспокій', 'центел', 'cica', 'sensitiv', 'подразн'] },
  'oily-skin':    { label: 'Жирна шкіра',       keywords: ['жирна шкір', 'жирної шкір', 'себум', 'себоконтрол', 'матув', 'oily'] },
  'anti-aging':   { label: 'Антивікова',        keywords: ['антивіков', 'зморшк', 'ліфтинг', 'пружн', 'колаген', 'пептид', 'ретинол', 'anti-ag'] },
  'pigmentation': { label: 'Пігментація',       keywords: ['пігмент', 'освітл', 'вирівн', 'вітамін c', 'вітамін с', 'ніацинамід', 'niacinamid', 'сяйв', 'brighten'] },
  'hydration':    { label: 'Зволоження',        keywords: ['зволож', 'гіалурон', 'волог', 'hydrat', 'moistur', 'цераміди'] },
  'pores':        { label: 'Розширені пори',    keywords: ['пори', 'пор ', 'чорні цятк', 'звуж', 'матув', 'bha'] },
}

type Product = {
  id: string
  name: string
  short_description: string | null
  sale_price: number | null
  original_price: number | null
  discount_amount: number | null
  image_url: string | null
  image_path: string | null
  image_url_2: string | null
  image_url_3: string | null
  image_url_4: string | null
  image_url_5: string | null
  is_new: number
  is_exclusive: number
  category: string | null
  subcategory: string | null
  /** Optional second subcategory — the product belongs to both. */
  subcategory_2: string | null
  /** Optional third subcategory. */
  subcategory_3: string | null
  brand: string | null
  tags: string | null
  volume_options: string | null
  stock_quantity: number | null
  coming_soon?: string | number | boolean | null
  skin_type: string | null
  ingredients: string | null
  rating: number | null
}

// Availability is driven by the stock column: a product is "coming soon" (not
// yet purchasable) when its stock has no number ≥ 1 — i.e. empty, 0 or
// non-numeric. Such products still appear in the catalogue, but dimmed and with
// a "Скоро в наявності" badge instead of the add-to-cart button.
function isComingSoon(p: Product): boolean {
  return isOutOfStock(p.stock_quantity)
}

const PRODUCTS_PER_PAGE = 20

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(!checked)}
        className="sr-only peer"
      />
      <div
        className={`w-[16px] h-[16px] border border-[#BBBBBB] rounded-sm flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#4348AE] peer-focus-visible:ring-offset-1 ${
          checked ? 'bg-[#4348AE] border-[#4348AE]' : 'bg-[#E2F9FF] group-hover:border-[#999]'
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span className="font-gilroy text-[14px] leading-[18px] text-black">{label}</span>
    </label>
  )
}

function FilterSection({ 
  title, isOpen, onToggle, children 
}: { 
  title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode 
}) {
  return (
    <div className="border-b border-[#E5E5E5] pb-4">
      <button onClick={onToggle} className="flex items-center justify-between w-full py-2">
        <span className="font-gilroy font-medium text-[16px] leading-[21px] text-black">{title}</span>
        <span className="text-[20px] text-[#666]">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  )
}

function ActiveFilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-[10px] h-[30px] px-[10px] bg-[#FFE8F0] rounded-sm">
      <span className="font-gilroy text-[14px] text-black">{label}</span>
      <button onClick={onRemove} className="text-[#666] hover:text-black">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

function VolumeButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-[40px] px-[25px] py-[11px] border transition-colors font-gilroy text-[14px] ${
        selected ? 'border-[#4348AE] bg-[#F5F3FF] text-[#4348AE]' : 'border-[#BBBBBB] text-black hover:border-[#999]'
      }`}
    >
      {label}
    </button>
  )
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (productId: string) => void }) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const comingSoon = isComingSoon(product)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [notifyContact, setNotifyContact] = useState('')
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const mainImage = product.image_url || product.image_path || '/products/product-1.png'
  const allImages = [mainImage, product.image_url_2, product.image_url_3, product.image_url_4, product.image_url_5].filter(Boolean) as string[]
  const [hoveredIndex, setHoveredIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startCycling = () => {
    if (allImages.length <= 1) return
    intervalRef.current = setInterval(() => {
      setHoveredIndex((prev) => (prev + 1) % allImages.length)
    }, 1000)
  }

  const stopCycling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setHoveredIndex(0)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    await onAddToCart(product.id)
    setTimeout(() => setAdding(false), 500)
  }

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!notifyContact.trim()) return
    setNotifyStatus('sending')
    try {
      const res = await fetch('/api/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, productName: product.name, contact: notifyContact.trim() }),
      })
      setNotifyStatus(res.ok ? 'done' : 'error')
    } catch {
      setNotifyStatus('error')
    }
  }

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <div className="product-card relative w-full h-full flex flex-col rounded-[16px] sm:rounded-[20px] overflow-hidden p-[5px] sm:p-[6px]" onMouseEnter={startCycling} onMouseLeave={stopCycling}>
        <div className="relative aspect-square rounded-[12px] sm:rounded-[15px] overflow-hidden bg-white z-[1]">
          <Image
            src={allImages[hoveredIndex]}
            alt={product.name}
            fill
            className={`product-image object-contain p-3 transition-opacity duration-300 ${comingSoon ? 'opacity-50' : ''}`}
            sizes="(min-width: 1280px) 288px, (min-width: 640px) 280px, 100vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjg4IiBoZWlnaHQ9IjI4OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjhGN0ZCIi8+PC9zdmc+"
          />
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-[3]">
              {allImages.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === hoveredIndex ? 'bg-[#4348AE]' : 'bg-white/70 ring-1 ring-black/10'}`} />
              ))}
            </div>
          )}

          {/* Top-left discount badge */}
          {product.discount_amount != null && product.discount_amount > 0 && (
            <div className="absolute top-3 left-3 z-[4] flex flex-col items-start gap-1.5">
              <span className="h-[32px] px-3 rounded-[8px] bg-[#E84A8A] text-white text-[15px] font-bold flex items-center shadow-[0_3px_10px_rgba(232,74,138,0.45)]">
                −{product.discount_amount}%
              </span>
            </div>
          )}

          {/* Wishlist heart */}
          <WishlistButton productId={product.id} variant="icon" className="absolute top-3 right-3 z-[5]" />

          {/* Notify-me overlay for coming-soon products */}
          {comingSoon && notifyOpen && (
            <div
              onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
              className="absolute inset-0 z-[6] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center"
            >
              {notifyStatus === 'done' ? (
                <p className="text-[13px] text-[#4348AE] font-semibold leading-snug">
                  Дякуємо! Повідомимо, щойно товар з&apos;явиться 💜
                </p>
              ) : (
                <form onSubmit={handleNotify} className="w-full max-w-[230px]">
                  <p className="text-[12px] text-[#666] mb-2 leading-tight">
                    Лишіть email або телефон — повідомимо, коли з&apos;явиться
                  </p>
                  <input
                    value={notifyContact}
                    onChange={(e) => setNotifyContact(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="email або телефон"
                    className="w-full h-9 px-3 border border-[#CCC] rounded-lg text-[13px] mb-2 outline-none focus:border-[#4348AE]"
                  />
                  <button
                    type="submit"
                    disabled={notifyStatus === 'sending'}
                    className="w-full h-9 rounded-lg bg-[#4348AE] text-white text-[13px] font-semibold hover:bg-[#373B8A] transition-colors disabled:opacity-60"
                  >
                    {notifyStatus === 'sending' ? '...' : 'Повідомити мене'}
                  </button>
                  {notifyStatus === 'error' && (
                    <p className="text-[11px] text-red-500 mt-1">Перевірте email або номер</p>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setNotifyOpen(false) }}
                    className="text-[11px] text-[#999] mt-2 underline"
                  >
                    Закрити
                  </button>
                </form>
              )}
            </div>
          )}

          {comingSoon ? (
            <button
              className="absolute bottom-3 right-3 w-[40px] h-[40px] rounded-lg flex items-center justify-center bg-white hover:bg-[#E2F9FF] text-[#4348AE] transition-colors shadow-sm z-[4]"
              aria-label="Повідомити, коли з'явиться"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setNotifyOpen(true) }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
          ) : (
            <button
              className={`absolute bottom-3 right-3 w-[40px] h-[40px] rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:cursor-not-allowed z-[4] ${
                adding ? 'bg-[#4348AE] text-white' : 'bg-white hover:bg-[#E2F9FF] text-black'
              }`}
              aria-label="Додати в кошик"
              onClick={handleAddToCart}
              disabled={adding}
            >
              {adding ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Product Info — sits inside the gradient frame, below the photo cradle */}
        <div className="relative z-[1] flex-1 flex flex-col px-3 sm:px-4 pt-3 pb-3 sm:pt-3.5 sm:pb-4">
          <h3
            className={`font-gilroy text-[13px] sm:text-[15px] leading-[18px] sm:leading-[20px] text-black mb-1.5 min-h-[36px] sm:min-h-[40px] ${comingSoon ? 'opacity-60' : ''}`}
          >
            {product.name}
          </h3>

          {product.tags && (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
                .slice(0, 3)
                .map((tag, i) => (
                  <span
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      router.push(`/catalog?tag=${encodeURIComponent(tag)}`)
                    }}
                    className="text-[10px] sm:text-[11px] leading-tight px-2 py-[3px] rounded-full bg-[#F5F3FF] text-[#4348AE] cursor-pointer hover:bg-[#E7DEFF] transition-colors"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}

          {/* Regular price only. The registered-customer discount is deliberately
              NOT shown while browsing — it appears once items are in the cart. */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mt-auto">
            <span className={`font-gilroy font-semibold text-[15px] sm:text-[18px] leading-[22px] ${comingSoon ? 'opacity-60' : ''} ${product.original_price && product.original_price > (product.sale_price ?? 0) ? 'text-[#E84A8A]' : 'text-black'}`}>
              ₴{product.sale_price ?? 0}
            </span>
            {product.original_price && product.original_price > (product.sale_price ?? 0) && (
              <span className="font-gilroy text-[12px] sm:text-[14px] text-[#999999] line-through">
                ₴{product.original_price}
              </span>
            )}
            {comingSoon && (
              <span className="inline-flex items-center rounded-full bg-[#4348AE] text-white text-[10px] sm:text-[11px] font-semibold px-2 py-1 whitespace-nowrap">
                Скоро в наявності
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full aspect-square bg-gray-200 mb-4 rounded-lg" />
      <div className="h-[72px] bg-gray-200 mb-2 rounded" />
      <div className="h-[27px] w-[80px] bg-gray-200 rounded" />
    </div>
  )
}

export default function CatalogContent({ initialProducts }: { initialProducts?: Product[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryParam = searchParams.get('category')
  const subcategoryParam = searchParams.get('subcategory')
  const brandParam = searchParams.get('brand')
  const searchParam = searchParams.get('search')
  const stockParam = searchParams.get('stock')
  const newParam = searchParams.get('new')
  const exclusiveParam = searchParams.get('exclusive')
  const concernParam = searchParams.get('concern')
  const saleParam = searchParams.get('sale')
  const tagParam = searchParams.get('tag')
  const { addToCart } = useCart()
  
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [loading, setLoading] = useState(!(initialProducts && initialProducts.length > 0))
  const [filtersOpen, setFiltersOpen] = useState(false)
  
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])
  const [priceInitialized, setPriceInitialized] = useState(false)
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([])
  // Pre-seed from URL ?brand=Medicube — same pattern as subcategory below.
  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    const initial = searchParams.get('brand')
    return initial ? [initial] : []
  })
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  // Initialize selectedSubcategories from URL param so the deep-link filter applies
  // immediately on the very first render (avoids a flash of unfiltered results
  // and avoids racing the products fetch).
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(() => {
    const initial = searchParams.get('subcategory')
    return initial ? [initial] : []
  })
  const [onSaleOnly, setOnSaleOnly] = useState(false)
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<'color' | 'price-desc' | 'price-asc' | 'newest'>('color')
  // 'all' | 'in-stock' | 'coming-soon'. Toggled by tabs above the product grid.
  // "coming soon" is driven by the isComingSoon() flag (a future sheet column);
  // until that column exists, no product is flagged, so "В наявності" lists every
  // product and "Скоро в наявності" stays empty.
  // Seeded from URL ?stock=… so navbar links can land users on the right tab.
  const [stockTab, setStockTab] = useState<'all' | 'in-stock' | 'coming-soon'>(() => {
    const initial = searchParams.get('stock')
    if (initial === 'in-stock' || initial === 'coming-soon' || initial === 'all') return initial
    return 'all'
  })

  // Show more states
  const [showAllBrands, setShowAllBrands] = useState(false)
  const [showAllIngredients, setShowAllIngredients] = useState(false)
  const [showAllSkinTypes, setShowAllSkinTypes] = useState(false)
  const [showAllSubcategories, setShowAllSubcategories] = useState(false)

  // Filter section open states
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [subcategoryOpen, setSubcategoryOpen] = useState(true)
  const [saleOpen, setSaleOpen] = useState(true)
  const [skinTypeOpen, setSkinTypeOpen] = useState(true)
  const [brandOpen, setBrandOpen] = useState(true)
  const [ingredientsOpen, setIngredientsOpen] = useState(false)
  const [volumeOpen, setVolumeOpen] = useState(true)
  
  // Computed max price
  const maxPrice = useMemo(() => {
    const prices = products.map(p => p.sale_price ?? 0).filter(p => p > 0)
    return prices.length > 0 ? Math.ceil(Math.max(...prices)) : 5000
  }, [products])
  
  // Initialize price range once when products are loaded
  useEffect(() => {
    if (!priceInitialized && products.length > 0) {
      setPriceRange([0, maxPrice])
      setPriceInitialized(true)
    }
  }, [maxPrice, priceInitialized, products.length])
  
  // Fetch products client-side only if not prefetched
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) return
    
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        const productsArray = Array.isArray(data) ? data : (data.products || [])
        setProducts(productsArray)
      } catch {
        // Failed to fetch
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Exclusive products for the section below
  const exclusiveProducts = useMemo(() => {
    return products
      .filter(p => p.is_exclusive === 1)
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.sale_price ?? 0,
        originalPrice: p.original_price ?? undefined,
        discount: p.discount_amount ?? undefined,
        image: p.image_url || p.image_path || '/products/product-1.png',
        isNew: p.is_new === 1,
        comingSoon: isComingSoon(p),
        slug: p.id,
      }))
  }, [products])
  
  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(PRODUCTS_PER_PAGE)
  }, [categoryParam, searchParam, newParam, exclusiveParam, concernParam, saleParam, tagParam, priceRange, selectedSkinTypes, selectedBrands, selectedVolumes, selectedIngredients, selectedCategories, selectedSubcategories, onSaleOnly, minRating, sortBy, stockTab])

  // Sync subcategory URL param → selectedSubcategories. When the user lands here from
  // a navbar link like /catalog?category=face&subcategory=Тонери, the matching checkbox
  // pre-checks itself so the filter sidebar reflects the visible result set.
  useEffect(() => {
    if (!subcategoryParam) return
    setSelectedSubcategories(prev => prev.includes(subcategoryParam) ? prev : [...prev, subcategoryParam])
  }, [subcategoryParam])

  // Same for ?brand=… coming from the /brands gallery cards.
  useEffect(() => {
    if (!brandParam) return
    setSelectedBrands(prev => prev.includes(brandParam) ? prev : [...prev, brandParam])
  }, [brandParam])

  // Same for ?stock=… coming from the navbar "Скоро в наявності" item.
  useEffect(() => {
    if (stockParam === 'in-stock' || stockParam === 'coming-soon' || stockParam === 'all') {
      setStockTab(stockParam)
    }
  }, [stockParam])
  
  // Extract unique filter values - split comma-separated values
  const filterOptions = useMemo(() => {
    const categories = new Set<string>()
    const subcategories = new Set<string>()
    const skinTypes = new Set<string>()
    const brands = new Set<string>()
    const volumes = new Set<string>()
    const ingredients = new Set<string>()

    // When the URL has ?category=… we narrow the subcategory list to only the ones
    // that exist within that category. Avoids showing 16+ unrelated subs (e.g. on
    // Face page we don't want "Шампуні" / "Добавки" / "Лосьйони" cluttering the list)
    // and ensures the deep-linked subcategory checkbox is visible without scrolling.
    const targetBucket = categoryParam ? bucketLabelFromUrlSlug(categoryParam) : null

    products.forEach(p => {
      const norm = normalizeCategory(p.category)
      if (norm) categories.add(norm)
      const inTargetBucket = !targetBucket || norm === targetBucket
      if (p.subcategory && inTargetBucket) subcategories.add(p.subcategory)
      if (p.subcategory_2 && inTargetBucket) subcategories.add(p.subcategory_2)
      if (p.subcategory_3 && inTargetBucket) subcategories.add(p.subcategory_3)
      if (p.skin_type) {
        p.skin_type.split(',').forEach(st => {
          const trimmed = st.trim()
          if (trimmed) skinTypes.add(trimmed)
        })
      }
      if (p.brand) brands.add(p.brand)
      if (p.volume_options) {
        p.volume_options.split(',').forEach(v => {
          const trimmed = v.trim()
          if (trimmed) volumes.add(trimmed)
        })
      }
      if (p.ingredients) {
        p.ingredients.split(',').forEach(i => {
          const trimmed = i.trim()
          if (trimmed) ingredients.add(trimmed)
        })
      }
    })

    return {
      // Order the category filter by the canonical CATEGORY_BUCKETS order
      // (Обличчя, Волосся, Тіло, Health & Care, Косметичні девайси, Тестери)
      // rather than alphabetically, so it matches the navbar/footer everywhere.
      categories: Array.from(categories).filter(Boolean).sort(
        (a, b) => CATEGORY_BUCKETS.findIndex(x => x.label === a) - CATEGORY_BUCKETS.findIndex(x => x.label === b)
      ),
      subcategories: Array.from(subcategories).filter(Boolean).sort(),
      skinTypes: Array.from(skinTypes).filter(Boolean).sort(),
      brands: Array.from(brands).filter(Boolean).sort(),
      volumes: Array.from(volumes).filter(Boolean).sort((a, b) => {
        const numA = parseInt(a) || 0
        const numB = parseInt(b) || 0
        return numA - numB
      }),
      ingredients: Array.from(ingredients).filter(Boolean).sort(),
    }
  }, [products, categoryParam])

  // Filter products
  // Everything except the stock tab, so each tab can be counted on its own.
  const filteredIgnoringStock = useMemo(() => {
    let result = [...products]
    
    // Search filter — word-based AND match, order-independent. Every word in the
    // query must appear somewhere in the product's searchable text, so "крем рожевий"
    // also finds "Рожевий зволожувальний крем". Splits on any whitespace.
    if (searchParam) {
      const words = searchParam.toLowerCase().split(/\s+/).filter(Boolean)
      if (words.length > 0) {
        result = result.filter(p => {
          const haystack = [
            p.name,
            p.brand,
            p.tags,
            p.short_description,
            p.category,
            p.subcategory,
            p.subcategory_2,
            p.subcategory_3,
            p.ingredients,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          return words.every(w => haystack.includes(w))
        })
      }
    }
    
    // Category filter from URL (face/body/hair/health) → normalized bucket label
    if (categoryParam) {
      const targetLabel = bucketLabelFromUrlSlug(categoryParam)
      if (targetLabel) {
        result = result.filter(p => normalizeCategory(p.category) === targetLabel)
      } else {
        // Unknown slug — fall back to substring match for backwards compat
        result = result.filter(p =>
          p.category?.toLowerCase().includes(categoryParam.toLowerCase()) ||
          p.subcategory?.toLowerCase().includes(categoryParam.toLowerCase()) ||
          p.subcategory_2?.toLowerCase().includes(categoryParam.toLowerCase()) ||
          p.subcategory_3?.toLowerCase().includes(categoryParam.toLowerCase())
        )
      }
    }

    // "Новинки" button (?new=true)
    if (newParam === 'true') {
      result = result.filter(p => p.is_new === 1)
    }

    // "Ексклюзив" button (?exclusive=true)
    if (exclusiveParam === 'true') {
      result = result.filter(p => p.is_exclusive === 1)
    }

    // "Знижки" button (?sale=true) — only products with an active discount
    if (saleParam === 'true') {
      result = result.filter(p => p.discount_amount != null && p.discount_amount > 0)
    }

    // Tag click (?tag=…) — products whose tag list contains this exact tag
    if (tagParam) {
      const target = tagParam.trim().toLowerCase()
      result = result.filter(p =>
        (p.tags || '').split(',').some(t => t.trim().toLowerCase() === target)
      )
    }

    // "Догляд за потребами" menu (?concern=…) — keyword match across product text
    if (concernParam && CONCERN_KEYWORDS[concernParam]) {
      const kws = CONCERN_KEYWORDS[concernParam].keywords
      result = result.filter(p => {
        const hay = [p.name, p.short_description, p.tags, p.skin_type, p.ingredients]
          .filter(Boolean).join(' ').toLowerCase()
        return kws.some(k => hay.includes(k))
      })
    }

    // Category checkbox filter (sidebar uses normalized labels too)
    if (selectedCategories.length > 0) {
      result = result.filter(p => {
        const norm = normalizeCategory(p.category)
        return norm !== null && selectedCategories.includes(norm)
      })
    }

    // Subcategory / product type filter
    if (selectedSubcategories.length > 0) {
      // A product matches if EITHER of its subcategories is selected, so items that
      // belong to two of them (sheet column «Субкатегрія 2») show up under both.
      result = result.filter(
        p =>
          selectedSubcategories.includes(p.subcategory || '') ||
          selectedSubcategories.includes(p.subcategory_2 || '') ||
          selectedSubcategories.includes(p.subcategory_3 || '')
      )
    }

    // On sale filter
    if (onSaleOnly) {
      result = result.filter(p => p.discount_amount != null && p.discount_amount > 0)
    }

    // Rating filter
    if (minRating > 0) {
      result = result.filter(p => (p.rating ?? 0) >= minRating)
    }

    // Price filter
    result = result.filter(p => {
      const price = p.sale_price ?? 0
      return price >= priceRange[0] && price <= priceRange[1]
    })
    
    // Skin type filter — matches the product's `skin_type` field when it's present,
    // otherwise falls back to keyword hits in the product text, so the filter works
    // even before the skin_type column is filled from the sheet.
    if (selectedSkinTypes.length > 0) {
      result = result.filter(p => {
        if (p.skin_type) {
          const productTypes = p.skin_type.split(',').map(s => s.trim())
          if (selectedSkinTypes.some(st => productTypes.some(pt => pt.includes(st)))) return true
        }
        const hay = [p.name, p.short_description, p.tags, p.ingredients, p.subcategory, p.subcategory_2, p.subcategory_3]
          .filter(Boolean).join(' ').toLowerCase()
        return selectedSkinTypes.some(label => (SKIN_TYPE_KEYWORDS[label] ?? []).some(k => hay.includes(k)))
      })
    }
    
    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand || ''))
    }
    
    // Volume filter
    if (selectedVolumes.length > 0) {
      result = result.filter(p => 
        selectedVolumes.some(v => p.volume_options?.includes(v))
      )
    }
    
    // Ingredients filter
    if (selectedIngredients.length > 0) {
      result = result.filter(p => {
        if (!p.ingredients) return false
        const productIngredients = p.ingredients.toLowerCase()
        return selectedIngredients.some(i => productIngredients.includes(i.toLowerCase()))
      })
    }

    return result
  }, [products, searchParam, categoryParam, newParam, exclusiveParam, concernParam, saleParam, tagParam, priceRange, selectedSkinTypes, selectedBrands, selectedVolumes, selectedIngredients, selectedCategories, selectedSubcategories, onSaleOnly, minRating])

  // How many of the current selection sit in each stock tab. Drives both hiding
  // empty tabs and stepping back from one that would show nothing.
  const stockCounts = useMemo(() => {
    let inStock = 0
    for (const p of filteredIgnoringStock) if (!isComingSoon(p)) inStock++
    return {
      all: filteredIgnoringStock.length,
      'in-stock': inStock,
      'coming-soon': filteredIgnoringStock.length - inStock,
    }
  }, [filteredIgnoringStock])

  // A tab the current selection has nothing in is a dead end — leave it.
  useEffect(() => {
    if (stockTab !== 'all' && stockCounts.all > 0 && stockCounts[stockTab] === 0) {
      setStockTab('all')
    }
  }, [stockTab, stockCounts])

  const { items: filteredProducts, relaxedStock } = useMemo(() => {
    let result = filteredIgnoringStock
    let relaxed = false

    if (stockTab === 'in-stock') result = result.filter(p => !isComingSoon(p))
    else if (stockTab === 'coming-soon') result = result.filter(p => isComingSoon(p))

    // The customer picked filters and they do match something — the stock tab
    // alone should never turn that into an empty page. Show everything the
    // selection matches instead, and say so above the results.
    if (result.length === 0 && filteredIgnoringStock.length > 0) {
      result = filteredIgnoringStock
      relaxed = true
    }

    const sorted = [...result]
    switch (sortBy) {
      case 'color':
        // Default: group by packaging colour (rainbow), vivid to pale within a family.
        sorted.sort((a, b) => compareByColor(a.id, b.id))
        break
      case 'price-desc':
        sorted.sort((a, b) => (b.sale_price ?? 0) - (a.sale_price ?? 0))
        break
      case 'price-asc':
        sorted.sort((a, b) => (a.sale_price ?? 0) - (b.sale_price ?? 0))
        break
      case 'newest':
        sorted.sort((a, b) => b.is_new - a.is_new)
        break
    }

    // "Скоро в наявності" always sinks to the bottom — for the whole catalog and
    // for any filtered list — while keeping its order within the chosen sort
    // above (Array.sort is stable, so items with an equal key keep their order).
    sorted.sort((a, b) => Number(isComingSoon(a)) - Number(isComingSoon(b)))

    return { items: sorted, relaxedStock: relaxed }
  }, [filteredIgnoringStock, stockTab, sortBy])
  
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount)
  }, [filteredProducts, displayCount])
  
  const hasMoreProducts = displayCount < filteredProducts.length
  
  const loadMoreProducts = useCallback(() => {
    setLoadingMore(true)
    setTimeout(() => {
      setDisplayCount(prev => prev + PRODUCTS_PER_PAGE)
      setLoadingMore(false)
    }, 300)
  }, [])
  
  const activeFilters = useMemo(() => {
    const filters: { label: string; onRemove: () => void }[] = []
    
    if (searchParam) {
      filters.push({
        label: `Пошук: "${searchParam}"`,
        onRemove: () => {
          const url = new URL(window.location.href)
          url.searchParams.delete('search')
          router.replace(url.pathname + url.search)
        }
      })
    }

    selectedCategories.forEach(c => {
      filters.push({
        label: c,
        onRemove: () => setSelectedCategories(prev => prev.filter(cat => cat !== c))
      })
    })

    selectedSubcategories.forEach(sc => {
      filters.push({
        label: sc,
        onRemove: () => setSelectedSubcategories(prev => prev.filter(s => s !== sc))
      })
    })

    if (onSaleOnly) {
      filters.push({
        label: 'Зі знижкою',
        onRemove: () => setOnSaleOnly(false)
      })
    }

    if (minRating > 0) {
      filters.push({
        label: `Від ${minRating} ★`,
        onRemove: () => setMinRating(0)
      })
    }

    selectedSkinTypes.forEach(st => {
      filters.push({
        label: st,
        onRemove: () => setSelectedSkinTypes(prev => prev.filter(s => s !== st))
      })
    })
    
    selectedBrands.forEach(b => {
      filters.push({
        label: b,
        onRemove: () => setSelectedBrands(prev => prev.filter(br => br !== b))
      })
    })
    
    selectedVolumes.forEach(v => {
      filters.push({
        label: v,
        onRemove: () => setSelectedVolumes(prev => prev.filter(vol => vol !== v))
      })
    })
    
    selectedIngredients.forEach(i => {
      filters.push({
        label: i,
        onRemove: () => setSelectedIngredients(prev => prev.filter(ing => ing !== i))
      })
    })
    
    return filters
  }, [searchParam, selectedCategories, selectedSubcategories, onSaleOnly, minRating, selectedSkinTypes, selectedBrands, selectedVolumes, selectedIngredients])
  
  const clearAllFilters = useCallback(() => {
    setPriceRange([0, maxPrice])
    setSelectedCategories([])
    setSelectedSubcategories([])
    setOnSaleOnly(false)
    setMinRating(0)
    setSelectedSkinTypes([])
    setSelectedBrands([])
    setSelectedVolumes([])
    setSelectedIngredients([])
    if (searchParam) {
      const url = new URL(window.location.href)
      url.searchParams.delete('search')
      router.replace(url.pathname + url.search)
    }
  }, [maxPrice, searchParam, router])
  
  const pageTitle = useMemo(() => {
    if (searchParam) return `Пошук: "${searchParam}"`
    if (brandParam) return brandParam
    if (newParam === 'true') return 'Новинки'
    if (exclusiveParam === 'true') return 'Ексклюзив'
    if (saleParam === 'true') return 'Знижки'
    if (tagParam) return tagParam
    if (subcategoryParam && !categoryParam) return subcategoryParam
    if (concernParam && CONCERN_KEYWORDS[concernParam]) return CONCERN_KEYWORDS[concernParam].label
    if (stockParam === 'coming-soon') return 'Скоро в наявності'
    if (stockParam === 'in-stock') return 'В наявності'
    if (categoryParam) {
      const categoryMap: Record<string, string> = {
        'face': 'Обличчя',
        'body': 'Тіло',
        'hair': 'Волосся',
        'health': 'Health & Care',
        'devices': 'Косметичні девайси',
        'testers': 'Тестери та аксесуари',
        'accessories': 'Тестери та аксесуари',
        'makeup': 'Макіяж',
      }
      return categoryMap[categoryParam.toLowerCase()] || categoryParam
    }
    return 'Каталог'
  }, [categoryParam, subcategoryParam, searchParam, brandParam, stockParam, newParam, exclusiveParam, concernParam, saleParam, tagParam])

  const visibleBrands = showAllBrands ? filterOptions.brands : filterOptions.brands.slice(0, 8)
  // Use real values from data when they exist; otherwise the fixed 5-type list.
  const skinTypeChoices = filterOptions.skinTypes.length > 0 ? filterOptions.skinTypes : SKIN_TYPE_OPTIONS
  const visibleSkinTypes = showAllSkinTypes ? skinTypeChoices : skinTypeChoices.slice(0, 6)
  // When a category filter is active, we narrow the subcategories to that category
  // (typically <10), so it makes sense to show them all without a "Show more" cutoff.
  // Without a category filter we keep the 8-item cap to avoid a wall of text.
  const visibleSubcategories = (showAllSubcategories || categoryParam)
    ? filterOptions.subcategories
    : filterOptions.subcategories.slice(0, 8)
  const visibleIngredients = showAllIngredients ? filterOptions.ingredients : filterOptions.ingredients.slice(0, 8)

  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      {/* Hero Banner */}
      <section className="relative h-[200px] sm:h-[250px] overflow-hidden bg-[#E2F9FF]">
        <FloatingIcons count={7} offset={3} />
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px] h-full flex flex-col justify-end pb-8">
          <nav className="flex items-center gap-2 mb-4 text-[14px]">
            <Link href="/" className="text-[#666] hover:text-black transition-colors">Головна</Link>
            <span className="text-[#999]">&gt;</span>
            <span className="text-black">{pageTitle}</span>
          </nav>
          <h1 className="font-bebas text-[48px] sm:text-[64px] lg:text-[80px] leading-[1] text-black uppercase">
            {pageTitle}
          </h1>
        </div>
      </section>
      
      {/* Stock-status tabs — pill-shaped, sit just below the hero, sticky-ish above grid */}
      <section className="pt-6 sm:pt-8">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div
            role="tablist"
            aria-label="Статус наявності"
            className="inline-flex items-center gap-1 p-1 rounded-full bg-white border border-[#E5E5E5] shadow-[0_4px_16px_rgba(96,70,163,0.06)]"
          >
            {([
              { v: 'all',         label: 'Усі' },
              { v: 'in-stock',    label: 'В наявності' },
              { v: 'coming-soon', label: 'Скоро в наявності' },
            ] as const)
              // Hide a tab the current selection has nothing in — it could only
              // lead to an empty page. When nothing matches at all, keep them
              // all so the control doesn't vanish entirely.
              .filter(opt => stockCounts.all === 0 || stockCounts[opt.v] > 0)
              .map(opt => {
              const active = stockTab === opt.v
              return (
                <button
                  key={opt.v}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStockTab(opt.v)}
                  className={`px-4 sm:px-5 h-9 rounded-full text-[13px] sm:text-[14px] font-gilroy font-semibold tracking-wide uppercase transition-colors duration-200 whitespace-nowrap ${
                    active
                      ? 'bg-[#4348AE] text-white shadow-[0_4px_14px_rgba(96,70,163,0.32)]'
                      : 'text-black/70 hover:text-black'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Catalog Content */}
      <section className="py-8 sm:py-12">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Filters Sidebar */}
            <aside className="w-full lg:w-[260px] flex-shrink-0">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden w-[150px] h-[40px] px-[24px] py-[10px] border border-black flex items-center gap-[10px] mb-6"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="font-gilroy text-[14px]">ФІЛЬТРИ</span>
              </button>
              
              <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block space-y-6`}>
                <p className="font-gilroy text-[18px] leading-[24px] text-black">
                  Результати: {filteredProducts.length}
                </p>
                
                {/* Category filter */}
                {filterOptions.categories.length > 0 && (
                  <FilterSection title="Категорія" isOpen={categoryOpen} onToggle={() => setCategoryOpen(!categoryOpen)}>
                    {filterOptions.categories.map(cat => (
                      <Checkbox
                        key={cat}
                        checked={selectedCategories.includes(cat)}
                        onChange={(checked) => {
                          if (checked) setSelectedCategories(prev => [...prev, cat])
                          else setSelectedCategories(prev => prev.filter(c => c !== cat))
                        }}
                        label={cat}
                      />
                    ))}
                  </FilterSection>
                )}

                {/* Subcategory / Product type filter */}
                {filterOptions.subcategories.length > 0 && (
                  <FilterSection title="Тип продукту" isOpen={subcategoryOpen} onToggle={() => setSubcategoryOpen(!subcategoryOpen)}>
                    {visibleSubcategories.map(sc => (
                      <Checkbox
                        key={sc}
                        checked={selectedSubcategories.includes(sc)}
                        onChange={(checked) => {
                          if (checked) setSelectedSubcategories(prev => [...prev, sc])
                          else setSelectedSubcategories(prev => prev.filter(s => s !== sc))
                        }}
                        label={sc}
                      />
                    ))}
                    {filterOptions.subcategories.length > 8 && (
                      <button
                        onClick={() => setShowAllSubcategories(!showAllSubcategories)}
                        className="text-[14px] text-[#4348AE] hover:underline mt-2"
                      >
                        {showAllSubcategories ? 'Показати менше' : `Показати ще (${filterOptions.subcategories.length - 8})`}
                      </button>
                    )}
                  </FilterSection>
                )}

                {/* On Sale filter */}
                <FilterSection title="Знижки" isOpen={saleOpen} onToggle={() => setSaleOpen(!saleOpen)}>
                  <Checkbox
                    checked={onSaleOnly}
                    onChange={setOnSaleOnly}
                    label="Тільки зі знижкою"
                  />
                </FilterSection>

                {/* Brand filter */}
                {filterOptions.brands.length > 0 && (
                  <FilterSection title="Бренд" isOpen={brandOpen} onToggle={() => setBrandOpen(!brandOpen)}>
                    {visibleBrands.map(brand => (
                      <Checkbox
                        key={brand}
                        checked={selectedBrands.includes(brand)}
                        onChange={(checked) => {
                          if (checked) setSelectedBrands(prev => [...prev, brand])
                          else setSelectedBrands(prev => prev.filter(b => b !== brand))
                        }}
                        label={brand}
                      />
                    ))}
                    {filterOptions.brands.length > 8 && (
                      <button
                        onClick={() => setShowAllBrands(!showAllBrands)}
                        className="text-[14px] text-[#4348AE] hover:underline mt-2"
                      >
                        {showAllBrands ? 'Показати менше' : `Показати ще (${filterOptions.brands.length - 8})`}
                      </button>
                    )}
                  </FilterSection>
                )}
                
                {/* Ingredients filter */}
                {filterOptions.ingredients.length > 0 && (
                  <FilterSection title="За активними компонентами" isOpen={ingredientsOpen} onToggle={() => setIngredientsOpen(!ingredientsOpen)}>
                    {visibleIngredients.map(ing => (
                      <Checkbox
                        key={ing}
                        checked={selectedIngredients.includes(ing)}
                        onChange={(checked) => {
                          if (checked) setSelectedIngredients(prev => [...prev, ing])
                          else setSelectedIngredients(prev => prev.filter(i => i !== ing))
                        }}
                        label={ing}
                      />
                    ))}
                    {filterOptions.ingredients.length > 8 && (
                      <button
                        onClick={() => setShowAllIngredients(!showAllIngredients)}
                        className="text-[14px] text-[#4348AE] hover:underline mt-2"
                      >
                        {showAllIngredients ? 'Показати менше' : `Показати ще (${filterOptions.ingredients.length - 8})`}
                      </button>
                    )}
                  </FilterSection>
                )}
                
                {/* Volume filter */}
                {filterOptions.volumes.length > 0 && (
                  <FilterSection title="Розмір" isOpen={volumeOpen} onToggle={() => setVolumeOpen(!volumeOpen)}>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.volumes.map(vol => (
                        <VolumeButton
                          key={vol}
                          label={vol}
                          selected={selectedVolumes.includes(vol)}
                          onClick={() => {
                            if (selectedVolumes.includes(vol)) {
                              setSelectedVolumes(selectedVolumes.filter(v => v !== vol))
                            } else {
                              setSelectedVolumes([...selectedVolumes, vol])
                            }
                          }}
                        />
                      ))}
                    </div>
                  </FilterSection>
                )}

                {/* Skin Type filter — навмисне останній фільтр; показуємо завжди */}
                <FilterSection title="За типом шкіри" isOpen={skinTypeOpen} onToggle={() => setSkinTypeOpen(!skinTypeOpen)}>
                  {visibleSkinTypes.map(st => (
                    <Checkbox
                      key={st}
                      checked={selectedSkinTypes.includes(st)}
                      onChange={(checked) => {
                        if (checked) setSelectedSkinTypes(prev => [...prev, st])
                        else setSelectedSkinTypes(prev => prev.filter(s => s !== st))
                      }}
                      label={st}
                    />
                  ))}
                  {skinTypeChoices.length > 6 && (
                    <button
                      onClick={() => setShowAllSkinTypes(!showAllSkinTypes)}
                      className="text-[14px] text-[#4348AE] hover:underline mt-2"
                    >
                      {showAllSkinTypes ? 'Показати менше' : `Показати ще (${skinTypeChoices.length - 6})`}
                    </button>
                  )}
                </FilterSection>
              </div>
            </aside>
            
            {/* Products Grid */}
            <div className="flex-1">
              {/* Active filters and sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  {activeFilters.map((filter, index) => (
                    <ActiveFilterTag key={index} label={filter.label} onRemove={filter.onRemove} />
                  ))}
                  {activeFilters.length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[14px] text-[#666] hover:text-black underline"
                    >
                      Очистити всі
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-gilroy text-[14px] text-[#666]">Сортувати:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'color' | 'price-desc' | 'price-asc' | 'newest')}
                    className="font-gilroy text-[14px] text-black bg-transparent border-none outline-none cursor-pointer"
                  >
                    <option value="color">За кольором</option>
                    <option value="price-desc">За ціною (від більшої до меншої)</option>
                    <option value="price-asc">За ціною (від меншої до більшої)</option>
                    <option value="newest">Новинки</option>
                  </select>
                </div>
              </div>
              
              {/* Said out loud when the stock tab was stepped over, so the list
                  never silently contradicts the tab that looks selected. */}
              {relaxedStock && !loading && (
                <div className="mb-5 rounded-[14px] bg-[#FFE8F0] px-4 py-3">
                  <p className="font-gilroy text-[14px] text-[#B03060]">
                    {stockTab === 'coming-soon'
                      ? 'Серед «Скоро в наявності» за цим фільтром нічого немає — показуємо всі підхожі товари, зокрема ті, що вже в наявності.'
                      : 'Серед «В наявності» за цим фільтром нічого немає — показуємо всі підхожі товари, зокрема ті, що будуть скоро.'}
                  </p>
                </div>
              )}

              {/* Products */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-[#F8F7FB] rounded-[24px]">
                  <svg className="w-16 h-16 mx-auto text-[#BBBBBB] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="font-bebas text-[28px] text-black mb-3">
                    {searchParam ? `За запитом "${searchParam}" нічого не знайдено` : 'Товарів не знайдено'}
                  </h3>
                  <p className="text-[#666] mb-6 max-w-md mx-auto font-gilroy text-[15px]">
                    Спробуйте змінити параметри пошуку або очистити фільтри
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="inline-block px-8 py-3 bg-[#4348AE] text-white font-semibold rounded-lg hover:bg-[#373B8A] transition-colors text-[14px]"
                  >
                    Очистити фільтри
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-3 sm:gap-x-6 gap-y-6 sm:gap-y-10">
                    {displayedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                    ))}
                  </div>
                  
                  {/* Show More Button */}
                  {hasMoreProducts && (
                    <div className="mt-10 text-center">
                      <p className="font-gilroy text-[14px] text-[#666] mb-4">
                        Показано {displayedProducts.length} з {filteredProducts.length} товарів
                      </p>
                      <button
                        onClick={loadMoreProducts}
                        disabled={loadingMore}
                        className="inline-flex items-center justify-center h-[50px] px-10 border-2 border-black text-black font-semibold text-[15px] uppercase tracking-[0.05em] hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                      >
                        {loadingMore ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Завантаження...
                          </>
                        ) : (
                          `Показати ще ${Math.min(PRODUCTS_PER_PAGE, filteredProducts.length - displayCount)} товарів`
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {exclusiveProducts.length > 0 && (
        <ExclusiveProducts products={exclusiveProducts} />
      )}
      
      <ReviewsSection />
      <SubscribeSection />
      <DeliverySection />
      <Footer />
    </main>
  )
}
