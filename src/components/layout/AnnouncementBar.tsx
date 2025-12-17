'use client'

import Image from 'next/image'

const announcements = [
  '10% ЗНИЖКИ НА ПЕРШЕ ЗАМОВЛЕННЯ',
  'ЗАПРОСИ ПОДРУГУ І ОТРИМАЙ ПОДАРУНОК',
  'ОРИГІНАЛЬНІ КОРЕЙСЬКІ ЗАСОБИ',
  'КУПУЙ СКРАБ ДЛЯ ТІЛА DEAR DOER И ОТРИМАЙ МАСКУ В ПОДАРУНОК',
]

export default function AnnouncementBar() {
  // Duplicate announcements for seamless loop
  const items = [...announcements, ...announcements]

  return (
    <div className="bg-white border-b border-gray-200 overflow-hidden py-3">
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

