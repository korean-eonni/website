import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import FloatingIcons from '@/components/FloatingIcons'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eonni.com.ua').trim().replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Корейська косметика в Києві — магазин Eonni',
  description:
    'Купити корейську косметику в Києві з доставкою в день замовлення. Магазин Eonni: оригінальна K-beauty від Medicube, Mediheal, Torriden, UNOVE, VT Cosmetics. Доставка по всьому Києву та Україні Новою Поштою і кур\'єром.',
  keywords: [
    'корейська косметика київ',
    'купити корейську косметику київ',
    'k-beauty київ',
    'корейські засоби київ',
    'магазин корейської косметики київ',
    'корейська косметика Оболонь',
    'корейська косметика з доставкою київ',
    'eonni київ',
  ],
  alternates: { canonical: '/kyiv' },
  openGraph: {
    title: 'Корейська косметика в Києві — Eonni',
    description: 'Оригінальна K-beauty з доставкою по Києву та Новою Поштою по всій Україні.',
    type: 'website',
    locale: 'uk_UA',
    url: `${SITE_URL}/kyiv`,
  },
}

const cityBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Головна', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Київ', item: `${SITE_URL}/kyiv` },
  ],
}

const cityFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Як замовити корейську косметику в Києві?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Оберіть товари в каталозі Eonni, додайте в кошик, оформіть замовлення та виберіть зручний спосіб доставки: кур\'єром по Києву або Новою Поштою по всій Україні.',
      },
    },
    {
      '@type': 'Question',
      name: 'Скільки коштує доставка корейської косметики в Києві?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Доставка Новою Поштою по Києву — від 70 ₴. Кур\'єр до дверей — від 100 ₴. Безкоштовна доставка від суми замовлення 1500 ₴.',
      },
    },
    {
      '@type': 'Question',
      name: 'Чи можна отримати замовлення в день оформлення?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Так. Кур\'єрська доставка по Києву — у день замовлення. Якщо ви оформите замовлення до 14:00 в будній день, ми відправимо його Новою Поштою того ж дня.',
      },
    },
    {
      '@type': 'Question',
      name: 'Які бренди корейської косметики є в наявності в Києві?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Medicube, Mediheal, Torriden, UNOVE, LACTOFIT, VITAHALO, VT Cosmetics, BIOHEAL BOH, CJ WELLCARE, INNERLAB, ARDIEM — офіційно з Кореї, з повним складом у Києві.',
      },
    },
  ],
}

export default function KyivPage() {
  return (
    <main className="min-h-screen bg-[#E2F9FF] relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityFaq) }}
      />

      {/* Hero */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        <FloatingIcons count={7} offset={5} />
        <div className="relative max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">
            Київ · Оболонь
          </p>
          <h1 className="mt-4 font-bebas uppercase text-black text-[44px] leading-[48px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[84px]">
            Корейська косметика<br />в Києві
          </h1>
          <p className="mt-6 max-w-[720px] text-black font-gilroy text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px]">
            Магазин Eonni — оригінальна K-beauty з доставкою по Києву та всій Україні.
            Догляд за обличчям, тілом і волоссям, корейські БАДи та косметичні девайси від офіційних
            представників. Замовляй до 14:00 — відправляємо того ж дня.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center bg-primary hover:bg-primary-light text-black uppercase font-semibold h-[50px] px-8 transition-all duration-300"
            >
              Каталог
            </Link>
            <Link
              href="/contacts"
              className="inline-flex items-center justify-center bg-black hover:bg-[#333333] text-white uppercase font-semibold tracking-[0.05em] h-[50px] px-8 transition-all duration-300"
            >
              Контакти
            </Link>
          </div>
        </div>
      </section>

      {/* Info blocks */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <p className="text-[14px] uppercase tracking-[0.15em] text-[#4348AE] font-semibold">
              Адреса
            </p>
            <h2 className="mt-3 font-bebas text-[28px] leading-[30px] text-black">
              Київ, Оболонь
            </h2>
            <p className="mt-2 font-gilroy text-[15px] leading-[22px] text-[#4A5061]">
              вул. Левка Лук&apos;яненка, 21<br />
              Оболонський район
            </p>
          </div>
          <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <p className="text-[14px] uppercase tracking-[0.15em] text-[#4348AE] font-semibold">
              Графік
            </p>
            <h2 className="mt-3 font-bebas text-[28px] leading-[30px] text-black">
              Щодня
            </h2>
            <p className="mt-2 font-gilroy text-[15px] leading-[22px] text-[#4A5061]">
              Пн–Пт: 10:00 — 20:00<br />
              Сб–Нд: 11:00 — 18:00
            </p>
          </div>
          <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <p className="text-[14px] uppercase tracking-[0.15em] text-[#4348AE] font-semibold">
              Доставка
            </p>
            <h2 className="mt-3 font-bebas text-[28px] leading-[30px] text-black">
              По Києву
            </h2>
            <p className="mt-2 font-gilroy text-[15px] leading-[22px] text-[#4A5061]">
              Кур&apos;єр у день замовлення<br />
              Нова Пошта від 70 ₴<br />
              Безкоштовно від 1500 ₴
            </p>
          </div>
        </div>
      </section>

      {/* Why Eonni Kyiv */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="font-bebas uppercase text-black text-[32px] leading-[36px] sm:text-[48px] sm:leading-[52px] lg:text-[60px] lg:leading-[64px]">
            Чому кияни обирають Eonni
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-bebas text-[22px] leading-[26px] text-black">
                Оригінальні бренди з Кореї
              </h3>
              <p className="mt-2 font-gilroy text-[15px] leading-[22px] text-[#4A5061]">
                Працюємо безпосередньо з офіційними представниками Medicube, Mediheal,
                Torriden, UNOVE, VT&nbsp;Cosmetics, LACTOFIT, VITAHALO, BIOHEAL&nbsp;BOH,
                CJ&nbsp;WELLCARE, INNERLAB та ARDIEM. Кожен товар має сертифікати
                автентичності.
              </p>
            </div>
            <div>
              <h3 className="font-bebas text-[22px] leading-[26px] text-black">
                Швидке отримання
              </h3>
              <p className="mt-2 font-gilroy text-[15px] leading-[22px] text-[#4A5061]">
                Склад у Києві — повна наявність товарів. Кур&apos;єрська доставка по Києву
                за 2-4 години, відправлення Новою Поштою в будь-який район та місто України
                у день замовлення.
              </p>
            </div>
            <div>
              <h3 className="font-bebas text-[22px] leading-[26px] text-black">
                Експертний підбір догляду
              </h3>
              <p className="mt-2 font-gilroy text-[15px] leading-[22px] text-[#4A5061]">
                Наша команда консультує по типах шкіри, проблемах та послідовності
                нанесення засобів. Безкоштовно — в Instagram-чаті або за телефоном.
              </p>
            </div>
            <div>
              <h3 className="font-bebas text-[22px] leading-[26px] text-black">
                Зручна оплата та повернення
              </h3>
              <p className="mt-2 font-gilroy text-[15px] leading-[22px] text-[#4A5061]">
                Visa/Mastercard, Apple Pay, Google Pay, готівка при отриманні, накладений платіж.
                Повернення товару протягом 14&nbsp;днів без зайвих питань.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
