'use client'

import Image from 'next/image'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping'
import { GIFT_MASKS_ENABLED, GIFT_THRESHOLD } from '@/lib/giftMasks'
import { blackFridayPhase } from '@/lib/promo'

function buildAnnouncements(): string[] {
  const bf = blackFridayPhase()
  return [
    '10% ЗНИЖКИ НА ПЕРШЕ ЗАМОВЛЕННЯ',
    ...(bf === 'active' ? ['BLACK FRIDAY. ЗНИЖКИ ДО −30%'] : []),
    ...(bf === 'before' ? ['BLACK FRIDAY З 22 ЛИСТОПАДА. ЗНИЖКИ ДО −30%'] : []),
    ...(GIFT_MASKS_ENABLED ? [`ЗА КОЖНІ ${GIFT_THRESHOLD} ГРН — МАСКА MEDICUBE У ПОДАРУНОК`] : []),
    `БЕЗКОШТОВНА ДОСТАВКА ВІД ${FREE_SHIPPING_THRESHOLD} ГРН`,
  ]
}

export default function AnnouncementBar() {
  const announcements = buildAnnouncements()
  // Duplicate announcements for seamless loop
  const items = [...announcements, ...announcements]

  return (
    <div className="bg-[#E2F9FF] border-b border-gray-200 overflow-hidden py-3">
      <div className="animate-marquee flex whitespace-nowrap pause-animation">
        {items.map((text, index) => (
          <div key={index} className="flex items-center mx-8">
            <span className="text-marquee font-gilroy font-light uppercase tracking-wider text-black">
              {text}
            </span>
            <Image 
              src="/icons/star.png" 
              alt="" 
              width={16} 
              height={16} 
              className="ml-8"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

