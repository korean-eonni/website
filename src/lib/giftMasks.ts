/**
 * "Маска в подарунок" promo.
 *
 * One free Medicube sheet mask for every full 1000₴ of the cart subtotal (paid
 * items only — gifts are free and never count toward the threshold), cycling
 * through the 5 masks below, capped at 25 masks (subtotal 25000₴ and above).
 *
 * Gift #n (1-based) uses GIFT_MASKS[(n-1) % 5]:
 *   1000–1999₴ → 1 mask, 2000–2999₴ → 2 masks, … 25000₴+ → 25 masks.
 *
 * The gift is DERIVED from the subtotal — it is never stored as a real
 * `cart_items` row (the cart has no price column, and the orders API rejects
 * price ≤ 0 lines). The cart UI renders these as read-only rows, and the orders
 * API injects them as 0₴ order lines after price validation.
 *
 * Names/images are snapshotted from the catalogue. If a mask's photo or id
 * changes in the Google Sheet, update the matching entry here.
 */
export type GiftMask = { productId: string; name: string; image: string }

export const GIFT_THRESHOLD = 1000
export const GIFT_MAX = 25

export const GIFT_MASKS: GiftMask[] = [
  {
    productId: 'medicube-red-centella-mask-заспокійлива--90',
    name: 'Medicube, Red Centella Mask',
    image: 'https://lh3.googleusercontent.com/d/16W_RKDjBNAvxsNtfvK3DIAu-tPgUlhA-=w300',
  },
  {
    productId: 'medicube-pdrn-pink-vita-coating-mask-тка-91',
    name: 'Medicube, PDRN Pink Vita Coating Mask',
    image: 'https://lh3.googleusercontent.com/d/14ez-CB9W7WRJkiCujKNr1dXzU_dZX5xA=w300',
  },
  {
    productId: 'medicube-deep-vita-c-glutathione-brighte-85',
    name: 'Medicube, Deep Vita C Glutathione Brightening Mask',
    image: 'https://lh3.googleusercontent.com/d/1EgFGcRh6rDgy-MZXAjKvXPD0zYLPFwtg=w300',
  },
  {
    productId: 'medicube-collagen-lifting-mask-тканинна--26',
    name: 'Medicube, Collagen Lifting Mask',
    image: 'https://lh3.googleusercontent.com/d/1Nsns1hOg19pnb0Kx1ZTNsks9e9laA3OJ=w300',
  },
  {
    productId: 'medicube-zero-pore-cooling-mask-зеро-пор-19',
    name: 'Medicube, Zero Pore Cooling Mask',
    image: 'https://lh3.googleusercontent.com/d/1SoPoFGNKMRIFq8-TGJaBBiv5dB3dEyK7=w300',
  },
]

/** A gift mask instance with its 1-based position in the cart's gift list. */
export type GiftLine = GiftMask & { seq: number }

/** How many free masks a given subtotal earns (0..25). */
export function giftCountForSubtotal(subtotal: number): number {
  if (!subtotal || subtotal < GIFT_THRESHOLD) return 0
  return Math.min(Math.floor(subtotal / GIFT_THRESHOLD), GIFT_MAX)
}

/** The ordered list of free masks earned by a given subtotal. */
export function giftMasksForSubtotal(subtotal: number): GiftLine[] {
  const n = giftCountForSubtotal(subtotal)
  const out: GiftLine[] = []
  for (let i = 0; i < n; i++) {
    out.push({ ...GIFT_MASKS[i % GIFT_MASKS.length], seq: i + 1 })
  }
  return out
}
