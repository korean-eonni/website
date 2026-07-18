'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import SubscribeSection from '@/components/sections/SubscribeSection'
import DeliverySection from '@/components/sections/DeliverySection'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/contexts/CartContext'
import WishlistButton from '@/components/WishlistButton'

type Product = {
  id: string
  name: string
  short_description: string | null
  long_description: string | null
  sale_price: number | null
  original_price: number | null
  discount_amount: number | null
  category: string | null
  subcategory: string | null
  brand: string | null
  image_url: string | null
  image_path: string | null
  image_url_2?: string | null
  image_url_3?: string | null
  image_url_4?: string | null
  image_url_5?: string | null
  image_url_6?: string | null
  image_url_7?: string | null
  image_url_8?: string | null
  image_url_9?: string | null
  image_url_10?: string | null
  image_url_11?: string | null
  image_url_12?: string | null
  volume_options?: string | null
  rating?: number | null
  review_count?: number | null
  stock_quantity: number | null
  tags?: string | null
  ingredients: string | null
  weight_grams?: number | null
  skin_type?: string | null
  // Rich sections — one per product-page tab (synced from the sheet)
  usage_instructions?: string | null
  clinical_proof?: string | null
  solves_problems?: string | null
  key_ingredients?: string | null
  fit_skin?: string | null
  compatibility?: string | null
}

type SimilarProduct = {
  id: string
  name: string
  sale_price: number | null
  original_price: number | null
  discount_amount: number | null
  image_url: string | null
  image_path: string | null
  is_new: number
  subcategory: string | null
  brand: string | null
  tags: string | null
  skin_type: string | null
  coming_soon?: number | null
}

// ============ STAR RATING ============
// Stars are always shown fully filled (5/5) per design — the underlying review
// data still drives the count link below.
function StarRating({ reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="#E57373"
            stroke="#E57373"
            strokeWidth="1.5"
          >
            <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.26l-4.94 2.45.94-5.5-4-3.9 5.53-.8L10 1.5z" />
          </svg>
        ))}
      </div>
      <span className="text-[16px] font-normal text-black">5.0</span>
      <Link href="#reviews" className="text-[16px] text-[#7C83C9] underline">
        ({reviewCount} відгуків)
      </Link>
    </div>
  )
}

// ============ QUANTITY SELECTOR ============
function QuantitySelector({ 
  quantity, 
  onQuantityChange 
}: { 
  quantity: number
  onQuantityChange: (qty: number) => void 
}) {
  return (
    <div className="flex items-center border border-[#BBBBBB] w-[120px] h-[40px] justify-between px-[10px]">
      <button
        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
        className="text-[20px] text-black hover:text-[#7C83C9] transition-colors"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="text-[16px] font-normal text-black">{quantity}</span>
      <button
        onClick={() => onQuantityChange(quantity + 1)}
        className="text-[20px] text-black hover:text-[#7C83C9] transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}

// ============ VOLUME SELECTOR ============
function VolumeSelector({ 
  options, 
  selected, 
  onSelect 
}: { 
  options: string[]
  selected: string
  onSelect: (option: string) => void 
}) {
  if (!options.length) return null
  
  return (
    <div className="flex gap-3">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`h-[40px] px-[25px] py-[11px] border text-[16px] font-normal transition-colors ${
            selected === option 
              ? 'border-black bg-black text-white' 
              : 'border-[#BBBBBB] bg-[#E2F9FF] text-black hover:border-black'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

// ============ IMAGE GALLERY ============
function ImageGallery({ images, productName }: { images: string[]; productName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const validImages = images.filter(Boolean)
  
  if (!validImages.length) {
    return (
      <div className="w-full aspect-square bg-[#F8F7FB] rounded-[20px] flex items-center justify-center">
        <span className="text-gray-400">No image</span>
      </div>
    )
  }

  const goToPrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full aspect-square bg-white rounded-[20px] overflow-hidden border border-[#E5E5E5]">
        <Image
          src={validImages[selectedIndex]}
          alt={productName}
          fill
          className="object-contain p-4"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
        
        {validImages.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-[48px] h-[48px] bg-[#E2F9FF] rounded-none flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
              aria-label="Previous image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-[48px] h-[48px] bg-[#E2F9FF] rounded-none flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
              aria-label="Next image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {validImages.length > 1 && (
        // Thumbnails stretch to fill the full row width (equal share each) so there's
        // never empty space to the right — regardless of how many extra photos a
        // product has. Square via aspect-square; capped at 6 like before.
        <div className="flex gap-3">
          {validImages.slice(0, 6).map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-1 min-w-0 aspect-square rounded-[8px] overflow-hidden border-2 transition-colors ${
                selectedIndex === index ? 'border-[#7C83C9]' : 'border-transparent'
              }`}
            >
              <Image
                src={img}
                alt={`${productName} - зображення ${index + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 25vw, 45vw"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ BREADCRUMBS ============
function Breadcrumbs({ 
  category, 
  subcategory 
}: { 
  category: string | null
  subcategory: string | null 
}) {
  return (
    <nav className="flex items-center gap-2 text-[16px] sm:text-[18px] leading-[24px] mb-6 flex-wrap">
      <Link 
        href="/" 
        className="font-semibold text-black hover:text-[#7C83C9] transition-colors"
      >
        Головна
      </Link>
      <span className="text-[#999999]">&gt;</span>
      {category && (
        <>
          <Link 
            href={`/catalog?category=${encodeURIComponent(category)}`}
            className="font-semibold text-black hover:text-[#7C83C9] transition-colors"
          >
            {category}
          </Link>
          <span className="text-[#999999]">&gt;</span>
        </>
      )}
      {subcategory && (
        <Link
          href={`/catalog?subcategory=${encodeURIComponent(subcategory)}`}
          className="font-normal text-black hover:text-[#7C83C9] transition-colors"
        >
          {subcategory}
        </Link>
      )}
    </nav>
  )
}

// ============ PRODUCT TABS ============
// Single bordered box with horizontal tab strip on top and content below.
// Visual style mirrors the original Характеристики/Опис/Склад tabs — same
// border, same Bebas typography, same active-color (#6046A3) — just six tabs
// instead of three. Default: ОПИС selected.
type TabId =
  | 'description'
  | 'ingredients'
  | 'skin'
  | 'needs'
  | 'clinical'
  | 'usage'
  | 'compatibility'

function ProductTabs({ product }: { product: Product }) {
  // Each tab maps to its own field synced from the Google Sheet. Only tabs that
  // actually have content are shown, so products with partial data never render
  // empty or placeholder tabs. ОПИС always falls back to a short notice.
  const allSections: Array<{ id: TabId; label: string; content: string }> = [
    { id: 'description',   label: 'ОПИС',                  content: product.long_description?.trim() || product.short_description?.trim() || 'Опис товару буде доданий найближчим часом.' },
    { id: 'usage',         label: 'СПОСІБ ЗАСТОСУВАННЯ',   content: product.usage_instructions?.trim() || '' },
    { id: 'skin',          label: 'ДЛЯ ЯКОЇ ШКІРИ',        content: product.fit_skin?.trim() || product.skin_type?.trim() || '' },
    { id: 'needs',         label: 'ЯКІ ПОТРЕБИ ВИРІШУЄ',   content: product.solves_problems?.trim() || '' },
    { id: 'clinical',      label: 'КЛІНІЧНО ПІДТВЕРДЖЕНО', content: product.clinical_proof?.trim() || '' },
    { id: 'compatibility', label: 'СУМІСНІСТЬ/ЗАСТЕРЕЖЕННЯ', content: product.compatibility?.trim() || '' },
    { id: 'ingredients',   label: 'СКЛАД',                 content: product.key_ingredients?.trim() || '' },
  ]
  const sections = allSections.filter((s) => s.content)

  const [activeTab, setActiveTab] = useState<TabId>('description')
  const active = sections.find((s) => s.id === activeTab) ?? sections[0]

  // Desktop tab strip uses equal-width columns (grid). The base font is 20px, but a
  // product with all 7 tabs makes the columns narrow enough that the longest label
  // would wrap. To keep every label on ONE line, measure the widest label against its
  // column and shrink the font by the minimum amount needed (never below 12px). Only
  // runs at the lg breakpoint (where the grid is active); below that the strip scrolls.
  const stripRef = useRef<HTMLDivElement>(null)
  const [fitFont, setFitFont] = useState<number | null>(null)
  const labelsKey = sections.map((s) => s.id).join('|')
  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    let raf = 0
    const fit = () => {
      if (!strip.isConnected) return
      // Grid (equal columns) is only active at lg; otherwise the strip scrolls — no shrink.
      if (typeof window === 'undefined' || !window.matchMedia('(min-width: 1024px)').matches) {
        setFitFont(null)
        return
      }
      const BASE = 20
      const MIN = 12
      const btns = Array.from(strip.children) as HTMLElement[]
      if (!btns.length) return
      const cs = getComputedStyle(btns[0])
      const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0)
      const ctx = document.createElement('canvas').getContext('2d')
      if (!ctx) return
      const lsEm = -0.025 // matches tracking-tight
      let font = BASE
      btns.forEach((b) => {
        const label = (b.textContent || '').trim()
        ctx.font = `${cs.fontWeight} ${BASE}px ${cs.fontFamily}`
        const textW = ctx.measureText(label).width + lsEm * BASE * label.length
        const avail = b.clientWidth - padX - 2
        if (avail > 0 && textW > avail) {
          font = Math.min(font, Math.floor((BASE * avail) / textW))
        }
      })
      setFitFont(font < BASE ? Math.max(MIN, font) : null)
    }
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(fit)
    }
    schedule()
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule)
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', schedule)
    }
  }, [labelsKey])

  return (
    <div className="border border-[#BBBBBB]">
      {/* Horizontal tab strip — scrolls on small screens; equal-width columns at lg
          with an auto-fitted font (see effect above) so every label stays on one line. */}
      <div
        ref={stripRef}
        className="flex lg:grid lg:grid-flow-col lg:auto-cols-fr items-stretch overflow-x-auto lg:overflow-visible scrollbar-hide border-b border-[#BBBBBB]"
      >
        {sections.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={fitFont ? { fontSize: `${fitFont}px` } : undefined}
            className={`flex items-center justify-center text-center flex-shrink-0 whitespace-nowrap px-4 sm:px-3 lg:px-3 h-[50px] sm:min-h-[56px] font-bebas text-[15px] sm:text-[17px] lg:text-[20px] leading-none tracking-tight transition-colors ${
              active.id === tab.id
                ? 'text-[#6046A3] border-b-2 border-[#6046A3] -mb-px'
                : 'text-[#C1C1C1] hover:text-[#999999]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — preserves the sheet's line breaks / bullet formatting */}
      <div className="p-6 sm:p-[40px_60px] min-h-[200px] lg:min-h-[280px] text-[15px] sm:text-[16px] leading-[1.65] text-black">
        <p className="whitespace-pre-line">{active.content}</p>
      </div>
    </div>
  )
}

// ============ FAQ SECTION ============
type FAQItem = {
  question: string
  answer: string
}

// Build a "коли краще використовувати" answer from the product's usage instructions
// (column "Спосіб застосування"). Derived live, so it always matches the sheet.
function whenToUseAnswer(usage?: string | null, name?: string): string {
  const u = (usage || '').toLowerCase()
  if (!u.trim()) {
    return 'Засіб можна використовувати як вранці, так і ввечері — у складі вашої повсякденної рутини догляду. Якщо у формулі є кислоти чи ретиноїди, краще застосовувати ввечері та завершувати ранковий догляд засобом із SPF.'
  }
  const n = (name || '').toLowerCase()
  const has = (...a: string[]) => a.some((s) => u.includes(s))
  const inName = (...a: string[]) => a.some((s) => n.includes(s))

  const morning = has('вранц', 'зранку', 'ранков', 'ранку', 'вдень')
  const evening = has('ввечері', 'увечері', 'вечірн', 'на ніч', 'перед сном', 'вночі')
  const acids = /\b(aha|bha|pha)\b/.test(n + ' ' + u)
  const isShampoo = has('шампун') || inName('shampoo', 'шампун')
  const isSpf = inName('spf', 'sun cream', 'sunscreen', 'сонцезахис') || has('сонцезахисний крем')
  const isExfoliant =
    acids || has('пілінг', 'ексфоліац', 'відлущ', 'саліцилов', 'гліколев', 'янтарна кислота', 'ретинол', 'ретиноїд') || inName('peeling', 'пілінг', 'retinol', 'ретинол')
  const isSupplement =
    inName('gummy', 'jelly stick', 'probiotic', 'collagen 5000') ||
    has('таблет', 'мармелад', 'натще', 'під час їжі', 'розжув', 'запива', 'добову порцію', 'рекомендована добова', 'дієтична добавка')

  let freq = ''
  const wk = u.match(/(\d+)\s*[–-]?\s*(\d+)?\s*раз[а-яіїє]*\s*(на|в)\s*тижд/)
  if (has('щоденн', 'щодня', 'кожен день', 'кожного дня')) freq = 'щодня'
  else if (wk) freq = wk[2] ? `${wk[1]}–${wk[2]} рази на тиждень` : `${wk[1]} раз(и) на тиждень`

  let timing: string
  if (isSupplement) timing = evening ? 'ввечері, перед сном' : 'у будь-який зручний час, дотримуючись добової порції'
  else if (isShampoo) timing = 'під час миття волосся'
  else if (isSpf) timing = 'вранці, останнім кроком догляду'
  else if (isExfoliant) timing = 'ввечері'
  else if (morning && evening) timing = 'і вранці, і ввечері'
  else if (evening) timing = 'ввечері, у вечірній рутині'
  else if (morning) timing = 'вранці'
  else timing = 'як вранці, так і ввечері'

  let ans = `Найкраще використовувати ${timing}${freq ? ' — ' + freq : ''}.`
  if (isExfoliant) ans += ' У складі активні кислоти/ретиноїди, тож застосовуйте ввечері, а вранці завершуйте догляд засобом із SPF.'
  else if (isSpf) ans += ' Оновлюйте кожні 2–3 години за активного перебування на сонці.'
  return ans
}

// Q "чутлива шкіра" ← column "Для якої шкіри підходить"
function sensitiveSkinAnswer(fit?: string | null): string {
  const f = (fit || '').toLowerCase()
  if (!f.trim()) return 'Засіб делікатний і загалом підходить для чутливої шкіри. Перед першим використанням зробіть тест на невеликій ділянці (наприклад, на згині ліктя) і зачекайте 24 години.'
  if (f.includes('чутлив')) return 'Так, засіб підходить і для чутливої шкіри.'
  if (/всі типи|всіх типів|будь-як.{0,5}тип|для всіх типів/.test(f)) return 'Так, підходить для всіх типів шкіри, включно з чутливою. Перед першим застосуванням рекомендуємо тест на невеликій ділянці.'
  const types: string[] = []
  if (f.includes('жирн')) types.push('жирної')
  if (f.includes('сух')) types.push('сухої')
  if (f.includes('комбінован')) types.push('комбінованої')
  if (f.includes('нормальн')) types.push('нормальної')
  if (f.includes('проблемн')) types.push('проблемної')
  if (f.includes('зріл') || f.includes('віков')) types.push('зрілої')
  if (f.includes('зневоднен')) types.push('зневодненої')
  if (types.length) return `Засіб найкраще підходить для ${types.join(', ')} шкіри. Для чутливої шкіри рекомендуємо спершу зробити тест на невеликій ділянці.`
  return 'Для чутливої шкіри рекомендуємо перед застосуванням зробити тест на невеликій ділянці шкіри й зачекати 24 години.'
}

// Q "як часто" ← column "Спосіб застосування"
function frequencyAnswer(usage?: string | null): string {
  const u = (usage || '').toLowerCase()
  if (!u.trim()) return 'Користуйтесь засобом згідно з рекомендаціями на упаковці — зазвичай у складі повсякденної рутини догляду.'
  const perDay = u.match(/(\d+)\s*[–-]?\s*(\d+)?\s*раз[а-яіїє]*\s*(на|в)\s*(день|добу)/)
  const wk = u.match(/(\d+)\s*[–-]?\s*(\d+)?\s*раз[а-яіїє]*\s*(на|в)\s*тижд/)
  if (/щоденн|щодня|кожен день|кожного дня/.test(u)) {
    if (perDay) return `Засіб підходить для щоденного застосування — ${perDay[2] ? perDay[1] + '–' + perDay[2] : perDay[1]} раз(и) на день.`
    return 'Засіб підходить для щоденного застосування — використовуйте його регулярно у складі своєї рутини догляду.'
  }
  if (wk) return `Рекомендована частота — ${wk[2] ? wk[1] + '–' + wk[2] + ' рази' : wk[1] + ' раз(и)'} на тиждень.`
  if (perDay) return `Використовуйте ${perDay[2] ? perDay[1] + '–' + perDay[2] : perDay[1]} раз(и) на день згідно зі способом застосування.`
  return 'Користуйтесь засобом регулярно, згідно з рекомендаціями зі способу застосування.'
}

// Q "час до результату" ← column "Клінічно підтверджено"
function weekWord(n: number): string {
  const a = n % 10, b = n % 100
  if (a === 1 && b !== 11) return 'тиждень'
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return 'тижні'
  return 'тижнів'
}
function resultsTimeAnswer(clinical?: string | null, name?: string, subcategory?: string | null): string {
  // Masks give an immediate effect — override with a "after first use" answer.
  const n = (name || '').toLowerCase()
  const sub = (subcategory || '').toLowerCase()
  const isMask = (/маск|mask/.test(n) || sub.includes('маск')) && !/applicator|аплікатор|brush|лопатк|щітк/.test(n)
  if (isMask) return 'Перший результат помітний вже після першого використання.'

  const c = (clinical || '').toLowerCase()
  if (!c.trim()) return 'Перші результати зазвичай помітні через 2–3 тижні регулярного використання; для максимального ефекту рекомендуємо курс 4–6 тижнів.'
  const oneUse = /після\s*1\s*використан|з першого застосуванн|вже після першого|після першого використан/.test(c)
  const weeks = /(?:після|за|через)\s*(\d+)\s*(?:[–-]\s*(\d+)\s*)?тижн/.exec(c)
  const parts: string[] = []
  if (oneUse) parts.push('частину ефекту помітно вже після першого застосування')
  if (weeks) {
    const w = weeks[2] ? `${weeks[1]}–${weeks[2]} ${weekWord(+weeks[2])}` : `${weeks[1]} ${weekWord(+weeks[1])}`
    parts.push(`виразніший результат — приблизно за ${w} регулярного застосування`)
  }
  if (parts.length) return `За даними виробника, ${parts.join('; ')}.`
  return 'Засіб має підтверджену ефективність; перші результати зазвичай помітні через 2–3 тижні регулярного застосування, повний ефект — через 4–6 тижнів.'
}

// ── Product-type aware FAQ ──────────────────────────────────────────────
// Skincare FAQ (sensitive skin / morning-evening routine / weeks-to-result) is
// meaningless for ingestible supplements (gummies, collagen sticks, probiotics)
// or for passive tools (towel, sponge, brush). For those we show a tailored set
// of questions with correct, researched answers instead of guessed skincare text.
type FaqProduct = {
  usage_instructions?: string | null
  fit_skin?: string | null
  clinical_proof?: string | null
  subcategory?: string | null
  category?: string | null
  name: string
}

function asSentence(s: string): string {
  const t = (s || '').trim()
  if (!t) return ''
  const capped = t.charAt(0).toUpperCase() + t.slice(1)
  return /[.!?…]$/.test(capped) ? capped : capped + '.'
}

function faqProductType(p: FaqProduct): 'supplement' | 'tool' | 'skincare' {
  const n = (p.name || '').toLowerCase()
  const cat = (p.category || '').toLowerCase()
  // Passive tools / accessories — but NOT treatment pads (those answer skincare Qs well).
  const isTool = /(towel|рушник|sponge|спонж|brush|пензл|щітк|applicator|аплікатор|spatula|лопатк|шпатель)/.test(n)
  if (isTool && !/\bpad\b|пади|пад[іиа]/.test(n)) return 'tool'
  // Ingestible supplements / inner beauty.
  const ingestible = /gummy|мармелад|jelly stick|желейн.{0,4}стік|probiotic|пробіотик|синбіотик|таблетк|драже|саше|sachet|\binner\b|collagen\s*\d{3,}|колаген\s*\d{3,}/.test(n)
  const isHealthCare = cat.includes('health') && cat.includes('care')
  if (isHealthCare || ingestible) {
    const topical = /крем|cream|сироват|serum|тонер|toner|есенц|essence|лосьйон|lotion|cleansing|очищенн|маск|mask|гель|gel/.test(n)
    if (!topical) return 'supplement'
  }
  return 'skincare'
}

function supplementKind(n: string): 'sleep' | 'probiotic' | 'glutathione' | 'collagen' | 'generic' {
  const s = n.toLowerCase()
  if (/melamate|мелатонін|melatonin|sleep|для сну|\bсну\b|\bсон\b/.test(s)) return 'sleep'
  if (/probiotic|пробіотик|синбіотик|lactofit|лактоф/.test(s)) return 'probiotic'
  if (/glutathione|глутатіон/.test(s)) return 'glutathione'
  if (/collagen|колаген|biotin|біотин/.test(s)) return 'collagen'
  return 'generic'
}

function supplementFaqs(p: FaqProduct): FAQItem[] {
  const kind = supplementKind(p.name || '')
  const usage = (p.usage_instructions || '').trim()
  const clinical = (p.clinical_proof || '').trim()
  let intake: string, freq: string, when: string, results: string
  switch (kind) {
    case 'sleep':
      intake = 'Розжуйте 1 мармеладку — запивати водою не потрібно. Не перевищуйте рекомендовану добову порцію.'
      freq = '1 мармеладка на день. Засіб призначений для щоденного приймання курсом.'
      when = 'Найкраще приймати приблизно за 30–60 хвилин до сну.'
      results = 'Засіб сприяє розслабленню та легшому засинанню — багато хто відчуває ефект уже в перші дні, а стабільніший результат настає за 2–4 тижні регулярного приймання.'
      break
    case 'probiotic':
      intake = 'Висипте вміст 1 стіка безпосередньо в рот або розчиніть у воді кімнатної температури (не гарячій, щоб зберегти живі бактерії).'
      freq = '1 стік на день. Підходить для щоденного приймання курсом.'
      when = 'У будь-який зручний час; зручно приймати вранці. Головне — робити це регулярно щодня.'
      results = 'Для відчутного балансу травлення зазвичай потрібно 1–2 тижні регулярного приймання.'
      break
    case 'glutathione':
      intake = 'Приймайте 1 порцію (саше/стік) на день. Не перевищуйте рекомендовану добову норму.'
      freq = '1 порція на день, курсом.'
      when = 'У будь-який зручний час доби, бажано щодня в один і той самий час.'
      results = 'Для рівнішого тону та сяйва шкіри зазвичай потрібно 4–8 тижнів регулярного приймання.'
      break
    case 'collagen':
      intake = 'Приймайте 1 порцію (стік/желе/напій) на день: желе можна з’їсти безпосередньо, рідкий колаген — випити. Запивати не обов’язково.'
      freq = '1 порція на день. Підходить для щоденного приймання курсом.'
      when = 'У будь-який зручний час; для кращого засвоєння можна приймати натще або перед сном. Головне — регулярність.'
      results = 'Покращення пружності та зволоженості шкіри, стану волосся й нігтів зазвичай помітне за 4–8 тижнів регулярного приймання.'
      break
    default:
      intake = 'Приймайте 1 порцію на день згідно з рекомендаціями на упаковці.'
      freq = '1 порція на день, курсом.'
      when = 'У будь-який зручний час доби, бажано щодня в один і той самий час.'
      results = 'Перші результати зазвичай помітні за кілька тижнів регулярного приймання.'
  }
  // Respect explicit sheet data if the owner fills it in later.
  if (usage) { intake = asSentence(usage); freq = frequencyAnswer(usage); when = whenToUseAnswer(usage, p.name) }
  if (clinical) results = resultsTimeAnswer(clinical, p.name, p.subcategory)
  return [
    { question: 'Як приймати цей засіб?', answer: intake },
    { question: 'Як часто потрібно приймати цей засіб?', answer: freq },
    { question: 'Коли краще приймати цей засіб?', answer: when },
    { question: 'Коли з’явиться результат?', answer: results },
  ]
}

function toolFaqs(p: FaqProduct): FAQItem[] {
  const n = (p.name || '').toLowerCase()
  const usage = (p.usage_instructions || '').trim()
  const isTowel = /towel|рушник/.test(n)
  const isSponge = /sponge|спонж/.test(n)
  let use: string, sensitive: string, often: string, care: string
  if (isTowel) {
    use = 'Змочіть рушник теплою водою, нанесіть гель для душу та м’якими круговими рухами пройдіться по тілу, після чого змийте водою.'
    sensitive = 'Так. Рушник зроблений з м’якої тканини й делікатно очищує шкіру. Для чутливої шкіри використовуйте легкий натиск і не тріть надто інтенсивно.'
    often = 'Для делікатного очищення можна користуватися щодня, а для відлущування — 2–3 рази на тиждень.'
    care = 'Після використання добре прополощіть рушник і повісьте сушитися в провітрюваному місці, щоб уникнути розмноження бактерій.'
  } else if (isSponge) {
    use = 'Змочіть спонж водою до м’якості, нанесіть на нього очищувальний засіб і м’якими круговими рухами очистіть обличчя, потім ретельно сполосніть.'
    sensitive = 'Так. Спонж делікатний і підходить для чутливої шкіри — використовуйте легкі рухи без сильного натиску.'
    often = 'Можна використовувати щодня під час умивання.'
    care = 'Після кожного використання ретельно промивайте спонж і просушуйте. Рекомендуємо змінювати його кожні 1–2 місяці.'
  } else {
    use = 'Наберіть засіб на аплікатор і рівномірно розподіліть його по шкірі. Інструмент допомагає нанести продукт гігієнічно, не торкаючись його руками.'
    sensitive = 'Так. Інструмент виготовлений з гладкого делікатного матеріалу й підходить для чутливої шкіри.'
    often = 'Використовуйте щоразу під час нанесення відповідного засобу.'
    care = 'Після використання промийте інструмент водою з милом і дайте йому повністю висохнути.'
  }
  if (usage) use = asSentence(usage)
  return [
    { question: 'Як користуватися цим аксесуаром?', answer: use },
    { question: 'Чи підходить цей аксесуар для чутливої шкіри?', answer: sensitive },
    { question: 'Як часто можна використовувати?', answer: often },
    { question: 'Як доглядати за виробом?', answer: care },
  ]
}

function buildFaqs(product: FaqProduct): FAQItem[] {
  const type = faqProductType(product)
  if (type === 'supplement') return supplementFaqs(product)
  if (type === 'tool') return toolFaqs(product)
  return [
    { question: 'Чи підходить цей засіб для чутливої шкіри?', answer: sensitiveSkinAnswer(product.fit_skin) },
    { question: 'Як часто потрібно використовувати цей засіб?', answer: frequencyAnswer(product.usage_instructions) },
    { question: 'Коли краще використовувати цей засіб?', answer: whenToUseAnswer(product.usage_instructions, product.name) },
    { question: 'Скільки часу потрібно для видимого результату?', answer: resultsTimeAnswer(product.clinical_proof, product.name, product.subcategory) },
  ]
}

function FAQSection({
  product,
}: {
  product: { usage_instructions?: string | null; fit_skin?: string | null; clinical_proof?: string | null; subcategory?: string | null; category?: string | null; name: string }
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = buildFaqs(product)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <h2 className="font-bebas text-[48px] sm:text-[64px] lg:text-[80px] leading-[1] text-black mb-10">
          ПОШИРЕНІ ЗАПИТАННЯ
        </h2>

        <div className="flex flex-col">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border transition-colors ${
                openIndex === index 
                  ? 'bg-[#FFE8F0] border-[#D56989]' 
                  : 'border-[#BBBBBB]'
              } ${index > 0 ? '-mt-px' : ''}`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between px-[20px] sm:px-[30px] py-[20px] text-left"
              >
                <span className={`text-[14px] sm:text-[16px] ${openIndex === index ? 'font-semibold' : 'font-normal'} text-black pr-4`}>
                  {faq.question}
                </span>
                <span className="w-[30px] h-[30px] flex items-center justify-center flex-shrink-0">
                  {openIndex === index ? (
                    <svg width="20" height="2" viewBox="0 0 20 2" fill="none">
                      <path d="M0 1H20" stroke="black" strokeWidth="2" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 0V20M0 10H20" stroke="black" strokeWidth="2" />
                    </svg>
                  )}
                </span>
              </button>
              
              {openIndex === index && (
                <div className="px-[20px] sm:px-[30px] pb-[20px]">
                  <p className="text-[14px] sm:text-[16px] text-black leading-[1.5]">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ REVIEW TYPES ============
type Review = {
  id: string
  product_id: string
  author_name: string
  author_email: string | null
  rating: number
  title: string | null
  content: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

// ============ REVIEW FORM MODAL ============
function ReviewFormModal({ 
  isOpen, 
  onClose, 
  productId,
  productName,
  onSubmitSuccess
}: { 
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
  onSubmitSuccess: () => void
}) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          author_name: authorName,
          author_email: authorEmail || undefined,
          rating,
          title: title || undefined,
          content,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Помилка при відправці відгуку')
      }

      setSuccess(true)
      setTimeout(() => {
        onSubmitSuccess()
        onClose()
        // Reset form
        setRating(5)
        setAuthorName('')
        setAuthorEmail('')
        setTitle('')
        setContent('')
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#E2F9FF] rounded-[20px] w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
          aria-label="Закрити"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <h3 className="font-bebas text-[32px] sm:text-[40px] leading-[1.1] text-black mb-2">
          ЗАЛИШИТИ ВІДГУК
        </h3>
        <p className="text-[16px] text-gray-600 mb-6">
          Про товар: {productName}
        </p>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-[18px] font-semibold text-green-800 mb-2">Дякуємо за ваш відгук!</p>
            <p className="text-[14px] text-green-600">Він з'явиться після модерації.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Rating */}
            <div>
              <label className="block text-[14px] font-semibold text-black mb-2">
                Ваша оцінка *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill={(hoverRating || rating) >= star ? '#E57373' : 'none'}
                      stroke="#E57373"
                      strokeWidth="1.5"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="author_name" className="block text-[14px] font-semibold text-black mb-2">
                Ваше ім'я *
              </label>
              <input
                id="author_name"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
                maxLength={50}
                placeholder="Олена"
                className="w-full h-[48px] px-4 border border-[#BBBBBB] rounded-lg text-[16px] focus:border-[#7C83C9] focus:outline-none transition-colors"
              />
            </div>

            {/* Email (optional) */}
            <div>
              <label htmlFor="author_email" className="block text-[14px] font-semibold text-black mb-2">
                Email <span className="font-normal text-gray-500">(необов'язково)</span>
              </label>
              <input
                id="author_email"
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                maxLength={100}
                placeholder="email@example.com"
                className="w-full h-[48px] px-4 border border-[#BBBBBB] rounded-lg text-[16px] focus:border-[#7C83C9] focus:outline-none transition-colors"
              />
            </div>

            {/* Title (optional) */}
            <div>
              <label htmlFor="review_title" className="block text-[14px] font-semibold text-black mb-2">
                Заголовок <span className="font-normal text-gray-500">(необов'язково)</span>
              </label>
              <input
                id="review_title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Чудовий продукт!"
                className="w-full h-[48px] px-4 border border-[#BBBBBB] rounded-lg text-[16px] focus:border-[#7C83C9] focus:outline-none transition-colors"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="review_content" className="block text-[14px] font-semibold text-black mb-2">
                Ваш відгук *
              </label>
              <textarea
                id="review_content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                placeholder="Поділіться своїм досвідом використання цього товару..."
                className="w-full px-4 py-3 border border-[#BBBBBB] rounded-lg text-[16px] focus:border-[#7C83C9] focus:outline-none transition-colors resize-none"
              />
              <p className="mt-1 text-[12px] text-gray-500">
                {content.length}/2000 символів (мінімум 10)
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-[14px] text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[50px] bg-[#BCC2F4] text-black font-semibold text-[16px] uppercase tracking-wide hover:bg-[#A8AFEB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Відправляємо...' : 'Відправити відгук'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ============ PRODUCT REVIEWS SECTION ============
const REVIEW_BACKGROUNDS = ['#FFE8F0', '#FFFFD5', '#E2F9FF']

function ProductReviewsSection({ 
  productId, 
  productName,
  reviews,
  onReviewSubmitted
}: { 
  productId: string
  productName: string
  reviews: Review[]
  onReviewSubmitted: () => void
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())

  const toggleExpand = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews)
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId)
    } else {
      newExpanded.add(reviewId)
    }
    setExpandedReviews(newExpanded)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <section id="reviews" className="bg-[#E2F9FF] py-16 sm:py-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="flex items-start sm:items-end justify-between gap-4 sm:gap-6 mb-12 flex-col sm:flex-row">
          <h2 className="font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Відгуки {reviews.length > 0 && <span className="text-[#999999]">({reviews.length})</span>}
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-[50px] px-[61px] py-[14px] border border-black text-black font-semibold text-[16px] uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
          >
            Залишити відгук
          </button>
        </div>

        {reviews.length === 0 ? (
          // Empty state
          <div className="bg-[#F8F7FB] rounded-[20px] p-8 sm:p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#BCC2F4] rounded-full flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-[24px] font-semibold text-black mb-3">
              Поки немає відгуків
            </h3>
            <p className="text-[16px] text-gray-600 mb-6 max-w-md mx-auto">
              Будьте першим, хто залишить відгук про цей товар! Ваша думка допоможе іншим покупцям зробити правильний вибір.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-[50px] px-8 items-center justify-center bg-[#BCC2F4] text-black font-semibold text-[16px] uppercase tracking-wide hover:bg-[#A8AFEB] transition-colors"
            >
              Написати перший відгук
            </button>
          </div>
        ) : (
          // Reviews grid
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review, index) => {
                const isExpanded = expandedReviews.has(review.id)
                const shouldTruncate = review.content.length > 200
                
                return (
                  <div
                    key={review.id}
                    className="relative rounded-[20px] p-[30px] pt-[30px] pb-[40px]"
                    style={{ backgroundColor: REVIEW_BACKGROUNDS[index % 3] }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-gilroy text-[16px] leading-[21px] font-medium text-black">
                        {formatDate(review.created_at)}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            width="18"
                            height="18"
                            viewBox="0 0 20 20"
                            fill={star <= review.rating ? '#E57373' : 'none'}
                            stroke="#E57373"
                            strokeWidth="1.5"
                          >
                            <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.26l-4.94 2.45.94-5.5-4-3.9 5.53-.8L10 1.5z" />
                          </svg>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                      <div className="w-[48px] h-[48px] rounded-full bg-[#7C83C9] flex items-center justify-center text-white font-semibold text-[16px]">
                        {getInitials(review.author_name)}
                      </div>
                      <div>
                        <p className="font-gilroy text-[16px] leading-[21px] font-medium text-black">
                          {review.author_name}
                        </p>
                        {review.is_verified_purchase && (
                          <p className="font-gilroy text-[14px] leading-[18px] font-normal text-green-600 flex items-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                            Підтверджена покупка
                          </p>
                        )}
                      </div>
                    </div>

                    {review.title && (
                      <p className="mt-4 font-gilroy text-[18px] leading-[24px] font-semibold text-black">
                        {review.title}
                      </p>
                    )}

                    <p className="mt-4 font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[24px] font-normal tracking-[0.01em] text-black">
                      {shouldTruncate && !isExpanded 
                        ? `${review.content.slice(0, 200)}...` 
                        : review.content
                      }
                    </p>

                    {shouldTruncate && (
                      <button
                        onClick={() => toggleExpand(review.id)}
                        className="mt-4 font-gilroy text-[16px] leading-[22px] sm:text-[18px] sm:leading-[24px] font-semibold text-black hover:underline"
                      >
                        {isExpanded ? 'Згорнути' : 'Читати далі'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Review Form Modal */}
        <ReviewFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productId={productId}
          productName={productName}
          onSubmitSuccess={onReviewSubmitted}
        />
      </div>
    </section>
  )
}

// ============ FREQUENTLY BOUGHT TOGETHER ============
// Two complementary picks per product. We have no purchase-history yet, so the
// pairing is rule-based on the product's attributes:
//   1) Routine step (cleanser→toner→serum→cream→SPF, plus mask/eye/lip/hair/
//      body/device/supplement) — we recommend the NEXT logical step(s), the way
//      a real K-beauty routine is built, not another of the same type.
//   2) Same brand (people complete a brand's set) — a bonus.
//   3) Shared active-ingredient tags — a bonus.
//   4) Shared skin type — a bonus.
// The 2nd pick prefers a different step than the 1st for variety. Each card
// shows the dominant reason it was chosen, so the logic is transparent.
type FbtItem = {
  id: string
  name: string
  sale_price: number | null
  image_url: string | null
  image_path: string | null
  subcategory: string | null
  brand: string | null
  tags: string | null
  skin_type: string | null
  coming_soon?: number | null
}

type RoutineStep =
  | 'cleanser' | 'toner' | 'serum' | 'cream' | 'spf' | 'mask'
  | 'eye' | 'lip' | 'hair' | 'body' | 'device' | 'supplement' | 'other'

function routineStep(name?: string | null, subcategory?: string | null, tags?: string | null): RoutineStep {
  const s = `${subcategory || ''} ${name || ''} ${tags || ''}`.toLowerCase()
  if (/spf|sun ?cream|sunscreen|сонцезахис/.test(s)) return 'spf'
  if (/шампун|кондиц|волосс|\bhair\b|бальзам для волосся/.test(s)) return 'hair'
  if (/добавк|gummy|мармелад|probiotic|пробіотик|саше|колаген\s*\d{3,}|jelly stick|\binner\b/.test(s)) return 'supplement'
  if (/девайс|прилад|пристр|booster|бустер|масажер|device|age-?r/.test(s)) return 'device'
  if (/тіло|\bbody\b|для рук|для ніг|hand cream|foot/.test(s)) return 'body'
  if (/очі|\beye\b|навколо очей/.test(s)) return 'eye'
  if (/губ|\blip\b/.test(s)) return 'lip'
  if (/маск|\bmask\b/.test(s)) return 'mask'
  if (/очищенн|cleans|пінк|гель для вмив|демакіяж|гідрофіл|вмиван/.test(s)) return 'cleanser'
  if (/сироват|serum|ампул|ampoule|шот|\bshot\b/.test(s)) return 'serum'
  if (/тонер|toner|пади|\bпад/.test(s) || /essence|есенц/.test(s)) return 'toner'
  if (/крем|cream|молочко|емульс|lotion|гель-крем/.test(s)) return 'cream'
  return 'other'
}

const STEP_PAIRS: Record<RoutineStep, RoutineStep[]> = {
  cleanser: ['toner', 'serum', 'cream'],
  toner: ['serum', 'cream', 'cleanser'],
  serum: ['cream', 'toner', 'spf'],
  cream: ['serum', 'cleanser', 'spf'],
  spf: ['serum', 'cream', 'cleanser'],
  mask: ['serum', 'cream', 'toner'],
  eye: ['serum', 'cream'],
  lip: ['cream', 'serum'],
  hair: ['hair'],
  body: ['body'],
  device: ['serum', 'cream', 'device'],
  supplement: ['supplement', 'serum'],
  other: ['serum', 'cream', 'cleanser'],
}

function tagSet(s?: string | null) {
  return new Set((s || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean))
}

function recommendTwo(
  current: { id: string; name: string; subcategory: string | null; brand: string | null; tags?: string | null; skin_type?: string | null },
  pool: FbtItem[]
): { item: FbtItem; reason: string; step: RoutineStep }[] {
  const curStep = routineStep(current.name, current.subcategory, current.tags)
  const curTags = tagSet(current.tags)
  const curSkin = tagSet(current.skin_type)
  const partners = STEP_PAIRS[curStep] || []
  const sameTypeOk = curStep === 'hair' || curStep === 'body' || curStep === 'supplement'

  const scored = pool
    .filter(p => p.id !== current.id && !(p.coming_soon && p.coming_soon > 0) && (p.sale_price ?? 0) > 0)
    .map(p => {
      const step = routineStep(p.name, p.subcategory, p.tags)
      const reasons: { w: number; text: string }[] = []
      let score = 0
      const pi = partners.indexOf(step)
      if (pi >= 0) { const w = 6 - pi; score += w; reasons.push({ w, text: 'Доповнює догляд (наступний крок)' }) }
      if (step === curStep && !sameTypeOk) score -= 2
      if (p.brand && current.brand && p.brand.toLowerCase() === current.brand.toLowerCase()) {
        score += 2.5; reasons.push({ w: 2.5, text: `Той самий бренд` })
      }
      const sharedTags = Array.from(tagSet(p.tags)).filter(t => curTags.has(t)).length
      if (sharedTags > 0) { const w = sharedTags * 1.5; score += w; reasons.push({ w, text: 'Схожі активні компоненти' }) }
      const sharedSkin = Array.from(tagSet(p.skin_type)).filter(t => curSkin.has(t)).length
      if (sharedSkin > 0) { const w = sharedSkin; score += w; reasons.push({ w, text: 'Підходить вашому типу шкіри' }) }
      reasons.sort((a, b) => b.w - a.w)
      return { item: p, step, score, reason: reasons[0]?.text || 'Гарна пара до цього засобу' }
    })
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0) return []
  const picks = [scored[0]]
  const firstStep = scored[0].step
  let second = scored.slice(1).find(s => s.step !== firstStep)
  if (!second) second = scored[1]
  if (second) picks.push(second)
  return picks
}

function FrequentlyBoughtTogether({
  current,
  pool,
}: {
  current: Product
  pool: SimilarProduct[]
}) {
  const recs = recommendTwo(current, pool)
  const [addingId, setAddingId] = useState<string | null>(null)
  const { addToCart } = useCart()

  if (recs.length === 0) return null

  const handleAdd = async (id: string) => {
    setAddingId(id)
    await addToCart(id)
    setTimeout(() => setAddingId(null), 600)
  }

  return (
    <section className="py-12 sm:py-16 bg-[#E2F9FF]">
      <div className="max-w-[900px] mx-auto px-6 sm:px-8">
        <h2 className="font-bebas uppercase text-black text-[34px] sm:text-[44px] leading-[1.05] mb-2 text-center">
          Часто купують разом
        </h2>
        <p className="text-center text-[14px] text-[#666] mb-8">
          Підібрали засоби, що доповнюють цей у вашому догляді
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {recs.map(({ item, reason }) => {
            const img = item.image_url || item.image_path || '/products/product-1.png'
            return (
              <div key={item.id} className="bg-white rounded-[18px] border border-[#E5E5E5] p-4 flex gap-4 items-center">
                <Link
                  href={`/product/${item.id}`}
                  className="relative w-[84px] h-[84px] rounded-[12px] overflow-hidden bg-[#F8F7FB] flex-shrink-0"
                >
                  <Image src={img} alt={item.name} fill className="object-contain p-1.5" sizes="84px" />
                </Link>
                <div className="flex-grow min-w-0">
                  <span className="inline-block text-[10px] px-2 py-[2px] rounded-full bg-[#F5F3FF] text-[#6046A3] mb-1">
                    {reason}
                  </span>
                  <Link
                    href={`/product/${item.id}`}
                    className="block text-[14px] text-black hover:text-[#6046A3] leading-snug line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-semibold text-[15px] text-black">₴{item.sale_price ?? 0}</span>
                    <button
                      onClick={() => handleAdd(item.id)}
                      disabled={addingId === item.id}
                      className="ml-auto h-9 px-3 rounded-lg bg-[#6046A3] text-white text-[13px] font-semibold hover:bg-[#4D3882] transition-colors disabled:opacity-60"
                    >
                      {addingId === item.id ? 'Додано ✓' : 'У кошик'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ============ SIMILAR PRODUCTS SECTION ============
function SimilarProductsSection({ products, currentProductId }: { products: SimilarProduct[]; currentProductId: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)
  const [addingId, setAddingId] = useState<string | null>(null)
  const { addToCart } = useCart()
  
  // Filter out current product
  const similarProducts = products.filter(p => p.id !== currentProductId).slice(0, 6)
  
  const handleAddToCart = async (productId: string) => {
    setAddingId(productId)
    await addToCart(productId)
    setTimeout(() => setAddingId(null), 500)
  }

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setItemsPerView(1)
      } else if (width < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, similarProducts.length - itemsPerView)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : maxIndex))
  }

  const visibleProducts = similarProducts.slice(currentIndex, currentIndex + itemsPerView)

  if (similarProducts.length === 0) return null

  return (
    <section className="bg-[#E2F9FF] py-16 sm:py-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="flex items-start justify-between gap-6 mb-10">
          <h2 className="font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Схожі товари
          </h2>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center bg-primary hover:bg-primary-light text-black font-semibold text-[15px] tracking-[0.1em] px-10 py-4 rounded-[12px] transition-colors duration-300 uppercase shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
          >
            Усі товари
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex gap-5 sm:gap-6">
              {visibleProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="flex-shrink-0 w-full sm:w-[320px] lg:w-[360px] xl:w-[393px] group"
                >
                  <div className="relative w-full h-[340px] sm:h-[360px] lg:h-[380px] xl:h-[400px] rounded-[20px] overflow-hidden bg-[#F8F7FB] border border-[#E5E5E5] shadow-[0_4px_16px_rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow">
                    <Image
                      src={product.image_url || product.image_path || '/products/product-1.png'}
                      alt={product.name}
                      fill
                      className="object-contain p-4"
                      sizes="(min-width: 1280px) 393px, (min-width: 1024px) 360px, (min-width: 640px) 320px, 100vw"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYwIiBoZWlnaHQ9IjM2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjhGN0ZCIi8+PC9zdmc+"
                    />

                    {product.discount_amount ? (
                      <div className="absolute top-3 left-3 z-[4] flex flex-col items-start gap-1.5">
                        <span className="h-[34px] px-3.5 rounded-[8px] bg-[#E84A8A] text-white text-[17px] font-bold tracking-[0.02em] flex items-center shadow-[0_6px_16px_rgba(232,74,138,0.5)]">
                          −{product.discount_amount}%
                        </span>
                      </div>
                    ) : null}

                    <WishlistButton productId={product.id} variant="icon" className="absolute top-3 right-3 z-[5]" />

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleAddToCart(product.id)
                      }}
                      disabled={addingId === product.id}
                      className={`absolute bottom-3 right-3 rounded-lg p-2.5 transition-all shadow-md ${
                        addingId === product.id 
                          ? 'bg-[#6046A3] text-white' 
                          : 'bg-[#E2F9FF] hover:bg-[#F5F5F5] text-black'
                      }`}
                      aria-label="Додати в кошик"
                    >
                      {addingId === product.id ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="mt-4">
                    <h3
                      className="text-black text-[18px] leading-[24px] font-normal mb-2"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '48px',
                      }}
                    >
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2">
                      <span className="text-black text-[18px] leading-[24px] font-semibold">
                        ₴{product.sale_price ?? 0}
                      </span>
                      {product.original_price && product.original_price > (product.sale_price ?? 0) && (
                        <span className="text-[#999999] line-through text-[14px] leading-[20px] font-normal">
                          ₴{product.original_price}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {similarProducts.length > itemsPerView && currentIndex < maxIndex && (
            <button
              onClick={handleNext}
              className="absolute right-4 sm:right-6 lg:right-8 top-[170px] sm:top-[180px] lg:top-[190px] xl:top-[200px] p-0 w-[50px] h-[50px] transition-all duration-300 z-10 hover:opacity-80"
              aria-label="Наступний продукт"
            >
              <Image src="/arrow-next.png" alt="Наступний продукт" width={50} height={50} />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

// ============ MAIN PRODUCT PAGE ============
export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const rawProductId = params.id as string
  let productId = rawProductId
  try {
    productId = decodeURIComponent(rawProductId)
  } catch {
    // The API will return a clean not-found state for a malformed route.
  }
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewRating, setReviewRating] = useState<{ average: number; count: number }>({ average: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedVolume, setSelectedVolume] = useState<string>('')
  const [addingToCart, setAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)

  const handleAddToCart = async (goToCheckout = false) => {
    setAddingToCart(true)
    setAddedToCart(false)
    setCartError(null)
    const added = await addToCart(productId, quantity)

    if (!added) {
      setCartError('Не вдалося додати товар. Спробуйте ще раз.')
      setAddingToCart(false)
      return
    }

    setAddingToCart(false)
    if (goToCheckout) {
      router.push('/checkout')
      return
    }

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1000)
  }

  const fetchReviews = async (id: string) => {
    try {
      const reviewsResponse = await fetch(`/api/reviews?product_id=${id}`)
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json()
        setReviews(reviewsData.reviews || [])
        setReviewRating({
          average: reviewsData.rating || 0,
          count: reviewsData.reviewCount || 0,
        })
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    }
  }

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/product/${productId}`)
        if (!response.ok) {
          throw new Error('Product not found')
        }
        const data = await response.json()
        setProduct(data)
        
        if (data.volume_options) {
          const volumes = data.volume_options.split(',').map((v: string) => v.trim())
          if (volumes.length > 0) {
            setSelectedVolume(volumes[0])
          }
        }

        // Above-the-fold content is ready as soon as the product arrives.
        // Reviews and one shared recommendation pool load in parallel.
        setLoading(false)
        try {
          const [similarResponse] = await Promise.all([
            fetch(
              `/api/products?category=${encodeURIComponent(data.category || '')}&limit=60&exclude=${encodeURIComponent(productId)}`
            ),
            fetchReviews(productId),
          ])
          if (similarResponse.ok) {
            const similarData = await similarResponse.json()
            setSimilarProducts(Array.isArray(similarData) ? similarData : similarData.products || [])
          }
        } catch (secondaryError) {
          console.error('Failed to fetch product recommendations:', secondaryError)
        }
      } catch (err) {
        setError('Товар не знайдено')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#E2F9FF]">
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#BCC2F4]"></div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#E2F9FF]">
        <div className="flex flex-col items-center justify-center py-32">
          <h1 className="text-2xl font-semibold text-black mb-4">Товар не знайдено</h1>
          <Link href="/catalog" className="text-[#7C83C9] hover:underline">
            Повернутися до каталогу
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const images = [
    product.image_url || product.image_path,
    product.image_url_2,
    product.image_url_3,
    product.image_url_4,
    product.image_url_5,
    product.image_url_6,
    product.image_url_7,
    product.image_url_8,
    product.image_url_9,
    product.image_url_10,
    product.image_url_11,
    product.image_url_12,
  ].filter(Boolean) as string[]

  const volumeOptions = product.volume_options 
    ? product.volume_options.split(',').map((v) => v.trim()).filter(Boolean)
    : []

  // Use real review data if available, otherwise fall back to product data
  const rating = reviewRating.count > 0 ? reviewRating.average : (product.rating ?? 0)
  const reviewCount = reviewRating.count > 0 ? reviewRating.count : (product.review_count ?? 0)

  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      {/* Product Hero Section */}
      <section className="py-6 sm:py-10">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <Breadcrumbs category={product.category} subcategory={product.subcategory} />

          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-10 xl:gap-14">
            {/* Left: Image Gallery */}
            <div>
              <ImageGallery images={images} productName={product.name} />
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col">
              <h1 className="font-gilroy text-[28px] sm:text-[30px] lg:text-[30px] xl:text-[34px] leading-[1.18] font-semibold text-black mb-4">
                {product.name}
              </h1>

              <div className="mb-6">
                <StarRating rating={rating} reviewCount={reviewCount} />
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className={`text-[32px] font-semibold ${product.original_price && product.original_price > (product.sale_price ?? 0) ? 'text-[#E84A8A]' : 'text-black'}`}>
                  ₴{product.sale_price ?? 0}
                </span>
                {product.original_price && product.original_price > (product.sale_price ?? 0) && (
                  <>
                    <span className="text-[20px] text-[#999999] line-through">
                      ₴{product.original_price}
                    </span>
                    <span className="text-[14px] font-bold text-white bg-[#E84A8A] rounded-[6px] px-2 py-0.5">
                      −{product.discount_amount}%
                    </span>
                  </>
                )}
              </div>

              {product.tags && product.tags.trim() && (
                <div className="mb-6">
                  <p className="text-[14px] text-[#666666] mb-2">Теги</p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag, i) => (
                        <Link
                          key={i}
                          href={`/catalog?tag=${encodeURIComponent(tag)}`}
                          className="text-[13px] leading-tight px-3 py-1.5 rounded-full bg-[#F5F3FF] text-[#6046A3] hover:bg-[#E7DEFF] transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                  </div>
                </div>
              )}

              {volumeOptions.length > 0 && (
                <div className="mb-6">
                  <VolumeSelector
                    options={volumeOptions}
                    selected={selectedVolume}
                    onSelect={setSelectedVolume}
                  />
                </div>
              )}

              <div className="mb-6">
                <label className="block text-[14px] text-[#666666] mb-2">Кількість</label>
                <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
              </div>

              <div className="flex flex-col gap-3 mt-auto">
                <button 
                  onClick={() => handleAddToCart()}
                  disabled={addingToCart}
                  className={`w-full max-w-[605px] h-[50px] font-semibold text-[16px] uppercase tracking-wide transition-all ${
                    addedToCart
                      ? 'bg-[#6046A3] text-white' 
                      : 'bg-[#BCC2F4] text-black hover:bg-[#A8AFEB]'
                  }`}
                >
                  {addingToCart
                    ? 'Додаємо...'
                    : addedToCart
                      ? '✓ Додано в кошик'
                      : 'Додати в кошик'}
                </button>
                <button 
                  onClick={() => handleAddToCart(true)}
                  disabled={addingToCart}
                  className="w-full max-w-[605px] h-[50px] bg-[#E2F9FF] border border-black text-black font-semibold text-[16px] uppercase tracking-wide hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  Купити в один клік
                </button>
                {cartError && (
                  <p role="alert" className="text-[14px] font-medium text-[#B42318]">
                    {cartError}
                  </p>
                )}
                <WishlistButton productId={productId} variant="full" className="w-full max-w-[605px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tabs Section */}
      <section className="py-8">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <ProductTabs product={product} />
        </div>
      </section>

      {/* Frequently bought together (2 complementary picks) */}
      <FrequentlyBoughtTogether current={product} pool={similarProducts} />

      {/* FAQ Section */}
      <FAQSection product={product} />

      {/* Reviews Section */}
      <ProductReviewsSection 
        productId={productId}
        productName={product.name}
        reviews={reviews}
        onReviewSubmitted={() => fetchReviews(productId)}
      />

      {/* Similar Products Section */}
      <SimilarProductsSection products={similarProducts} currentProductId={productId} />

      {/* Subscribe Section */}
      <SubscribeSection />

      {/* Delivery Section */}
      <DeliverySection />

      <Footer />
    </main>
  )
}
