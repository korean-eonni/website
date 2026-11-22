/**
 * Піксель Meta (Facebook / Instagram реклама), набір даних «eonni.com.ua»
 * у бізнес-портфоліо pop.color5. Підключається в components/analytics/MetaPixel.
 *
 * Події: PageView (кожна сторінка), ViewContent (сторінка товару),
 * AddToCart, InitiateCheckout, Purchase (сторінка «Дякуємо», з сумою).
 */
export const META_PIXEL_ID = '1678897063812051'

type Fbq = (...args: unknown[]) => void

export function metaTrack(event: string, params: Record<string, unknown> = {}, eventId?: string) {
  if (typeof window === 'undefined') return
  const fbq = (window as unknown as { fbq?: Fbq }).fbq
  if (typeof fbq !== 'function') return
  try {
    if (eventId) fbq('track', event, params, { eventID: eventId })
    else fbq('track', event, params)
  } catch {
    /* піксель не має ламати сайт */
  }
}
