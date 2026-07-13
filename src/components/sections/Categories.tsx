'use client'

import Image from 'next/image'
import Link from 'next/link'
import FloatingIcons from '@/components/FloatingIcons'
import Magnetic from '@/components/ui/Magnetic'

interface Category {
  id: string
  name: string
  image: string
  href: string
}

export default function Categories() {
  const categories: Category[] = [
    {
      id: '2',
      name: 'ОБЛИЧЧЯ',
      image: '/categories/category-2.png',
      href: '/catalog?category=face',
    },
    {
      id: '5',
      name: 'ВОЛОССЯ',
      // Woman on pink bg with flowing dark wavy hair, holding hair product — editorial (Lucy Alcorn, user's pick)
      image: '/categories/cat-hair.jpg',
      href: '/catalog?category=hair',
    },
    {
      id: '3',
      name: 'ТІЛО',
      // Woman applying exfoliating scrub to her shoulder on pink bg — body care editorial (user's pick, Jun 2026)
      image: '/categories/cat-body.jpg',
      href: '/catalog?category=body',
    },
    {
      id: '4',
      name: 'HEALTH & CARE',
      // Two gold spoons on pink — capsules + collagen powder — supplement editorial (user's pick)
      image: '/categories/cat-health.jpg',
      href: '/catalog?category=health',
    },
    {
      id: '6',
      name: 'КОСМЕТИЧНІ ДЕВАЙСИ',
      // Woman holding two pink Medicube AGE-R beauty devices on pink bg (user's pick, Jun 2026)
      image: '/categories/cat-devices.jpg',
      href: '/catalog?category=devices',
    },
  ]

  return (
    <section className="relative bg-[#E2F9FF] py-20 sm:py-24 lg:py-28 overflow-hidden">
      <FloatingIcons count={7} offset={6} />
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
        <div className="flex flex-col items-start gap-3 mb-10 sm:mb-14">
          <h2 className="font-bebas text-[56px] leading-[60px] sm:text-[80px] sm:leading-[84px] lg:text-[112px] lg:leading-[112px] uppercase text-black">
            Категорії
          </h2>
          <p
            className="text-black/70 text-[15px] sm:text-[18px] lg:text-[20px] leading-[24px] sm:leading-[28px] max-w-[640px]"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Обери напрямок догляду — а ми підберемо засоби, які підходять саме тобі.
          </p>
        </div>

        <div className="flex gap-4 sm:gap-5 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 snap-x snap-mandatory -mx-6 px-6 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group block snap-start shrink-0 w-[68%] sm:w-[300px] lg:w-auto lg:flex-1"
            >
              <div className="relative w-full aspect-[4/5] rounded-[20px] sm:rounded-[24px] overflow-hidden bg-[#F8F7FB] border border-[#E5E5E5] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="(min-width: 1024px) 280px, (min-width: 640px) 300px, 70vw"
                />

                <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/65 via-black/25 to-transparent pointer-events-none" />

                <h3
                  className="absolute bottom-4 left-4 right-12 sm:bottom-5 sm:left-5 sm:right-14 text-white uppercase whitespace-pre-line text-[17px] leading-[20px] sm:text-[19px] sm:leading-[22px] lg:text-[20px] lg:leading-[23px] font-bold"
                  style={{ fontFamily: 'Gilroy, sans-serif', textShadow: '0 2px 6px rgba(0,0,0,0.45)' }}
                >
                  {category.name}
                </h3>

                <Magnetic strength={10} className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center text-black shadow-md transition-colors duration-300 group-hover:bg-[#6046A3] group-hover:text-white">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Magnetic>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
