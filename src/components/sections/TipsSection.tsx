"use client"

import Image from 'next/image'
import Link from 'next/link'

const tips = [
  {
    slug: '10-step-korean-skincare-routine',
    title: 'Що таке 10-етапна корейська рутина?',
    excerpt: 'Кожна ефективна доглядова рутина починається з правильного очищення. Але корейська б\'юті-філософія давно довела, що очищення може бути не просто необхідним етапом, а справжнім ритуалом турботи.',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
  },
  {
    slug: 'best-ingredients-for-hydration',
    title: 'Топ-5 інгредієнтів для зволоження',
    excerpt: 'Гіалуронова кислота, сквалан, центела — розбираємо найефективніші зволожуючі компоненти в корейській косметиці.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
  },
]

export default function TipsSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-10">
          <h2 className="font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[56px] sm:leading-[60px] lg:text-[72px] lg:leading-[72px]">
            Поради від твоєї Eonni
          </h2>
          <Link
            href="/blog"
            className="inline-flex h-[50px] w-[200px] items-center justify-center rounded-[10px] bg-black text-white uppercase font-gilroy text-[16px] font-semibold leading-[18px] transition-opacity duration-300 hover:opacity-80"
          >
            Усі поради
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {tips.map((tip, index) => (
            <Link
              key={tip.slug}
              href={`/blog/${tip.slug}`}
              className={`group relative rounded-[24px] overflow-hidden ${
                index === 0 ? 'lg:row-span-2' : ''
              }`}
            >
              {/* Background Image */}
              <div className={`relative ${index === 0 ? 'aspect-[4/5] lg:aspect-auto lg:h-full' : 'aspect-[16/9]'}`}>
                <Image
                  src={tip.image}
                  alt={tip.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                <h3 className="uppercase text-white font-bebas text-[24px] leading-[28px] sm:text-[32px] sm:leading-[36px] lg:text-[36px] lg:leading-[40px]">
                  {tip.title}
                </h3>
                <p className="mt-3 text-white/80 font-gilroy text-[14px] leading-[20px] sm:text-[16px] sm:leading-[22px] line-clamp-3">
                  {tip.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-white font-gilroy text-[14px] sm:text-[16px] font-semibold group-hover:gap-3 transition-all">
                  Читати далі
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
