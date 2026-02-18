import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Про нас | Eonni — Корейська косметика в Україні',
  description:
    'Eonni — інтернет-магазин оригінальної корейської косметики в Україні. Експертний підбір догляду, швидка доставка, 100% автентичність продукції. Дізнайтесь більше про нашу історію та цінності.',
  keywords: 'корейська косметика, K-beauty, догляд за шкірою, оригінальна косметика, Eonni, купити корейську косметику',
  openGraph: {
    title: 'Про нас | Eonni — Корейська косметика в Україні',
    description:
      'Eonni — інтернет-магазин оригінальної корейської косметики в Україні. Експертний підбір догляду, швидка доставка, 100% автентичність продукції.',
    type: 'website',
    locale: 'uk_UA',
  },
}

const values = [
  {
    icon: '💜',
    title: 'Клієнт понад усе',
    text: 'Кожен клієнт для нас особливий. Ми не просто продаємо косметику — ми допомагаємо знайти ідеальний догляд саме для вас.',
    tone: '#F6F1FF',
  },
  {
    icon: '✨',
    title: '100% оригінальність',
    text: 'Працюємо лише з офіційними дистриб\'юторами та напряму з Кореєю. Кожен продукт має сертифікат автентичності.',
    tone: '#FFF8E9',
  },
  {
    icon: '🎁',
    title: 'Дбайливе пакування',
    text: 'Кожне замовлення пакуємо з любов\'ю: захисна плівка, бабл-пакети та приємні бонуси в кожній посилці.',
    tone: '#F2FBFF',
  },
  {
    icon: '🤝',
    title: 'Прозорість у всьому',
    text: 'Чіткі умови, чесні ціни, зрозумілі правила. Ніяких прихованих платежів чи дрібного шрифту.',
    tone: '#F4F8F3',
  },
]

const team = [
  {
    name: 'Катерина',
    role: 'Засновниця',
    text: 'Закохана в K-beauty вже понад 5 років. Особисто тестує кожен продукт перед додаванням до асортименту.',
  },
]

const milestones = [
  { year: '2026', text: 'Запуск Eonni — втілення мрії про магазин з душею' },
  { year: '2026', text: 'Формування асортименту з найкращих K-beauty брендів' },
  { year: '2026', text: 'Перші задоволені клієнти та позитивні відгуки' },
]

const whyKorea = [
  {
    title: 'Інноваційні формули',
    text: 'Корейська косметологія на 10-15 років випереджає західну. Тут першими з\'явились BB-креми, есенції, тканинні маски.',
  },
  {
    title: 'Природні інгредієнти',
    text: 'Муцин равлика, центела азіатська, рисова вода, женьшень — перевірені століттями компоненти у сучасних формулах.',
  },
  {
    title: 'Багатоетапний догляд',
    text: 'Знаменита 10-етапна рутина — це не примха, а філософія поступового, делікатного догляду за шкірою.',
  },
  {
    title: 'Доступна якість',
    text: 'Преміальні інгредієнти за розумною ціною. Корейські бренди доводять: ефективність не має коштувати статки.',
  },
]

const stats = [
  { value: '100', suffix: '+', label: 'товарів в асортименті' },
  { value: '30', suffix: '+', label: 'брендів K-beauty' },
  { value: '100', suffix: '%', label: 'оригінальна продукція' },
  { value: '24/7', suffix: '', label: 'підтримка клієнтів' },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PromoBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,_rgba(188,194,244,0.55),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_12%,_rgba(255,228,237,0.45),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_20%_80%,_rgba(207,236,254,0.4),_rgba(255,255,255,0)_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] items-center">
            <div>
              <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Про нас</p>
              <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
                Eonni — ваш провідник у світ корейської краси
              </h1>
              <p className="mt-6 text-black font-gilroy text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] max-w-[720px]">
                <strong>Eonni (언니)</strong> — це корейське слово, яким молодші дівчата звертаються до старших сестер. 
                Саме такими ми хочемо бути для вас — надійними порадницями у світі K-beauty, які діляться знаннями та допомагають знайти ідеальний догляд.
              </p>
              <p className="mt-4 text-[#444444] font-gilroy text-[16px] leading-[24px] max-w-[720px]">
                Ми — невеликий сімейний бізнес з великою любов&apos;ю до корейської косметики. Кожен продукт у нашому магазині 
                пройшов особисту перевірку, і ми впевнені в його якості та ефективності.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/catalog"
                  className="inline-flex h-[50px] px-8 items-center justify-center rounded-[12px] bg-[#BCC2F4] text-black uppercase font-gilroy text-[16px] font-semibold transition-colors hover:bg-[#A8AFEB]"
                >
                  Перейти до каталогу
                </Link>
                <Link
                  href="/contacts"
                  className="inline-flex h-[50px] px-8 items-center justify-center rounded-[12px] border-2 border-black text-black uppercase font-gilroy text-[16px] font-semibold transition-colors hover:bg-black hover:text-white"
                >
                  Зв&apos;язатися з нами
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-[#BCC2F4]/30 blur-3xl" />
              <div className="absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-[#FFE4ED]/40 blur-3xl" />
              <div className="rounded-[28px] border border-[#E5E5E5] bg-white/90 backdrop-blur p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#F6F1FF] flex items-center justify-center text-3xl">
                    🇰🇷
                  </div>
                  <div>
                    <p className="font-bebas uppercase text-[24px] text-black">100% Корея</p>
                    <p className="text-[14px] text-[#666666]">Оригінальна продукція</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-[16px] bg-[#F8F7FB] p-4 text-center">
                      <p className="font-bebas text-[32px] text-black">
                        {stat.value}
                        {stat.suffix && <span className="font-gilroy">{stat.suffix}</span>}
                      </p>
                      <p className="text-[12px] text-[#666666] uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-20 bg-[#F8F7FB]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Наша історія</p>
              <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[52px] sm:leading-[56px]">
                Як все почалось
              </h2>
              <div className="mt-6 space-y-4 font-gilroy text-[16px] leading-[24px] text-[#444444]">
                <p>
                  Все почалось з особистої історії. Роками я боролась з проблемною шкірою, перепробувавши десятки 
                  європейських та американських засобів. Нічого не допомагало, поки подруга не привезла мені з Сеула 
                  кілька корейських продуктів.
                </p>
                <p>
                  Результат був вражаючим. За кілька тижнів шкіра почала змінюватись, і я зрозуміла — це те, чим хочу 
                  ділитись з іншими. Так народився Eonni — магазин, де кожен продукт я обираю так, ніби обираю для себе.
                </p>
                <p>
                  Сьогодні ми допомагаємо сотням українок відкрити для себе магію K-beauty. І це лише початок нашої історії.
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-[16px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                >
                  <div className="w-16 h-16 rounded-full bg-[#BCC2F4] flex items-center justify-center">
                    <span className="font-bebas text-[20px] text-black">{milestone.year}</span>
                  </div>
                  <p className="font-gilroy text-[16px] text-black flex-1">{milestone.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="text-center max-w-[640px] mx-auto">
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">Наші цінності</p>
            <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[52px] sm:leading-[56px]">
              Що робить нас особливими
            </h2>
            <p className="mt-4 font-gilroy text-[16px] leading-[24px] text-[#666666]">
              Це не просто слова — це принципи, за якими ми працюємо щодня
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-[24px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-1"
                style={{ backgroundColor: value.tone }}
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="font-bebas uppercase text-[26px] leading-[30px] text-black">
                  {value.title}
                </h3>
                <p className="mt-3 font-gilroy text-[15px] leading-[22px] text-[#444444]">
                  {value.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Korean Cosmetics */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-[#F8F7FB]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid gap-12 lg:grid-cols-[0.9fr,1.1fr] items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999]">K-beauty</p>
              <h2 className="mt-3 font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[52px] sm:leading-[56px]">
                Чому саме корейська косметика?
              </h2>
              <p className="mt-4 font-gilroy text-[16px] leading-[24px] text-[#666666]">
                Корея — світовий лідер у галузі косметології та догляду за шкірою. 
                Ось чому мільйони людей по всьому світу обирають K-beauty.
              </p>
              <div className="mt-8 rounded-[20px] bg-[#BCC2F4]/20 p-6">
                <p className="font-bebas uppercase text-[20px] text-black">Цікавий факт</p>
                <p className="mt-2 font-gilroy text-[15px] leading-[22px] text-[#444444]">
                  Корейці витрачають у середньому $200 на місяць на догляд за шкірою — 
                  це в 4 рази більше, ніж американці. Красива шкіра тут — частина культури.
                </p>
              </div>
            </div>
            <div className="grid gap-5">
              {whyKorea.map((item, index) => (
                <div
                  key={item.title}
                  className="rounded-[20px] border border-[#E5E5E5] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-[#F6F1FF] flex items-center justify-center text-[14px] font-semibold">
                      {index + 1}
                    </span>
                    <h3 className="font-bebas uppercase text-[24px] text-black">{item.title}</h3>
                  </div>
                  <p className="font-gilroy text-[15px] leading-[22px] text-[#444444]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="rounded-[32px] bg-black text-white p-10 sm:p-14">
            <div className="grid gap-10 lg:grid-cols-[1fr,1fr] items-center">
              <div>
                <p className="text-[12px] uppercase tracking-[0.2em] text-white/60">Наші гарантії</p>
                <h2 className="mt-3 font-bebas uppercase text-[40px] leading-[44px] sm:text-[52px] sm:leading-[56px]">
                  Ми відповідаємо за кожен продукт
                </h2>
                <p className="mt-4 font-gilroy text-[16px] leading-[24px] text-white/80">
                  Купуючи в Eonni, ви отримуєте не просто косметику — ви отримуєте впевненість у якості та підтримку на кожному етапі.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[16px] bg-white/10 p-5">
                  <p className="font-bebas uppercase text-[22px]">✓ Оригінальність</p>
                  <p className="mt-2 text-[14px] text-white/70">100% автентична продукція з сертифікатами</p>
                </div>
                <div className="rounded-[16px] bg-white/10 p-5">
                  <p className="font-bebas uppercase text-[22px]">✓ 14 днів на обмін</p>
                  <p className="mt-2 text-[14px] text-white/70">Простий процес повернення без зайвих питань</p>
                </div>
                <div className="rounded-[16px] bg-white/10 p-5">
                  <p className="font-bebas uppercase text-[22px]">✓ Швидка доставка</p>
                  <p className="mt-2 text-[14px] text-white/70">Відправляємо в день замовлення до 18:00</p>
                </div>
                <div className="rounded-[16px] bg-white/10 p-5">
                  <p className="font-bebas uppercase text-[22px]">✓ Підтримка 10-20</p>
                  <p className="mt-2 text-[14px] text-white/70">Відповідаємо на питання щодня</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="rounded-[28px] bg-gradient-to-r from-[#F6F1FF] to-[#FFE8F0] p-10 sm:p-14 text-center">
            <h2 className="font-bebas uppercase text-black text-[40px] leading-[44px] sm:text-[52px] sm:leading-[56px]">
              Готові спробувати K-beauty?
            </h2>
            <p className="mt-4 font-gilroy text-[16px] leading-[24px] text-[#444444] max-w-[600px] mx-auto">
              Почніть свою подорож у світ корейської косметики разом з Eonni. 
              Ми допоможемо підібрати ідеальний догляд саме для вашої шкіри.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/catalog"
                className="inline-flex h-[50px] px-10 items-center justify-center rounded-[12px] bg-black text-white uppercase font-gilroy text-[16px] font-semibold transition-opacity hover:opacity-80"
              >
                Переглянути каталог
              </Link>
              <Link
                href="/blog"
                className="inline-flex h-[50px] px-10 items-center justify-center rounded-[12px] bg-white text-black uppercase font-gilroy text-[16px] font-semibold transition-colors hover:bg-[#F8F7FB] border border-[#E5E5E5]"
              >
                Читати блог
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
