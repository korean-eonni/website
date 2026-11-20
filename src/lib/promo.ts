/**
 * Black Friday 2026 (22.11–02.12.2026, Kyiv time).
 * Products in BLACK_FRIDAY_IDS get the words «Чорна п'ятниця» next to the
 * discount percent on the image badge, but only inside the promo window and
 * only while the product actually has a discount. Prices themselves live in
 * the DB (sale_price / original_price / discount_amount).
 */
export const BLACK_FRIDAY_LABEL = "Чорна п'ятниця"
const START = Date.parse('2026-11-22T00:00:00+02:00')
const END = Date.parse('2026-12-03T00:00:00+02:00')
export const BLACK_FRIDAY_START = START
export const BLACK_FRIDAY_END = END

export const BLACK_FRIDAY_IDS = new Set<string>([
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

/** 'before' until 22.11, 'active' 22.11–02.12, 'after' from 03.12 (Kyiv time). */
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
