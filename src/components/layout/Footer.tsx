import Link from 'next/link'
import Image from 'next/image'
import Magnetic from '@/components/ui/Magnetic'

const catalogLinks = [
  { label: 'Весь асортимент', href: '/catalog' },
  { label: 'Обличчя', href: '/catalog?category=face' },
  { label: 'Волосся', href: '/catalog?category=hair' },
  { label: 'Тіло', href: '/catalog?category=body' },
  { label: 'Health & Care', href: '/catalog?category=health' },
  { label: 'Тестери та аксесуари', href: '/catalog?category=testers' },
  { label: 'Знижки', href: '/catalog?sale=true' },
]

const accountLinks = [
  { label: 'Профіль', href: '/account' },
  { label: 'Мої замовлення', href: '/account?tab=orders' },
  { label: 'Список бажань', href: '/account?tab=wishlist' },
]

const serviceLinks = [
  { label: 'Повернення та обмін', href: '/returns-exchange' },
  { label: 'Доставка та оплата', href: '/payment-delivery' },
  { label: 'Блог', href: '/blog' },
]

const companyLinks = [
  { label: 'Про нас', href: '/about' },
  { label: 'Контакти', href: '/contacts' },
  { label: 'Умови використання', href: '/business-terms' },
  { label: 'Політика конфіденційності', href: '/privacy-policy' },
]

const paymentMethods = [
  { src: '/payments/visa.png', alt: 'Visa' },
  { src: '/payments/mastercard.svg', alt: 'Mastercard' },
  { src: '/payments/prostir.png', alt: 'ПРОСТІР' },
]

export default function Footer() {
  return (
    <footer
      className="bg-center bg-cover"
      style={{ backgroundImage: "url('/promo-gradient.png')" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px] py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Logo & Social */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="block overflow-hidden" style={{ width: 180, height: 60 }}>
                <Image src="/logo.svg" alt="Eonni" width={180} height={82} priority className="block" />
              </span>
            </Link>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              <Magnetic strength={10}>
                <a
                  href="mailto:eonnisupport@gmail.com"
                  aria-label="Email"
                  className="w-11 h-11 rounded-full flex items-center justify-center bg-[#E2F9FF] text-black hover:bg-[#4348AE] hover:text-white transition-colors duration-300"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </Magnetic>
              <Magnetic strength={10}>
                <a
                  href="tel:+380732737330"
                  aria-label="Телефон"
                  className="w-11 h-11 rounded-full flex items-center justify-center bg-[#E2F9FF] text-black hover:bg-[#4348AE] hover:text-white transition-colors duration-300"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </Magnetic>
              <Magnetic strength={10}>
                <a
                  href="https://www.instagram.com/eonni.korean.cosmetics?igsh=eGV0ZmMyZHFmdjQ2&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-11 h-11 rounded-full flex items-center justify-center bg-[#E2F9FF] text-black hover:bg-[#4348AE] hover:text-white transition-colors duration-300"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="18" cy="6" r="1" fill="currentColor"/>
                  </svg>
                </a>
              </Magnetic>
              <Magnetic strength={10}>
                <a
                  href="https://t.me/Eonni_KC"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="w-11 h-11 rounded-full flex items-center justify-center bg-[#E2F9FF] text-black hover:bg-[#4348AE] hover:text-white transition-colors duration-300"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 3L9 13M21 3L14 21L9 13M21 3L3 10L9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </Magnetic>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <p className="text-black font-semibold text-[16px] mb-5">Каталог</p>
            <ul className="space-y-3">
              {catalogLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-black/80 text-[15px] hover:text-black transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-black font-semibold text-[16px] mb-5">Мій акаунт</p>
            <ul className="space-y-3">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-black/80 text-[15px] hover:text-black transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <p className="text-black font-semibold text-[16px] mt-8 mb-5">Допомога</p>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-black/80 text-[15px] hover:text-black transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-black font-semibold text-[16px] mb-5">Компанія</p>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-black/80 text-[15px] hover:text-black transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <p className="text-black font-semibold text-[16px] mb-5">Контакти</p>
            <div className="space-y-3 text-[15px]">
              <p className="text-black/80">
                <a href="tel:+380732737330" className="hover:text-black transition-colors">
                  +380 73 273 73 30
                </a>
              </p>
              <p className="text-black/80">
                <a href="mailto:eonnisupport@gmail.com" className="hover:text-black transition-colors">
                  eonnisupport@gmail.com
                </a>
              </p>
              <p className="text-black/80 mt-4">
                м. Київ, Оболонський район<br />
                вул. Левка Лук&apos;яненка, 21
              </p>
              <p className="text-black/60 text-[13px] mt-4">
                Пн-Пт: 10:00 - 20:00<br />
                Сб-Нд: 11:00 - 18:00
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-black/10">
          {/* Payment methods */}
          <div className="mb-8 flex flex-col items-center justify-center gap-x-4 gap-y-3 sm:flex-row">
            <span className="text-[13px] text-black/55">Приймаємо до оплати</span>
            <ul className="flex flex-wrap items-center justify-center gap-2.5">
              {paymentMethods.map((method) => (
                <li
                  key={method.alt}
                  className="flex h-11 items-center justify-center rounded-xl bg-white px-3 shadow-sm ring-1 ring-black/[0.06]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={method.src}
                    alt={method.alt}
                    loading="lazy"
                    className="h-[24px] w-auto max-w-[84px] object-contain"
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-black/60">
            <p>© 2026 Eonni. Всі права захищені.</p>
            <div className="flex items-center gap-4">
              <Link href="/business-terms" className="hover:text-black transition-colors">
                Умови використання
              </Link>
              <Link href="/privacy-policy" className="hover:text-black transition-colors">
                Конфіденційність
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
