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
            {[
              { href: '/catalog', label: 'Каталог' },
              { href: '/brands', label: 'Бренди' },
              { href: '/about', label: 'Про нас' },
              { href: '/sales', label: 'Знижки' },
              { href: '/blog', label: 'Блог' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-black hover:text-[#666666] transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-10 ml-auto">
            {[
              { src: '/icons/Search.png', alt: 'Пошук' },
              { src: '/icons/Account.png', alt: 'Акаунт' },
              { src: '/icons/Cart 1.png', alt: 'Кошик' },
            ].map((icon) => (
              <button
                key={icon.alt}
                className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
                aria-label={icon.alt}
              >
                <Image src={icon.src} alt={icon.alt} width={24} height={24} />
              </button>
            ))}

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
