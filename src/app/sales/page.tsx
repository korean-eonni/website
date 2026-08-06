import Footer from '@/components/layout/Footer'
import FloatingIcons from '@/components/FloatingIcons'
import Magnetic from '@/components/ui/Magnetic'
import Link from 'next/link'
import type { Metadata } from 'next'
import SalesNewsletter from './SalesNewsletter'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping'

export const metadata: Metadata = {
  title: 'Знижки та акції | Eonni — Вигідні пропозиції на корейську косметику',
  description:
    'Актуальні знижки та спеціальні пропозиції на корейську косметику в Eonni. Знижки до 30%, подарунки до замовлень, вигідні набори. Економте на улюблених брендах!',
  keywords: 'знижки корейська косметика, акції, розпродаж, вигідні набори, Eonni',
  openGraph: {
    title: 'Знижки та акції | Eonni',
    description: 'Актуальні знижки та спеціальні пропозиції на корейську косметику.',
    type: 'website',
    locale: 'uk_UA',
  },
}

const currentOffers = [
  {
    title: 'Безкоштовна доставка',
    description: `При замовленні від ${FREE_SHIPPING_THRESHOLD}₴ доставка Новою Поштою до відділення — безкоштовна!`,
    badge: 'Постійна акція',
    tone: '#F6F1FF',
    icon: '🚚',
    conditions: `Діє на всі замовлення від ${FREE_SHIPPING_THRESHOLD}₴`,
  },
  {
    title: 'Подарунок до замовлення',
    description: 'Отримайте пробники преміум-косметики до кожного замовлення від 800₴.',
    badge: 'Завжди',
    tone: '#FFE8F0',
    icon: '🎁',
    conditions: 'Автоматично додається до замовлення',
  },
  {
    title: 'Знижка на перше замовлення',
    description: 'Новим клієнтам — знижка 10% на перше замовлення з промокодом HELLO10.',
    badge: '-10%',
    tone: '#FFF8E9',
    icon: '👋',
    conditions: 'Промокод: HELLO10',
  },
  {
    title: 'Вигідні набори',
    description: 'Готові набори догляду зі знижкою до 20%. Ідеально для старту в K-beauty!',
    badge: 'до -20%',
    tone: '#E2F9FF',
    icon: '✨',
    conditions: 'Дивіться розділ "Набори" в каталозі',
  },
]

const upcomingOffers = [
  {
    title: 'Весняний розпродаж',
    description: 'Знижки до 30% на весняну колекцію догляду',
    date: 'Березень 2026',
  },
  {
    title: 'День народження Eonni',
    description: 'Святкові знижки та подарунки',
    date: 'Квітень 2026',
  },
]

const savingTips = [
  {
    title: 'Підпишіться на розсилку',
    description: 'Отримуйте ексклюзивні промокоди та дізнавайтесь про акції першими.',
    icon: '📧',
  },
  {
    title: 'Слідкуйте за Instagram',
    description: 'Анонси акцій, розіграші та спеціальні пропозиції для підписників.',
    icon: '📱',
  },
  {
    title: 'Купуйте набори',
    description: 'Готові набори завжди вигідніші, ніж окремі продукти.',
    icon: '📦',
  },
  {
    title: `Замовляйте від ${FREE_SHIPPING_THRESHOLD}₴`,
    description: `Економте на доставці — вона безкоштовна від ${FREE_SHIPPING_THRESHOLD}₴.`,
    icon: '💰',
  },
]

const brands = [
  'COSRX', 'Anua', 'Beauty of Joseon', 'Torriden', 'Medicube', 
  'Some By Mi', 'Isntree', 'Mixsoon', 'Round Lab', 'Skin1004'
]

export default function SalesPage() {
  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <FloatingIcons count={7} offset={2} />
                <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="max-w-[800px]">
            <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Знижки та акції</p>
            <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
              Вигідні пропозиції для вас
            </h1>
            <p className="mt-6 text-black font-gilroy text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px]">
              Ми регулярно радуємо клієнтів знижками та спеціальними пропозиціями. 
              Слідкуйте за оновленнями та економте на улюбленій корейській косметиці!
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Magnetic strength={12}>
                <Link
                  href="/catalog"
                  className="inline-flex h-[50px] px-8 items-center justify-center rounded-[12px] bg-[#BCC2F4] text-black uppercase font-gilroy text-[16px] font-semibold transition-colors duration-300 hover:bg-[#4348AE] hover:text-white"
                >
                  Перейти до каталогу
                </Link>
              </Magnetic>
              <Magnetic strength={12}>
                <a
                  href="https://www.instagram.com/eonni.korean.cosmetics?igsh=eGV0ZmMyZHFmdjQ2&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[50px] px-8 items-center justify-center rounded-[12px] border-2 border-black text-black uppercase font-gilroy text-[16px] font-semibold transition-colors duration-300 hover:bg-black hover:text-white"
                >
                  Instagram
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </section>

      {/* Current Offers */}
      <section className="py-16 sm:py-20 bg-[#E2F9FF]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="text-center max-w-[600px] mx-auto mb-12">
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Актуально</p>
            <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[52px] sm:leading-[56px]">
              Діючі пропозиції
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {currentOffers.map((offer) => (
              <div
                key={offer.title}
                className="rounded-[28px] p-8 border border-[#E5E5E5] relative overflow-hidden"
                style={{ backgroundColor: offer.tone }}
              >
                <div className="absolute top-6 right-6">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-black text-white text-[12px] font-semibold uppercase">
                    {offer.badge}
                  </span>
                </div>
                <div className="text-5xl mb-5">{offer.icon}</div>
                <h3 className="font-bebas uppercase text-[32px] text-black">{offer.title}</h3>
                <p className="mt-3 font-gilroy text-[16px] leading-[24px] text-[#444444]">
                  {offer.description}
                </p>
                <p className="mt-4 text-[14px] text-[#666666] font-semibold">
                  {offer.conditions}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Code */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="rounded-[32px] bg-black text-white p-10 sm:p-14 text-center">
            <p className="text-[12px] uppercase tracking-[0.2em] text-white/60">Промокод для нових клієнтів</p>
            <h2 className="mt-4 font-bebas uppercase text-[48px] sm:text-[64px]">HELLO10</h2>
            <p className="mt-4 font-gilroy text-[18px] text-white/80 max-w-[500px] mx-auto">
              Введіть цей промокод при оформленні першого замовлення та отримайте знижку 10%
            </p>
            <Magnetic strength={12} className="mt-8 inline-block">
            <Link
              href="/catalog"
              className="inline-flex h-[50px] px-10 items-center justify-center rounded-[12px] bg-[#BCC2F4] text-black uppercase font-gilroy text-[16px] font-semibold hover:bg-[#4348AE] hover:text-white transition-colors duration-300"
            >
              Використати промокод
            </Link>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* Upcoming Offers */}
      <section className="py-16 sm:py-20 bg-[#E2F9FF]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid gap-10 lg:grid-cols-[1fr,1.2fr] items-center">
            <div>
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Скоро</p>
              <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[52px] sm:leading-[56px]">
                Очікуйте незабаром
              </h2>
              <p className="mt-4 font-gilroy text-[16px] leading-[24px] text-[#666666]">
                Підпишіться на розсилку або слідкуйте за нами в Instagram, щоб не пропустити найвигідніші пропозиції!
              </p>
            </div>
            <div className="grid gap-4">
              {upcomingOffers.map((offer) => (
                <div
                  key={offer.title}
                  className="rounded-[20px] bg-[#E2F9FF] p-6 border border-[#E5E5E5] flex items-center gap-6"
                >
                  <div className="w-16 h-16 rounded-full bg-[#F6F1FF] flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bebas uppercase text-[24px] text-black">{offer.title}</h3>
                    <p className="text-[14px] text-[#666666]">{offer.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-semibold text-[#BCC2F4]">{offer.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Saving Tips */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="text-center max-w-[600px] mx-auto mb-12">
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Поради</p>
            <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[52px] sm:leading-[56px]">
              Як заощадити більше
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {savingTips.map((tip) => (
              <div
                key={tip.title}
                className="rounded-[24px] border border-[#E5E5E5] bg-[#E2F9FF] p-6 text-center hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-shadow"
              >
                <div className="text-4xl mb-4">{tip.icon}</div>
                <h3 className="font-bebas uppercase text-[22px] text-black">{tip.title}</h3>
                <p className="mt-2 font-gilroy text-[14px] leading-[20px] text-[#666666]">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Brands */}
      <section className="py-16 sm:py-20 bg-[#E2F9FF]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="text-center max-w-[600px] mx-auto mb-10">
            <h2 className="font-bebas uppercase text-black text-[36px] sm:text-[44px]">
              Популярні бренди зі знижками
            </h2>
            <p className="mt-3 font-gilroy text-[16px] text-[#666666]">
              Слідкуйте за акціями на улюблені бренди
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {brands.map((brand) => (
              <Link
                key={brand}
                href={`/catalog?brand=${encodeURIComponent(brand)}`}
                className="px-6 py-3 rounded-full bg-[#E2F9FF] border border-[#E5E5E5] text-[15px] font-gilroy text-black hover:bg-[#BCC2F4] hover:border-[#BCC2F4] transition-colors"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="rounded-[28px] bg-gradient-to-r from-[#F6F1FF] to-[#FFE8F0] p-10 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr,1fr] items-center">
              <div>
                <h2 className="font-bebas uppercase text-black text-[36px] sm:text-[44px]">
                  Не пропустіть знижки!
                </h2>
                <p className="mt-3 font-gilroy text-[16px] text-[#444444]">
                  Підпишіться на розсилку та отримуйте ексклюзивні промокоди, 
                  анонси розпродажів та корисні поради з догляду.
                </p>
              </div>
              <SalesNewsletter />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
