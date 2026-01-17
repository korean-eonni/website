'use client'

import Image from 'next/image'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Navigation */}
          <nav className="hidden flex-1 lg:flex items-center justify-center gap-10 text-[18px] leading-[18px] tracking-[0.01em]">
            <div className="relative group">
              <Link
                href="/catalog"
                className="text-black hover:text-[#666666] transition-colors duration-200"
              >
                Каталог
              </Link>
              <div className="absolute left-1/2 top-full z-20 -translate-x-1/2 pt-3 opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
                <div className="w-[260px] rounded-[14px] border border-[#E5E5E5] bg-white py-3 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
                  {[
                    { label: 'Весь асортимент', href: '/catalog' },
                    { label: 'Косметика для обличчя', href: '/catalog?category=face' },
                    { label: 'Косметика для тіла', href: '/catalog?category=body' },
                    { label: 'HEALTH & CARE', href: '/catalog?category=health' },
                    { label: 'Макіяж', href: '/catalog?category=makeup' },
                    { label: 'Знижки', href: '/sales' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block px-4 py-2 text-[16px] text-black hover:bg-[#F8F7FB] transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/brands"
              className="text-black hover:text-[#666666] transition-colors duration-200"
            >
              Бренди
            </Link>
            <div className="relative group">
              <Link
                href="/about"
                className="text-black hover:text-[#666666] transition-colors duration-200"
              >
                Про нас
              </Link>
              <div className="absolute left-1/2 top-full z-20 -translate-x-1/2 pt-3 opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
                <div className="w-[240px] rounded-[14px] border border-[#E5E5E5] bg-white py-3 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
                  <Link
                    href="/returns-exchange"
                    className="block px-4 py-2 text-[16px] text-black hover:bg-[#F8F7FB] transition-colors"
                  >
                    Повернення та Обмін
                  </Link>
                  <Link
                    href="/payment-delivery"
                    className="block px-4 py-2 text-[16px] text-black hover:bg-[#F8F7FB] transition-colors"
                  >
                    Оплата та доставка
                  </Link>
                  <Link
                    href="/contacts"
                    className="block px-4 py-2 text-[16px] text-black hover:bg-[#F8F7FB] transition-colors"
                  >
                    Контакти
                  </Link>
                </div>
              </div>
            </div>
            <Link
              href="/sales"
              className="text-black hover:text-[#666666] transition-colors duration-200"
            >
              Знижки
            </Link>
            <Link
              href="/blog"
              className="text-black hover:text-[#666666] transition-colors duration-200"
            >
              Блог
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-10 ml-auto">
            <button
              className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
              aria-label="Пошук"
            >
              <Image src="/icons/search.png" alt="Пошук" width={24} height={24} />
            </button>
            <div className="relative group">
              <Link
                href="/account"
                className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
                aria-label="Профіль"
              >
                <Image src="/icons/account.png" alt="Профіль" width={24} height={24} />
              </Link>
              <div className="absolute right-0 top-full z-20 pt-3 opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
                <div className="w-[220px] rounded-[14px] border border-[#E5E5E5] bg-white py-3 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-[16px] text-black hover:bg-[#F8F7FB] transition-colors"
                  >
                    Профіль
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-[16px] text-black hover:bg-[#F8F7FB] transition-colors"
                  >
                    Відстежити замовлення
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block px-4 py-2 text-[16px] text-black hover:bg-[#F8F7FB] transition-colors"
                  >
                    Вішліст
                  </Link>
                </div>
              </div>
            </div>
            <Link
              href="/checkout"
              className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
              aria-label="Оплата"
            >
              <Image src="/icons/Cart 1.png" alt="Оплата" width={24} height={24} />
            </Link>

            {/* Mobile menu trigger */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full border border-[#E5E5E5] hover:bg-[#F8F7FB] transition-colors"
              aria-label="Відкрити меню"
            >
              <span className="block w-5 h-[1px] bg-black relative before:content-[''] before:absolute before:-top-2 before:w-5 before:h-[1px] before:bg-black after:content-[''] after:absolute after:top-2 after:w-5 after:h-[1px] after:bg-black" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
