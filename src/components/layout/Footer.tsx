import Image from 'next/image'
import Link from 'next/link'

const catalogLinks = [
  'Весь асортимент',
  'Косметика для обличчя',
  'Косметика для тіла',
  'HEALTH & CARE',
  'Макіяж',
  'Знижки',
]

const accountLinks = ['Профіль', 'Відстежити замовлення', 'Вішліст']

const serviceLinks = [
  { label: 'Повернення та Обмін', href: '/returns-exchange' },
  { label: 'Доставка та оплата', href: '/payment-delivery' },
]

const companyLinks = [
  { label: 'Про Нас', href: '/about' },
  { label: 'Контакти', href: '/contacts' },
  { label: 'Умови Ведення Бізнесу', href: '/business-terms' },
  { label: 'Захист Персональних даних', href: '/privacy-policy' },
]

export default function Footer() {
  return (
    <footer className="bg-[#BCC2F4]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px] py-16">
        <div className="grid gap-10 lg:gap-6 lg:grid-cols-[320px_repeat(4,minmax(0,1fr))]">
          <div className="flex flex-col items-center gap-6 text-center">
            <Link href="/" className="inline-flex">
              <Image src="/logo.svg" alt="Eonni" width={260} height={117} />
            </Link>
            <div className="flex items-center justify-center gap-4 w-full">
              <a
                href="mailto:support@eonni.com.ua"
                aria-label="Email"
                className="h-12 w-12 rounded-full flex items-center justify-center bg-white text-black hover:scale-[1.05] transition-transform"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 4H4a2 2 0 0 0-2 2v1.2l10 5.8 10-5.8V6a2 2 0 0 0-2-2Zm0 6.2-8.8 5.1a1 1 0 0 1-1 0L2 10.2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              <a
                href="tel:+380732737330"
                aria-label="Телефон"
                className="h-12 w-12 rounded-full flex items-center justify-center bg-white text-black hover:scale-[1.05] transition-transform"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 15.5c-1.2 0-2.4-.2-3.5-.6-.3-.1-.7 0-.9.2l-1.8 1.8c-2.6-1.3-4.8-3.5-6.1-6.1l1.8-1.8c.3-.3.3-.6.2-.9-.4-1.1-.6-2.3-.6-3.5 0-.5-.4-.9-.9-.9H4C3.4 4 3 4.4 3 5c0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-2.2c0-.5-.4-.9-.9-.9Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/eonni_korean_cosmetics"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-12 w-12 rounded-full flex items-center justify-center bg-white text-black hover:scale-[1.05] transition-transform"
              >
                <Image
                  src="/social/instagram.png"
                  alt="Instagram"
                  width={26}
                  height={26}
                />
              </a>
              <a
                href="https://t.me/eonni_korean_cosmetics"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="h-12 w-12 rounded-full flex items-center justify-center bg-white text-black hover:scale-[1.05] transition-transform"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21.9 3.5c.3-.1.6.2.5.6l-3.5 15c-.1.4-.5.5-.8.3l-4.2-3.1-2.1 2c-.2.2-.6.1-.7-.2l-.7-2.7-3.5-1.1c-.4-.1-.4-.6 0-.8l15.9-10Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="h-12 w-12 rounded-full flex items-center justify-center bg-white text-black hover:scale-[1.05] transition-transform"
              >
                <Image
                  src="/social/tiktok.png"
                  alt="TikTok"
                  width={18}
                  height={24}
                />
              </a>
            </div>
          </div>

          <div>
            <p
              className="text-black uppercase"
              style={{
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '18px',
                lineHeight: '18px',
                fontWeight: 400,
                letterSpacing: '0.01em',
              }}
            >
              Каталог
            </p>
            <ul className="mt-6 flex flex-col gap-[15px]">
              {catalogLinks.map((label) => (
                <li key={label} className="text-black text-[18px] leading-[18px]">
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              className="text-black uppercase"
              style={{
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '18px',
                lineHeight: '18px',
                fontWeight: 400,
                letterSpacing: '0.01em',
              }}
            >
              Мій акаунт
            </p>
            <ul className="mt-6 flex flex-col gap-[15px]">
              {accountLinks.map((label) => (
                <li key={label} className="text-black text-[18px] leading-[18px]">
                  {label}
                </li>
              ))}
            </ul>
            <p
              className="mt-10 text-black uppercase"
              style={{
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '18px',
                lineHeight: '18px',
                fontWeight: 400,
                letterSpacing: '0.01em',
              }}
            >
              Eonni Service
            </p>
            <ul className="mt-6 flex flex-col gap-[15px]">
              {serviceLinks.map((link) => (
                <li key={link.label} className="text-black text-[18px] leading-[18px]">
                  <Link href={link.href} className="hover:text-[#555555] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              className="text-black uppercase"
              style={{
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '18px',
                lineHeight: '18px',
                fontWeight: 400,
                letterSpacing: '0.01em',
              }}
            >
              Компанія
            </p>
            <ul className="mt-6 flex flex-col gap-[15px]">
              {companyLinks.map((link) => (
                <li key={link.label} className="text-black text-[18px] leading-[18px]">
                  <Link href={link.href} className="hover:text-[#555555] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
