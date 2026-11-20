import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping'
import { GIFT_MASKS_ENABLED, GIFT_THRESHOLD } from '@/lib/giftMasks'
import { blackFridayPhase } from '@/lib/promo'

/** Items of the running promo line (header strip + AnnouncementBar). */
export function buildAnnouncements(): string[] {
  const bf = blackFridayPhase()
  return [
    '10% ЗНИЖКИ НА ПЕРШЕ ЗАМОВЛЕННЯ',
    ...(bf === 'active' ? ['BLACK FRIDAY. ЗНИЖКИ ДО −30%'] : []),
    ...(bf === 'before' ? ['BLACK FRIDAY З 22 ЛИСТОПАДА. ЗНИЖКИ ДО −30%'] : []),
    ...(GIFT_MASKS_ENABLED ? [`ЗА КОЖНІ ${GIFT_THRESHOLD} ГРН — МАСКА MEDICUBE У ПОДАРУНОК`] : []),
    `БЕЗКОШТОВНА ДОСТАВКА ВІД ${FREE_SHIPPING_THRESHOLD} ГРН`,
  ]
}
