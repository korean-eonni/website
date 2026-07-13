import { NextResponse } from 'next/server'
import { listProducts } from '@/lib/productStore'

export const dynamic = 'force-dynamic'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/skin-test/recommend
// Body: { type, sensitive, pigment, aging, dehydrated, concern, concernWeights }
// Returns one matched product per routine step. The set of steps is chosen from
// the user's PRIMARY need (ROUTINE_BY_CONCERN), and each step's badge label is a
// real site subcategory (Сироватки, Креми, Тонери, Пади, …).
//
// Matching: step ← product `subcategory`; suitability ← keyword hits in `tags`
// (+ `fit_skin`/`solves_problems`). skin_type column is empty in the data, so we
// score by concern/ingredient keywords instead.
// ─────────────────────────────────────────────────────────────────────────────

type SkinType = 'dry' | 'normal' | 'combination' | 'oily'
type Concern =
  | 'acne' | 'dry-skin' | 'sensitive' | 'oily-skin'
  | 'anti-aging' | 'pigmentation' | 'hydration' | 'pores'

// Distinctive lowercase substrings per concern (apostrophe-safe — no exact tag match).
const CONCERN_KW: Record<Concern, string[]> = {
  hydration: ['зволож', 'гіалурон', 'церамід'],
  'dry-skin': ['зволож', 'церамід', 'живлення', 'помʼякш', "пом'якш", 'гіалурон', 'бар'],
  acne: ['акне', 'висип', 'bha', 'саліцил', 'себорегуляц'],
  'oily-skin': ['себорегуляц', 'матуванн', 'звуження пор', 'ніацинамід', 'bha'],
  sensitive: ['заспоко', 'почервонін', 'центела', 'cica', 'пантенол', 'бар'],
  'anti-aging': ['антивіков', 'зморшк', 'пружн', 'ліфтинг', 'ретинол', 'пептид', 'колаген', 'аденозин'],
  pigmentation: ['пігментац', 'постакне', 'освітленн', 'рівний тон', 'сяйво', 'вітамін c', 'глутатіон'],
  pores: ['звуження пор', 'себорегуляц', 'pha', 'bha', 'матуванн'],
}

// Each routine step maps to a REAL site subcategory — the badge label is exactly
// the subcategory name as it appears in the catalog, so the suggested set reads
// like the store's own navigation (Сироватки, Креми, Тонери, …).
const SLOT_DEFS: Record<string, { label: string; sub: string[] }> = {
  cleanser:    { label: 'Очищення та демакіяж', sub: ['очищення та демакіяж', 'очищення'] },
  toner:       { label: 'Тонери', sub: ['тонери'] },
  pads:        { label: 'Пади', sub: ['пади'] },
  exfoliation: { label: 'Ексфоліація', sub: ['ексфоліація'] },
  serum:       { label: 'Сироватки', sub: ['сироватки'] },
  eye:         { label: 'Догляд за зоною навколо очей', sub: ['догляд за зоною навколо очей'] },
  cream:       { label: 'Креми', sub: ['креми'] },
  spf:         { label: 'SPF', sub: ['spf'] },
  mask:        { label: 'Маски', sub: ['маски'] },
  lips:        { label: 'Догляд за губами', sub: ['догляд за губами'] },
}

// Which steps we propose is driven by the user's PRIMARY need from the test —
// not a fixed list. Each routine is in real application order and built from the
// site's own subcategories:
//   • acne / жирна / pores → додаємо Пади (та Ексфоліацію) для очищення пор
//   • anti-aging          → додаємо Догляд за зоною навколо очей + Маски
//   • hydration / суха / чутлива → додаємо зволожувальну/заспокійливу Маску
//   • pigmentation        → SPF обовʼязковий (вже в базі) + освітлювальна Маска
const ROUTINE_BY_CONCERN: Record<Concern, string[]> = {
  acne:         ['cleanser', 'toner', 'pads', 'serum', 'cream', 'spf'],
  'oily-skin':  ['cleanser', 'toner', 'pads', 'serum', 'cream', 'spf'],
  pores:        ['cleanser', 'pads', 'exfoliation', 'serum', 'cream', 'spf'],
  'dry-skin':   ['cleanser', 'toner', 'serum', 'cream', 'mask', 'spf'],
  hydration:    ['cleanser', 'toner', 'serum', 'cream', 'mask', 'spf'],
  sensitive:    ['cleanser', 'toner', 'serum', 'cream', 'mask', 'spf'],
  'anti-aging': ['cleanser', 'toner', 'serum', 'eye', 'cream', 'spf', 'mask'],
  pigmentation: ['cleanser', 'toner', 'serum', 'cream', 'spf', 'mask'],
}
const DEFAULT_ROUTINE = ['cleanser', 'toner', 'serum', 'cream', 'spf', 'mask']

function countHits(haystack: string, kws: string[]): number {
  let n = 0
  for (const kw of kws) if (haystack.includes(kw)) n++
  return n
}

function blurb(p: { short_description: string | null; solves_problems: string | null; fit_skin: string | null }): string {
  const raw = p.short_description || p.solves_problems || p.fit_skin || ''
  const firstLine = raw.split('\n').map((s) => s.trim()).filter(Boolean)[0] || ''
  // Drop leading bullets/emoji — keep from the first Cyrillic/Latin letter or digit.
  const m = firstLine.match(/[А-Яа-яЇїІіЄєҐґЁёA-Za-z0-9].*/)
  const cleaned = (m ? m[0] : firstLine).replace(/\s+/g, ' ').trim()
  return cleaned.length > 140 ? cleaned.slice(0, 137).trimEnd() + '…' : cleaned
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const type = (body.type || 'normal') as SkinType
    const concern = (body.concern || 'hydration') as Concern

    // Weighted need vector from EVERY answer. Fall back to a single-concern vector
    // for older clients that don't send concernWeights.
    const cw: Partial<Record<Concern, number>> =
      body.concernWeights && typeof body.concernWeights === 'object'
        ? body.concernWeights
        : { [concern]: 5 }

    const all = await listProducts('is_active = 1')
    // Facial routine → restrict to face products that actually have a price/stock.
    const face = all.filter(
      (p) => (p.category ?? '').toLowerCase() === 'обличчя' && (p.sale_price ?? 0) > 0,
    )

    const score = (p: (typeof face)[number]): number => {
      const tags = (p.tags ?? '').toLowerCase()
      const ctx = tags + ' ' + (p.fit_skin ?? '').toLowerCase() + ' ' + (p.solves_problems ?? '').toLowerCase()
      let s = 0
      // Score against the whole need vector — each concern contributes by its weight.
      for (const c of Object.keys(CONCERN_KW) as Concern[]) {
        const weight = cw[c] ?? 0
        if (weight > 0) s += weight * countHits(tags, CONCERN_KW[c])
      }
      // Skin-type fit from fit_skin text.
      if (type === 'dry' && (ctx.includes('суха') || countHits(tags, CONCERN_KW.hydration) > 0)) s += 3
      if ((type === 'oily' || type === 'combination') && (ctx.includes('жирна') || countHits(tags, CONCERN_KW['oily-skin']) > 0)) s += 3
      if ((p.stock_quantity ?? 0) > 0) s += 1
      if (p.is_new) s += 0.3
      return s
    }

    const chosen = new Set<string>()
    const pack = (p: (typeof face)[number] | undefined, label: string, slotKey: string) => {
      if (!p) return null
      chosen.add(p.id)
      return {
        slotKey,
        slotLabel: label,
        id: p.id,
        name: p.name,
        brand: p.brand,
        subcategory: p.subcategory,
        image: p.image_url,
        price: p.sale_price,
        originalPrice: p.original_price,
        discount: p.discount_amount,
        blurb: blurb(p),
      }
    }

    // Compose the routine from the resolved primary need, then fill each step with
    // the best-scoring product of that subcategory (skipping ones already used).
    const slotKeys = ROUTINE_BY_CONCERN[concern] ?? DEFAULT_ROUTINE
    const results: ReturnType<typeof pack>[] = []
    for (const key of slotKeys) {
      const def = SLOT_DEFS[key]
      if (!def) continue
      const candidates = face
        .filter((p) => def.sub.includes((p.subcategory ?? '').toLowerCase()))
        .filter((p) => !chosen.has(p.id))
        .sort((a, b) => score(b) - score(a))
      const packed = pack(candidates[0], def.label, key)
      if (packed) results.push(packed)
    }

    // Гарантуємо щонайменше 5 порад: якщо для якогось кроку не знайшлося товару,
    // доповнюємо найкращими за скорингом товарами з інших реальних субкатегорій.
    if (results.length < 5) {
      const usedKeys = new Set(results.map((r) => r?.slotKey))
      const FILL_ORDER = ['serum', 'cream', 'mask', 'pads', 'eye', 'toner', 'exfoliation', 'cleanser', 'spf', 'lips']
      for (const key of FILL_ORDER) {
        if (results.length >= 5) break
        if (usedKeys.has(key)) continue
        const def = SLOT_DEFS[key]
        const candidates = face
          .filter((p) => def.sub.includes((p.subcategory ?? '').toLowerCase()))
          .filter((p) => !chosen.has(p.id))
          .sort((a, b) => score(b) - score(a))
        const packed = pack(candidates[0], def.label, key)
        if (packed) {
          results.push(packed)
          usedKeys.add(key)
        }
      }
    }

    return NextResponse.json({ products: results.filter(Boolean) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to recommend'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
