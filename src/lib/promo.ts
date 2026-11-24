/**
 * Black Friday 2026 (21.11–02.12.2026, Kyiv time).
 * Products in BLACK_FRIDAY_IDS get the words «Чорна п'ятниця» next to the
 * discount percent on the image badge, but only inside the promo window and
 * only while the product actually has a discount. Prices themselves live in
 * the DB (sale_price / original_price / discount_amount).
 */
export const BLACK_FRIDAY_LABEL = "Чорна п'ятниця"
// Стартували на день раніше — 21.11 за її рішенням.
const START = Date.parse('2026-11-21T00:00:00+02:00')
const END = Date.parse('2026-12-03T00:00:00+02:00')
export const BLACK_FRIDAY_START = START
export const BLACK_FRIDAY_END = END

export const BLACK_FRIDAY_IDS = new Set<string>([
  // AGE-R Booster Pro X2 Pink — знижку поставила власниця 24.11 (17 799 → 15 150)
  'medicube-age-r-booster-pro-x2-pink-мульт-104',
  // Mediheal — розпродаж, додано 22.11
  'mediheal-hyaluronate-toner-pad-тонер-пад-111',
  'mediheal-pdrn-lifting-pad-ліфтинг-пади-з-113',
  'mediheal-teatree-trouble-pad-тонер-пади--114',
  'mediheal-vitamin-c-brightening-pad-тонер-110',
  'mediheal-collagen-capsule-patch-vitamin--117',
  'mediheal-retinol-collagen-eye-patch-гідр-116',
  '6a110a83-49c2-47b2-a19d-c7d038c4a7b2',
  'medicube-zero-pore-toner-тонер-з-aha-bha-35',
  'medicube-pdrn-pink-collagen-capsule-crea-0',
  'medicube-zero-pore-blackhead-mud-mask-гл-31',
  'medicube-collagen-jelly-cream-желе-крем--38',
  'medicube-pdrn-pink-collagen-bubble-serum-148',
  'medicube-rosemary-pdrn-hair-scalp-condit-96',
  'medicube-vita-eye-gel-serum-гель-сироват-89',
  'medicube-red-clear-capsule-body-lotion-з-50',
  'medicube-txa-niacinamide-15-serum-сирова-59',
  '4cc8ea60-e973-49af-99c9-69f10f95947c',
  'medicube-collagen-glow-booster-milk-seru-67',
  'medicube-deep-vita-a-retinol-serum-антив-66',
  'medicube-deep-vita-c-glutathione-brighte-85',
  'medicube-hyaluronic-moisturizing-capsule-30',
  '594b717f-2ca9-44e9-b65b-c885bacdfee9',
  '9f202dbb-970c-457c-b9cd-2487d5cfc28d',
  '1d784a1a-8926-4237-bf5b-cbc4fd8b5927',
  'medicube-zero-foam-cleanser-пінка-для-гл-28',
  'medicube-pdrn-pink-caffeine-night-wrappi-20',
  'medicube-pdrn-pink-niacinamide-milky-ton-2',
  'medicube-super-cica-daily-quick-mask-екс-27',
  'medicube-zero-pore-sa-clear-capsule-clea-34',
  'unove-deep-damage-repair-shampoo-шампунь-128',
  'medicube-pdrn-pink-hyaluronic-moisturizi-52',
  'medicube-collagen-milk-toning-wrapping-m-74',
  '6c821cf7-c668-4c79-a956-3a327219985b',
  'medicube-deep-lifting-peptide-eye-cream--17',
  'cj-wellcare-melamate-gummy-жувальні-марм-139',
  'torriden-solid-in-ceramide-lip-essence-е-123',
  'medicube-zero-pore-cream-2-0-зволожуючий-68',
  'medicube-pdrn-pink-collagen-bubble-serum-73',
  'medicube-pdrn-pink-collagen-exosome-shot-7',
  'ca2cf274-e057-475d-a3c8-0476b8c7c148',
  'mediheal-collagen-ampoule-pad-антивікові-109',
  'mediheal-madecassoside-blemish-pad-заспо-112',
  'mediheal-phyto-enzyme-peeling-pad-фермен-115',
  'bioheal-boh-probioderm-collagen-remodeli-134',
  'medicube-pdrn-lip-sleeping-mask-нічна-ма-43',
  'medicube-deep-vita-c-daily-quick-mask-зв-44',
  'ce81910d-f4f4-48c2-ae0f-bd3ba03741bc',
  'medicube-kojic-acid-turmeric-vita-capsul-84',
  'medicube-kojic-acid-turmeric-vita-jelly--86',
  'medicube-pdrn-pink-tension-up-mask-pdrn--5',
  'medicube-pdrn-pink-collagen-glow-jelly-s-51',
  'medicube-pdrn-pink-collagen-gel-mask-pdr-4',
  'medicube-kojic-acid-turmeric-pad-пади-з--81',
  'medicube-red-foam-cleanser-пінка-для-вми-63',
  'medicube-zero-pore-pad-2-0-двосторонні-т-45',
  'medicube-red-succinic-acid-peeling-pad-п-70',
  'medicube-pdrn-pink-niacinamide-whip-clea-1',
  'medicube-pdrn-pink-collagen-toning-gel-t-6',
  'medicube-deep-vita-c-pad-тонер-пади-з-ві-53',
  'medicube-hyaluronic-multi-peptide-serum--18',
  'medicube-kojic-acid-turmeric-toning-clea-88',
  'medicube-pdrn-pink-vita-coating-mask-тка-91',
  'medicube-red-centella-mask-заспокійлива--90',
  'c4c01cd1-cff1-49dc-b98d-01fea1f5d274',
  'medicube-collagen-lifting-mask-тканинна--26',
  'medicube-deep-peptide-radiance-mask-анти-41',
  'medicube-zero-pore-cooling-mask-зеро-пор-19',
  'lactofit-probiotic-liver-care-пробіотик--108',
])

/** 'before' until 21.11, 'active' 21.11–02.12, 'after' from 03.12 (Kyiv time). */
export function blackFridayPhase(now: number = Date.now()): 'before' | 'active' | 'after' {
  if (now < START) return 'before'
  if (now >= END) return 'after'
  return 'active'
}

export function promoLabel(id: string | null | undefined, discount: number | null | undefined): string | null {
  if (!id || !discount || discount <= 0) return null
  if (!BLACK_FRIDAY_IDS.has(id)) return null
  const now = Date.now()
  if (now < START || now >= END) return null
  return BLACK_FRIDAY_LABEL
}

/** Бренд з назви: «Medicube, …» → Medicube; «100+100 педів Mediheal, …» → Mediheal. */
function brandOf(name: string): string {
  const head = name.split(',')[0].trim()
  return head.replace(/^\d[\d+]*\s+\S+\s+/, '').toLowerCase()
}

/**
 * Порядок товарів «Чорної п'ятниці» — перемішаний список:
 *  • товари кожного бренду рівномірно розкидані по всьому списку (Medicube
 *    багато, тож без цього всі інші бренди опинялися в самому кінці);
 *  • усередині бренду більші знижки йдуть раніше;
 *  • поруч не ставимо два товари одного бренду чи одного типу (маски не
 *    стоять «стіною»), якщо є чим розбавити.
 */
export function mixBlackFriday<T>(
  items: T[],
  type: (x: T) => string,
  discount: (x: T) => number,
  name: (x: T) => string = () => '',
): T[] {
  const groups = new Map<string, T[]>()
  for (const x of items) {
    const b = brandOf(name(x)) || type(x)
    groups.set(b, [...(groups.get(b) ?? []), x])
  }
  // Місце товару в списку — середнє з двох чисел від 0 до 1:
  //   • рівномірність бренду: k-й з n товарів бренду → (k + 0.5) / n;
  //   • розмір знижки: місце серед усіх товарів за знижкою (−30% ближче до 0).
  const byDiscount = [...items].sort((a, b) => discount(b) - discount(a))
  const discRank = new Map<T, number>()
  byDiscount.forEach((x) => {
    const first = byDiscount.findIndex((y) => discount(y) === discount(x))
    discRank.set(x, first / Math.max(1, items.length))
  })
  const slot = new Map<T, number>()
  groups.forEach((g) => {
    g.sort((a, b) => discount(b) - discount(a))
    g.forEach((x, k) => slot.set(x, ((k + 0.5) / g.length + discRank.get(x)!) / 2))
  })
  const left = [...items].sort((a, b) => slot.get(a)! - slot.get(b)! || discount(b) - discount(a))
  const out: T[] = []
  while (left.length) {
    const last = out[out.length - 1]
    const prev = last ? type(last) : null
    const prev2 = out.length > 1 ? type(out[out.length - 2]) : null
    const prevBrand = last ? brandOf(name(last)) : null
    const ok = (x: T, strictType: boolean) =>
      type(x) !== prev && (!strictType || type(x) !== prev2) && (!prevBrand || brandOf(name(x)) !== prevBrand)
    // Дивимось лише на кілька найближчих кандидатів, інакше «рідкісні» бренди
    // висмикувались би на самий початок і рівномірність зникала б.
    const near = left.slice(0, 5)
    let i = near.findIndex((x) => ok(x, true))
    if (i < 0) i = near.findIndex((x) => ok(x, false))
    if (i < 0) i = near.findIndex((x) => type(x) !== prev)
    if (i < 0) i = 0
    out.push(left.splice(i, 1)[0])
  }
  return out
}
