'use client'

import Image from 'next/image'
import { buildAnnouncements } from '@/lib/announcements'

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

