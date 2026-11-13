import Footer from '@/components/layout/Footer'
import FloatingIcons from '@/components/FloatingIcons'
import Link from 'next/link'
import type { Metadata } from 'next'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping'
import { GIFT_THRESHOLD } from '@/lib/giftMasks'

export const metadata: Metadata = {
  alternates: { canonical: '/promotions' },
  title: 'Акції та подарунки | Eonni — корейська косметика',
  description: `Маска Medicube у подарунок за кожні ${GIFT_THRESHOLD} ₴, безкоштовна доставка від ${FREE_SHIPPING_THRESHOLD} ₴, −10% на перше замовлення для зареєстрованих і −10% на догляд після skin-test.`,
  openGraph: {
    title: 'Акції та подарунки | Eonni',
    description: `Подарунки, безкоштовна доставка від ${FREE_SHIPPING_THRESHOLD} ₴ і знижки 10%.`,
    type: 'website',
    locale: 'uk_UA',
  },
}

const promos = [
  {
    icon: '🎁',
    tone: '#FFE8F0',
    title: `Маска Medicube у подарунок до кожних ${GIFT_THRESHOLD} ₴`,
    text: `За кожні повні ${GIFT_THRESHOLD} ₴ у кошику ми додаємо тканинну маску Medicube у подарунок. Замовлення на 3000 ₴ — три маски, на 5000 ₴ — п'ять. Маски з'являються в кошику автоматично.`,
    cta: { label: 'Обрати товари', href: '/catalog' },
  },
  {
    icon: '🚚',
    tone: '#E2F9FF',
    title: `Безкоштовна доставка від ${FREE_SHIPPING_THRESHOLD} ₴`,
    text: `Якщо сума замовлення від ${FREE_SHIPPING_THRESHOLD} ₴, доставку по всій Україні оплачуємо ми.`,
    cta: { label: 'Умови доставки', href: '/payment-delivery' },
  },
  {
    icon: '✨',
    tone: '#F5F3FF',
    title: '−10% на перше замовлення',
    text: 'Зареєструйтеся на сайті, і на ваше перше замовлення діятиме знижка 10%. Вона застосовується автоматично під час оформлення.',
    cta: { label: 'Зареєструватися', href: '/account' },
  },
  {
    icon: '🧴',
    tone: '#FFF7E0',
    title: '−10% на догляд після skin-test',
    text: 'Пройдіть тест, щоб дізнатися свій тип шкіри. Ми підберемо вам догляд, а якщо додати в кошик усю рекомендовану рутину, діятиме знижка 10%. Разом зі знижкою за реєстрацію це −20% на перше замовлення.',
    cta: { label: 'Пройти тест', href: '/skin-test' },
  },
  {
    icon: '🎀',
    tone: '#FFE8F0',
    title: 'Мініатюри, пробники та подарунки в кожній коробочці',
    text: 'У кожне замовлення ми кладемо мініатюри, пробники та приємні подарунки. Так ви можете спробувати нові засоби, перш ніж купити повний об’єм.',
    cta: { label: 'Перейти до каталогу', href: '/catalog' },
  },
]

export default function PromotionsPage() {
  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      <section className="relative overflow-hidden py-16 sm:py-24">
        <FloatingIcons count={7} offset={2} />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Акції та подарунки</p>
          <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
            Більше догляду — більше подарунків
          </h1>
          <p className="mt-6 max-w-[720px] text-black font-gilroy text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px]">
            Усі наші акції в одному місці: подарунки до замовлення, безкоштовна доставка та знижки 10%.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {promos.map((p) => (
              <div key={p.title} className="flex flex-col rounded-[24px] bg-white p-8 shadow-[0_10px_30px_rgba(67,72,174,0.06)]">
                <div className="w-14 h-14 rounded-[16px] flex items-center justify-center text-3xl" style={{ background: p.tone }}>
                  {p.icon}
                </div>
                <h2 className="mt-5 font-bebas uppercase text-black text-[28px] leading-[32px]">{p.title}</h2>
                <p className="mt-3 flex-1 font-gilroy text-[16px] leading-[24px] text-[#444444]">{p.text}</p>
                <Link
                  href={p.cta.href}
                  className="mt-6 inline-flex w-fit h-[46px] px-6 items-center justify-center rounded-[12px] border border-[#4348AE] text-[#4348AE] font-gilroy text-[15px] font-semibold transition-colors hover:bg-[#F5F3FF]"
                >
                  {p.cta.label}
                </Link>
              </div>
            ))}
          </div>

          <Link
            href="/catalog?sale=true"
            className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[24px] bg-[#4348AE] p-8 text-white transition-colors hover:bg-[#373B8A]"
          >
            <div>
              <p className="font-bebas uppercase text-[32px] leading-[36px]">Товари зі знижками</p>
              <p className="mt-2 font-gilroy text-[16px] text-white/80">Подивіться всі товари, на які зараз діє знижка</p>
            </div>
            <span className="inline-flex h-[50px] px-8 items-center justify-center rounded-[12px] bg-white text-[#4348AE] uppercase font-gilroy text-[16px] font-semibold">
              Перейти →
            </span>
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}
