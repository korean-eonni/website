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

const serviceLinks = ['Повернення та Обмін', 'Доставка та оплата']

const companyLinks = [
  'Про Нас',
  'Контакти',
  'Умови Ведення Бізнесу',
  'Захист Персональних даних',
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
            <a
              href="mailto:support@eonni.com.ua"
              className="text-black text-center"
              style={{
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '18px',
                lineHeight: '18px',
                fontWeight: 400,
                letterSpacing: '0.01em',
              }}
            >
              support@eonni.com.ua
            </a>
            <div className="flex items-center justify-center gap-6 w-full">
              <Image
                src="/social/instagram.png"
                alt="Instagram"
                width={30}
                height={30}
              />
              <Image
                src="/social/tiktok.png"
                alt="TikTok"
                width={18}
                height={24}
              />
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
              {serviceLinks.map((label) => (
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
              Компанія
            </p>
            <ul className="mt-6 flex flex-col gap-[15px]">
              {companyLinks.map((label) => (
                <li key={label} className="text-black text-[18px] leading-[18px]">
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
