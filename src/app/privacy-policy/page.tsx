import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Політика конфіденційності | Eonni — Захист персональних даних',
  description:
    'Політика конфіденційності інтернет-магазину Eonni. Дізнайтесь, які дані ми збираємо, як їх використовуємо та захищаємо відповідно до законодавства України.',
  keywords: 'політика конфіденційності, захист даних, персональні дані, GDPR, Eonni',
  openGraph: {
    title: 'Політика конфіденційності | Eonni',
    description: 'Як ми захищаємо ваші персональні дані та забезпечуємо приватність.',
    type: 'website',
    locale: 'uk_UA',
  },
}

const sections = [
  {
    id: '1',
    title: 'Вступ',
    icon: '📋',
    content: [
      'Ця Політика конфіденційності описує, як ФОП Людвічук Катерина Миколаївна (далі — «ми», «Eonni») збирає, використовує, зберігає та захищає персональні дані користувачів сайту eonni.com.ua.',
      'Використовуючи наш сайт та оформлюючи замовлення, ви погоджуєтесь з умовами цієї Політики.',
      'Ми дотримуємось вимог Закону України «Про захист персональних даних» та інших нормативних актів.',
    ],
  },
  {
    id: '2',
    title: 'Які дані ми збираємо',
    icon: '📊',
    content: [
      '<strong>Дані, які ви надаєте:</strong>',
      '• Контактна інформація: ім\'я, прізвище, номер телефону, email',
      '• Адреса доставки: місто, відділення пошти або адреса кур\'єрської доставки',
      '• Платіжна інформація: обробляється безпосередньо платіжними системами (LiqPay), ми не зберігаємо дані карток',
      '• Історія замовлень та комунікації з підтримкою',
      '',
      '<strong>Дані, які збираються автоматично:</strong>',
      '• IP-адреса та приблизне географічне розташування',
      '• Тип браузера та операційної системи',
      '• Сторінки, які ви відвідуєте, та час перебування',
      '• Джерело переходу на сайт',
      '• Cookies та аналогічні технології',
    ],
  },
  {
    id: '3',
    title: 'Як ми використовуємо дані',
    icon: '⚙️',
    content: [
      'Ваші персональні дані використовуються для:',
      '• Обробки та виконання замовлень',
      '• Доставки товарів обраним перевізником',
      '• Зв\'язку щодо статусу замовлення',
      '• Надання консультацій та підтримки',
      '• Покращення роботи сайту та сервісу',
      '• Надсилання інформації про акції та новинки (за вашою згодою)',
      '• Виконання юридичних зобов\'язань',
      '',
      'Ми НЕ використовуємо ваші дані для:',
      '• Продажу третім особам',
      '• Надсилання спаму',
      '• Будь-яких цілей, не пов\'язаних з наданням послуг',
    ],
  },
  {
    id: '4',
    title: 'Кому ми передаємо дані',
    icon: '🔗',
    content: [
      'Ми можемо передавати ваші дані:',
      '',
      '<strong>Службам доставки:</strong> Нова Пошта, Укрпошта — для доставки замовлень (ім\'я, телефон, адреса)',
      '',
      '<strong>Платіжним системам:</strong> LiqPay — для обробки онлайн-платежів',
      '',
      '<strong>Аналітичним сервісам:</strong> Google Analytics — для аналізу відвідуваності (анонімізовані дані)',
      '',
      '<strong>Державним органам:</strong> на вимогу відповідно до законодавства України',
      '',
      'Усі партнери зобов\'язані дотримуватись конфіденційності та використовувати дані лише для визначених цілей.',
    ],
  },
  {
    id: '5',
    title: 'Як ми захищаємо дані',
    icon: '🔒',
    content: [
      'Ми вживаємо технічних та організаційних заходів для захисту ваших даних:',
      '• SSL-шифрування при передачі даних',
      '• Захищене зберігання на серверах з обмеженим доступом',
      '• Регулярне оновлення систем безпеки',
      '• Обмежений доступ співробітників до персональних даних',
      '• Використання надійних платіжних шлюзів',
      '',
      'Незважаючи на вжиті заходи, жодна система не може гарантувати 100% безпеку. У разі витоку даних ми негайно повідомимо вас та вживемо необхідних заходів.',
    ],
  },
  {
    id: '6',
    title: 'Cookies та відстеження',
    icon: '🍪',
    content: [
      'Наш сайт використовує cookies — невеликі текстові файли, що зберігаються у вашому браузері.',
      '',
      '<strong>Типи cookies:</strong>',
      '• Необхідні — для роботи кошика та оформлення замовлення',
      '• Функціональні — для збереження ваших налаштувань',
      '• Аналітичні — для розуміння, як ви використовуєте сайт',
      '• Маркетингові — для показу релевантної реклами',
      '',
      'Ви можете налаштувати або відключити cookies у браузері, але це може вплинути на функціональність сайту.',
    ],
  },
  {
    id: '7',
    title: 'Ваші права',
    icon: '✅',
    content: [
      'Відповідно до законодавства, ви маєте право:',
      '',
      '<strong>Право на доступ:</strong> отримати інформацію про те, які ваші дані ми обробляємо',
      '',
      '<strong>Право на виправлення:</strong> вимагати виправлення неточних або неповних даних',
      '',
      '<strong>Право на видалення:</strong> вимагати видалення ваших персональних даних',
      '',
      '<strong>Право на обмеження:</strong> обмежити обробку даних у певних випадках',
      '',
      '<strong>Право на відкликання згоди:</strong> відкликати згоду на обробку даних',
      '',
      '<strong>Право на скаргу:</strong> подати скаргу до Уповноваженого з прав людини',
      '',
      'Для реалізації своїх прав зверніться до нас: support@eonni.com.ua',
    ],
  },
  {
    id: '8',
    title: 'Термін зберігання даних',
    icon: '📅',
    content: [
      'Ми зберігаємо ваші персональні дані протягом:',
      '• Дані замовлень — 3 роки після останнього замовлення (для гарантійних випадків)',
      '• Дані облікового запису — до видалення акаунту',
      '• Cookies — від 30 днів до 2 років залежно від типу',
      '• Бухгалтерські документи — відповідно до законодавства (5-7 років)',
      '',
      'Після закінчення терміну зберігання дані видаляються або анонімізуються.',
    ],
  },
  {
    id: '9',
    title: 'Зміни до політики',
    icon: '📝',
    content: [
      'Ми можемо оновлювати цю Політику конфіденційності.',
      'Про суттєві зміни ми повідомимо на сайті або електронною поштою.',
      'Рекомендуємо періодично переглядати цю сторінку.',
      'Дата останнього оновлення вказана внизу документа.',
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,_rgba(188,194,244,0.5),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_18%,_rgba(255,228,237,0.45),_rgba(255,255,255,0)_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <p className="text-[14px] uppercase tracking-[0.2em] text-[#666666]">Юридична інформація</p>
          <h1 className="mt-4 font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[72px] lg:leading-[76px]">
            Політика конфіденційності
          </h1>
          <p className="mt-6 text-black font-gilroy text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] max-w-[720px]">
            Ваша приватність важлива для нас. Цей документ пояснює, як ми збираємо, використовуємо 
            та захищаємо ваші персональні дані.
          </p>
          <div className="mt-6 text-[14px] text-[#666666]">
            Остання редакція: 15 січня 2026 року
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section className="py-8 bg-[#F8F7FB]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-[16px] bg-white p-5 border border-[#E5E5E5]">
              <div className="text-2xl mb-2">🔒</div>
              <p className="font-gilroy font-semibold text-[15px] text-black">SSL-шифрування</p>
              <p className="text-[13px] text-[#666666]">Захищена передача даних</p>
            </div>
            <div className="rounded-[16px] bg-white p-5 border border-[#E5E5E5]">
              <div className="text-2xl mb-2">🚫</div>
              <p className="font-gilroy font-semibold text-[15px] text-black">Без продажу даних</p>
              <p className="text-[13px] text-[#666666]">Ніколи не продаємо третім особам</p>
            </div>
            <div className="rounded-[16px] bg-white p-5 border border-[#E5E5E5]">
              <div className="text-2xl mb-2">✅</div>
              <p className="font-gilroy font-semibold text-[15px] text-black">Ваші права</p>
              <p className="text-[13px] text-[#666666]">Доступ, виправлення, видалення</p>
            </div>
            <div className="rounded-[16px] bg-white p-5 border border-[#E5E5E5]">
              <div className="text-2xl mb-2">📧</div>
              <p className="font-gilroy font-semibold text-[15px] text-black">Зв\'язок</p>
              <p className="text-[13px] text-[#666666]">support@eonni.com.ua</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[900px] mx-auto px-6 sm:px-8">
          <div className="space-y-12">
            {sections.map((section) => (
              <div
                key={section.id}
                id={`section-${section.id}`}
                className="scroll-mt-32"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{section.icon}</span>
                  <h2 className="font-bebas uppercase text-[32px] sm:text-[36px] text-black">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-3 pl-0 sm:pl-12">
                  {section.content.map((paragraph, index) => (
                    <p
                      key={index}
                      className="font-gilroy text-[16px] leading-[26px] text-[#444444]"
                      dangerouslySetInnerHTML={{ __html: paragraph }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact for Privacy */}
          <div className="mt-16 rounded-[24px] bg-gradient-to-r from-[#F6F1FF] to-[#FFE8F0] p-8">
            <h3 className="font-bebas uppercase text-[28px] text-black mb-4">Питання щодо конфіденційності?</h3>
            <p className="font-gilroy text-[16px] text-[#444444] mb-6">
              Якщо у вас є питання щодо обробки персональних даних або ви хочете реалізувати свої права, 
              зверніться до нас:
            </p>
            <div className="grid gap-3 font-gilroy text-[16px] text-[#444444]">
              <p><strong>Email:</strong> support@eonni.com.ua</p>
              <p><strong>Телефон:</strong> +380 73 273 73 30</p>
              <p><strong>Адреса:</strong> м. Київ, вул. Левка Лук&apos;яненка, буд. 21</p>
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <Link
              href="/business-terms"
              className="rounded-[16px] border border-[#E5E5E5] bg-white p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow"
            >
              <p className="font-bebas uppercase text-[22px] text-black">Умови ведення бізнесу</p>
              <p className="mt-2 text-[14px] text-[#666666]">Публічна оферта та правила магазину</p>
            </Link>
            <Link
              href="/contacts"
              className="rounded-[16px] border border-[#E5E5E5] bg-white p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow"
            >
              <p className="font-bebas uppercase text-[22px] text-black">Контакти</p>
              <p className="mt-2 text-[14px] text-[#666666]">Зв\'яжіться з нами будь-яким зручним способом</p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
