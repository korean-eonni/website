import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Blog posts data with enhanced content structure
const blogPosts: Record<string, {
  title: string
  description: string
  category: string
  readTime: string
  date: string
  author: string
  image: string
  content: ContentBlock[]
  relatedProducts?: { name: string; link: string }[]
}> = {
  '10-step-korean-skincare-routine': {
    title: '10-етапна корейська рутина догляду: повний гід для початківців',
    description: 'Розбираємось, що таке знаменита корейська рутина, чи потрібні всі 10 кроків, і як адаптувати її під свій тип шкіри. Покроковий гід з рекомендаціями продуктів.',
    category: 'Догляд',
    readTime: '8 хв',
    date: '15 січня 2025',
    author: 'Катерина',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&q=80',
    content: [
      { type: 'heading', level: 2, text: 'Що таке 10-етапна корейська рутина?' },
      { type: 'paragraph', text: 'Корейська 10-етапна рутина догляду — це не просто набір продуктів, а ціла філософія ставлення до шкіри. На відміну від західного підходу "швидко та ефективно", корейці вірять у поступовий, делікатний догляд, де кожен крок має своє призначення.' },
      { type: 'callout', variant: 'info', title: 'Важливо розуміти', text: '10 кроків — це максимум, а не обов\'язковий мінімум. Більшість корейських жінок використовують 5-7 продуктів щодня, а повну рутину застосовують лише увечері або кілька разів на тиждень.' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80', alt: 'Корейська косметика', caption: 'Правильний порядок нанесення — ключ до ефективності' },
      { type: 'heading', level: 2, text: '10 кроків корейської рутини' },
      { type: 'step', number: 1, title: 'Очищення олією', text: 'Перший етап подвійного очищення. Олія розчиняє макіяж, санскрін та себум — те, що водою не змити. Нанесіть на суху шкіру, помасажуйте 1-2 хвилини, потім змийте водою.' },
      { type: 'recommendation', text: 'Рекомендуємо: гідрофільні олії від Anua, Beauty of Joseon, Isntree.' },
      { type: 'step', number: 2, title: 'Водне очищення', text: 'Другий етап очищення видаляє залишки олії та забруднення. Обирайте м\'які засоби з нейтральним pH (5.5-6.5), щоб не порушити захисний бар\'єр шкіри.' },
      { type: 'recommendation', text: 'Рекомендуємо: COSRX Low pH Good Morning Gel Cleanser, Round Lab Dokdo Cleanser.' },
      { type: 'step', number: 3, title: 'Ексфоліація', text: 'Видалення мертвих клітин для сяючої шкіри. Корейці віддають перевагу м\'яким хімічним ексфоліантам (AHA, BHA, PHA) замість скрабів. Використовуйте 1-3 рази на тиждень.' },
      { type: 'recommendation', text: 'Рекомендуємо: COSRX BHA Blackhead Power Liquid, Some By Mi AHA-BHA-PHA Toner.' },
      { type: 'step', number: 4, title: 'Тонер', text: 'Відновлює pH шкіри після очищення та готує її до наступних етапів. Корейські тонери зволожують, а не сушать, як західні.' },
      { type: 'recommendation', text: 'Рекомендуємо: Anua Heartleaf 77% Soothing Toner, Isntree Hyaluronic Acid Toner.' },
      { type: 'step', number: 5, title: 'Есенція', text: 'Легка, водяниста текстура з концентрованими активами. Есенція — серце корейської рутини, вона покращує текстуру та сяяння шкіри.' },
      { type: 'recommendation', text: 'Рекомендуємо: COSRX Advanced Snail 96 Mucin Power Essence.' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80', alt: 'Сироватки та есенції', caption: 'Есенція — серце корейської рутини догляду' },
      { type: 'step', number: 6, title: 'Сироватка або ампула', text: 'Найконцентрованіший продукт у рутині. Обирайте за потребою: ніацинамід для пор, вітамін C для сяяння, ретинол для анти-ейдж.' },
      { type: 'recommendation', text: 'Рекомендуємо: Beauty of Joseon Glow Serum, Torriden Dive-In Serum.' },
      { type: 'step', number: 7, title: 'Тканинна маска', text: 'Інтенсивне зволоження та живлення. Тримайте 15-20 хвилин, не давайте висохнути на обличчі. Використовуйте 1-3 рази на тиждень.' },
      { type: 'recommendation', text: 'Рекомендуємо: Mediheal, Abib, Dr.Jart+.' },
      { type: 'step', number: 8, title: 'Крем для очей', text: 'Делікатна зона навколо очей потребує окремого догляду. Наносьте безіменним пальцем легкими поплескуваннями.' },
      { type: 'recommendation', text: 'Рекомендуємо: Mizon Snail Repair Eye Cream.' },
      { type: 'step', number: 9, title: 'Зволожуючий крем', text: 'Закріплює всі попередні шари та створює захисний бар\'єр. Текстуру обирайте за типом шкіри: гель для жирної, крем для сухої.' },
      { type: 'recommendation', text: 'Рекомендуємо: COSRX Oil-Free Moisturizing Lotion, Illiyoon Ceramide Ato Cream.' },
      { type: 'step', number: 10, title: 'Сонцезахисний крем', text: 'Найважливіший крок! SPF захищає від передчасного старіння, пігментації та раку шкіри. Наносьте щодня, навіть у хмарну погоду. Тільки вранці.' },
      { type: 'recommendation', text: 'Рекомендуємо: Beauty of Joseon Relief Sun, Isntree Hyaluronic Acid Watery Sun Gel.' },
      { type: 'heading', level: 2, text: 'Як адаптувати рутину під себе' },
      { type: 'grid', columns: 3, items: [
        { title: 'Жирна шкіра', icon: '💧', items: ['Пропустіть олійні текстури', 'Обирайте гелеві зволожувачі', 'BHA-ексфоліація 2-3 рази/тиждень', 'Легкі водянисті санскріни'] },
        { title: 'Суха шкіра', icon: '🌸', items: ['Додайте більше зволожуючих шарів', 'Обирайте кремові текстури', 'AHA-ексфоліація 1-2 рази/тиждень', 'Живильні олії та бальзами'] },
        { title: 'Чутлива шкіра', icon: '🌿', items: ['Мінімум активів', 'Центела, алое, пантенол', 'PHA замість AHA/BHA', 'Завжди тестуйте нові продукти'] },
      ]},
      { type: 'heading', level: 2, text: 'Мінімальна рутина на кожен день' },
      { type: 'paragraph', text: 'Якщо 10 кроків здаються занадто складними, почніть з базової рутини:' },
      { type: 'twoColumn', left: { title: '☀️ Ранок', items: ['Очищення', 'Тонер', 'Зволоження', 'SPF'] }, right: { title: '🌙 Вечір', items: ['Подвійне очищення', 'Тонер', 'Сироватка', 'Зволоження'] }},
      { type: 'callout', variant: 'tip', title: 'Порада', text: 'Поступово додавайте нові продукти, спостерігаючи за реакцією шкіри. K-beauty — це марафон, а не спринт!' },
    ],
    relatedProducts: [
      { name: 'COSRX Advanced Snail 96 Mucin Power Essence', link: '/catalog?search=cosrx+snail' },
      { name: 'Anua Heartleaf 77% Soothing Toner', link: '/catalog?search=anua+toner' },
      { name: 'Beauty of Joseon Relief Sun', link: '/catalog?search=beauty+joseon+sun' },
    ],
  },
  'best-ingredients-for-hydration': {
    title: 'Топ-5 інгредієнтів для глибокого зволоження шкіри',
    description: 'Гіалуронова кислота, сквалан, центела — розбираємо найефективніші зволожуючі компоненти в корейській косметиці та як їх правильно комбінувати.',
    category: 'Інгредієнти',
    readTime: '6 хв',
    date: '10 січня 2025',
    author: 'Катерина',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&q=80',
    content: [
      { type: 'heading', level: 2, text: 'Чому зволоження — основа здорової шкіри' },
      { type: 'paragraph', text: 'Зволожена шкіра — це не лише про комфорт. Достатній рівень гідратації забезпечує правильну роботу захисного бар\'єру, запобігає передчасному старінню та навіть допомагає контролювати жирність (так, зневоднена шкіра часто виробляє більше себу|му!).' },
      { type: 'paragraph', text: 'Корейська косметика славиться своїми зволожуючими формулами. Розберемо топ-5 інгредієнтів, які варто шукати в складі.' },
      { type: 'ingredientCard', number: 1, name: 'Гіалуронова кислота', subtitle: 'Hyaluronic Acid', description: 'Природний компонент нашої шкіри, який утримує вологу. Одна молекула ГК може зв\'язати до 1000 молекул води!', benefits: ['Високомолекулярна — залишається на поверхні', 'Низькомолекулярна — проникає глибше', 'Найкращі формули містять обидва типи'], warning: 'ГК "тягне" вологу з навколишнього середовища. У сухому кліматі завжди закривайте шар ГК кремом!', products: ['Torriden Dive-In Serum', 'Isntree Hyaluronic Acid Toner'] },
      { type: 'image', src: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80', alt: 'Зволожуючі сироватки', caption: 'Гіалуронова кислота — must-have для зволоження' },
      { type: 'ingredientCard', number: 2, name: 'Сквалан', subtitle: 'Squalane', description: 'Стабілізована версія сквалену, який природно присутній у нашій шкірі. Отримують з оливок або цукрової тростини.', benefits: ['Імітує природні ліпіди шкіри', 'Не комедогенний', 'Підходить для жирної шкіри', 'Зміцнює захисний бар\'єр'], products: ['The Ordinary Squalane', 'Purito Dermide Cica Sleeping Pack'] },
      { type: 'ingredientCard', number: 3, name: 'Центела азіатська', subtitle: 'Centella Asiatica', description: 'Рослина з Азії, яку використовують у медицині тисячі років. У K-beauty — справжня зірка!', benefits: ['Мадекасосид — заспокоює подразнення', 'Азіатикозид — стимулює колаген', 'Мадекасова кислота — загоює пошкодження'], idealFor: ['Чутливої шкіри', 'Шкіри після процедур', 'Акне та постакне'], products: ['Anua Heartleaf Toner', 'COSRX Centella Blemish Cream', 'Skin1004 Centella Ampoule'] },
      { type: 'ingredientCard', number: 4, name: 'Бета-глюкан', subtitle: 'Beta-Glucan', description: 'Полісахарид з грибів або дріжджів. Менш відомий, ніж ГК, але не менш ефективний!', benefits: ['Зволожує на 20% краще за ГК', 'Заспокоює та зменшує почервоніння', 'Підтримує імунітет шкіри', 'Антиоксидантна дія'], products: ['Iunik Beta Glucan Serum', 'iUNIK Centella Calming Gel Cream'] },
      { type: 'ingredientCard', number: 5, name: 'Кераміди', subtitle: 'Ceramides', description: 'Ліпіди, які складають близько 50% захисного бар\'єру шкіри. З віком їх кількість зменшується.', benefits: ['Відновлюють пошкоджений бар\'єр', 'Утримують вологу всередині', 'Захищають від зовнішніх агресорів'], idealFor: ['Сухої шкіри', 'Зрілої шкіри', 'Після агресивних процедур'], products: ['Illiyoon Ceramide Ato Cream', 'Dr.Jart+ Ceramidin Cream'] },
      { type: 'heading', level: 2, text: 'Як комбінувати інгредієнти' },
      { type: 'callout', variant: 'tip', title: 'Ідеальна формула зволоження', text: '1. Водорозчинні (ГК, бета-глюкан) — перший шар\n2. Заспокійливі (центела) — другий шар\n3. Ліпідні (сквалан, кераміди) — останній шар для "запечатування"' },
      { type: 'paragraph', text: 'Порядок нанесення: від найлегшої текстури до найщільнішої. Водянисті сироватки → креми → олії.' },
      { type: 'heading', level: 2, text: 'Висновок' },
      { type: 'paragraph', text: 'Зволоження — це не один продукт, а система. Комбінуйте різні типи зволожувачів для максимального ефекту. І пам\'ятайте: пити воду теж важливо, але зволоження шкіри — це в першу чергу про правильний догляд!' },
    ],
    relatedProducts: [
      { name: 'Torriden Dive-In Serum', link: '/catalog?search=torriden' },
      { name: 'Anua Heartleaf Toner', link: '/catalog?search=anua' },
      { name: 'Illiyoon Ceramide Cream', link: '/catalog?search=illiyoon' },
    ],
  },
  'how-to-choose-sunscreen': {
    title: 'Як обрати сонцезахисний крем: SPF, PA та інші секрети',
    description: 'Чому корейські санскріни такі популярні та як обрати ідеальний захист для вашого типу шкіри. Розбираємо SPF, PA+++, хімічні та фізичні фільтри.',
    category: 'Захист',
    readTime: '7 хв',
    date: '5 січня 2025',
    author: 'Катерина',
    image: 'https://images.unsplash.com/photo-1526758097130-bab247274f58?w=1200&q=80',
    content: [
      { type: 'heading', level: 2, text: 'Чому сонцезахист — найважливіший крок у догляді' },
      { type: 'paragraph', text: 'Якби мене попросили обрати лише один продукт для догляду за шкірою, це був би санскрін. Ось чому:' },
      { type: 'statGrid', stats: [
        { value: '90%', label: 'видимого старіння спричинене UV' },
        { value: '80%', label: 'UV проникає крізь хмари' },
        { value: '2x', label: 'гірше працюють сироватки без SPF' },
      ]},
      { type: 'heading', level: 2, text: 'SPF та PA — що означають ці цифри?' },
      { type: 'twoColumn', left: { title: 'SPF (Sun Protection Factor)', description: 'Показує захист від UVB-променів, які викликають опіки.', items: ['SPF 15 — блокує 93% UVB', 'SPF 30 — блокує 97% UVB', 'SPF 50 — блокує 98% UVB'] }, right: { title: 'PA (Protection Grade of UVA)', description: 'Корейська система оцінки захисту від UVA-променів (старіння).', items: ['PA+ — деякий захист', 'PA++ — помірний захист', 'PA+++ — високий захист', 'PA++++ — найвищий захист'] }},
      { type: 'callout', variant: 'info', title: 'Рекомендація', text: 'Різниця між SPF 30 та 50 мінімальна. Набагато важливіше правильно наносити та оновлювати захист. Обирайте мінімум PA+++ для щоденного використання.' },
      { type: 'heading', level: 2, text: 'Хімічні vs фізичні фільтри' },
      { type: 'comparison', items: [
        { title: 'Хімічні фільтри', subtitle: 'Поглинають UV та перетворюють на тепло', pros: ['Легка текстура', 'Без білого відтінку', 'Добре під макіяж'], cons: ['Можуть подразнювати', 'Деякі нестабільні на сонці'], examples: 'Avobenzone, Homosalate, Octinoxate' },
        { title: 'Фізичні фільтри', subtitle: 'Відбивають UV від поверхні шкіри', pros: ['Для чутливої шкіри', 'Працюють одразу', 'Стабільні на сонці'], cons: ['Білий відтінок', 'Щільніша текстура'], examples: 'Zinc Oxide, Titanium Dioxide' },
      ]},
      { type: 'image', src: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', alt: 'Сонцезахисні креми', caption: 'Корейські санскріни — легкі та комфортні' },
      { type: 'heading', level: 2, text: 'Чому корейські санскріни такі популярні?' },
      { type: 'featureList', items: [
        { icon: '✨', title: 'Легкі текстури', text: 'Текстура молочка або есенції без липкості' },
        { icon: '💧', title: 'Догляд + захист', text: 'Гіалуронова кислота, центела, ніацинамід у складі' },
        { icon: '💄', title: 'Під макіяж', text: 'Ідеальна база, не скочуються під тональним' },
        { icon: '💰', title: 'Доступна ціна', text: 'Якісний захист за розумні гроші' },
      ]},
      { type: 'heading', level: 2, text: 'Як обрати санскрін за типом шкіри' },
      { type: 'grid', columns: 2, items: [
        { title: 'Жирна шкіра', icon: '💧', items: ['Легкі гелеві текстури', 'Матуючі формули', 'Без олій'], recommendation: 'Isntree Hyaluronic Acid Watery Sun Gel' },
        { title: 'Суха шкіра', icon: '🌸', items: ['Кремові текстури', 'З гіалуроновою кислотою', 'Без спирту'], recommendation: 'Beauty of Joseon Relief Sun' },
        { title: 'Чутлива шкіра', icon: '🌿', items: ['Мінеральні фільтри', 'Без ароматизаторів', 'Центела, алое'], recommendation: 'Purito Daily Go-To Sunscreen' },
        { title: 'Комбінована шкіра', icon: '⚖️', items: ['Легкі, але зволожуючі', 'Не комедогенні'], recommendation: 'Skin1004 Centella Air-Fit Sun Cream' },
      ]},
      { type: 'heading', level: 2, text: 'Як правильно наносити санскрін' },
      { type: 'stepList', items: [
        { title: 'Кількість', text: '2 пальці — стандартна порція для обличчя (1/4 чайної ложки)' },
        { title: 'Коли наносити', text: 'Останній крок ранкової рутини, за 15-20 хв до виходу' },
        { title: 'Коли оновлювати', text: 'Кожні 2 години на сонці, після купання або потіння' },
      ]},
      { type: 'callout', variant: 'warning', title: 'Поширені помилки', text: '• "Сьогодні хмарно" — 80% UV проникає крізь хмари\n• "Я в приміщенні" — UVA проникає крізь вікна\n• "Мій тональний має SPF" — цього недостатньо\n• "Наношу трохи" — недостатня кількість = недостатній захист' },
      { type: 'heading', level: 2, text: 'Висновок' },
      { type: 'paragraph', text: 'Санскрін — це інвестиція в майбутнє вашої шкіри. Знайдіть текстуру, яка вам подобається, і використовуйте щодня. Ваша шкіра через 10 років скаже вам дякую!' },
    ],
    relatedProducts: [
      { name: 'Beauty of Joseon Relief Sun', link: '/catalog?search=beauty+joseon+sun' },
      { name: 'Isntree Hyaluronic Acid Watery Sun Gel', link: '/catalog?search=isntree+sun' },
      { name: 'COSRX Aloe Soothing Sun Cream', link: '/catalog?search=cosrx+sun' },
    ],
  },
  'double-cleansing-guide': {
    title: 'Подвійне очищення: навіщо потрібне та як робити правильно',
    description: 'Секрет чистої шкіри без пересушування. Все про гідрофільні олії, бальзами та другий етап очищення.',
    category: 'Очищення',
    readTime: '5 хв',
    date: '28 грудня 2024',
    author: 'Катерина',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=1200&q=80',
    content: [
      { type: 'heading', level: 2, text: 'Що таке подвійне очищення?' },
      { type: 'paragraph', text: 'Подвійне очищення — це метод очищення шкіри у два етапи: спочатку олійним засобом, потім водним. Цей підхід прийшов з Кореї та став золотим стандартом у світі K-beauty.' },
      { type: 'callout', variant: 'info', title: 'Чому це важливо?', text: 'Олійний засіб розчиняє жиророзчинні забруднення (макіяж, санскрін, себум), а водний — видаляє водорозчинні (піт, пил, залишки олії).' },
      { type: 'heading', level: 2, text: 'Перший етап: олійне очищення' },
      { type: 'grid', columns: 3, items: [
        { title: 'Гідрофільна олія', icon: '💧', items: ['Найпопулярніший варіант', 'Легко емульгується з водою', 'Універсальна'] },
        { title: 'Бальзам', icon: '🧈', items: ['Щільніша текстура', 'Ідеальна для сухої шкіри', 'Масажний ефект'] },
        { title: 'Міцелярна олія', icon: '✨', items: ['Легша версія', 'Для жирної шкіри', 'Швидке очищення'] },
      ]},
      { type: 'stepList', items: [
        { title: 'Нанесіть на СУХУ шкіру', text: 'Це важливо! Олія не працює на мокрій шкірі' },
        { title: 'Масажуйте 1-2 хвилини', text: 'Круговими рухами, особливо в зоні Т' },
        { title: 'Додайте воду', text: 'Олія перетвориться на молочко' },
        { title: 'Змийте теплою водою', text: 'Не гарячою, щоб не пересушити шкіру' },
      ]},
      { type: 'recommendation', text: 'Рекомендуємо: Anua Heartleaf Pore Control Cleansing Oil, Beauty of Joseon Radiance Cleansing Balm' },
      { type: 'image', src: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80', alt: 'Подвійне очищення', caption: 'Правильне очищення — основа здорової шкіри' },
      { type: 'heading', level: 2, text: 'Другий етап: водне очищення' },
      { type: 'featureList', items: [
        { icon: '🫧', title: 'Гель для вмивання', text: 'Універсальний варіант для будь-якого типу шкіри' },
        { icon: '☁️', title: 'Пінка', text: 'Краще пінится, але може сушити' },
        { icon: '🥛', title: 'Молочко', text: 'Делікатне, для сухої та чутливої шкіри' },
      ]},
      { type: 'callout', variant: 'tip', title: 'На що звернути увагу', text: '• pH 5.5-6.5 — нейтральний, не порушує бар\'єр\n• Без SLS/SLES — агресивні ПАР сушать шкіру\n• Шкіра не повинна "скрипіти" після вмивання' },
      { type: 'recommendation', text: 'Рекомендуємо: COSRX Low pH Good Morning Gel Cleanser, Round Lab Dokdo Cleanser' },
      { type: 'heading', level: 2, text: 'Коли потрібне подвійне очищення?' },
      { type: 'twoColumn', left: { title: '✅ Обов\'язково', items: ['Ввечері після санскріну', 'Після макіяжу', 'Після фізичних навантажень'] }, right: { title: '❌ Не обов\'язково', items: ['Вранці (достатньо води)', 'Весь день вдома без макіяжу'] }},
      { type: 'heading', level: 2, text: 'Поширені помилки' },
      { type: 'callout', variant: 'warning', title: 'Уникайте цих помилок', text: '1. Використання олії на мокру шкіру — олія не зможе розчинити забруднення\n2. Занадто швидке змивання — дайте олії час працювати\n3. Агресивне тертя — делікатні рухи ефективніші\n4. Пропуск другого етапу — залишки олії можуть забивати пори' },
      { type: 'heading', level: 2, text: 'Висновок' },
      { type: 'paragraph', text: 'Подвійне очищення — це основа здорової шкіри. Спробуйте цей метод протягом тижня, і ви помітите різницю: шкіра стане чистішою, але при цьому не буде пересушеною.' },
    ],
    relatedProducts: [
      { name: 'Anua Cleansing Oil', link: '/catalog?search=anua+cleansing' },
      { name: 'COSRX Low pH Cleanser', link: '/catalog?search=cosrx+cleanser' },
      { name: 'Round Lab Dokdo Cleanser', link: '/catalog?search=round+lab' },
    ],
  },
  'snail-mucin-benefits': {
    title: 'Муцин равлика: чому він такий популярний?',
    description: 'Розбираємо науку за трендовим інгредієнтом та рекомендуємо найкращі продукти з муцином.',
    category: 'Інгредієнти',
    readTime: '5 хв',
    date: '20 грудня 2024',
    author: 'Катерина',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80',
    content: [
      { type: 'heading', level: 2, text: 'Що таке муцин равлика?' },
      { type: 'paragraph', text: 'Муцин равлика (Snail Secretion Filtrate) — це слиз, який виробляють равлики для захисту та відновлення своєї шкіри. У косметиці використовується фільтрований та очищений муцин, який є справжнім скарбом для нашої шкіри.' },
      { type: 'callout', variant: 'info', title: 'Етичність', text: 'Не хвилюйтесь — равликам не шкодять! Їх розміщують на спеціальних сітках, де вони вільно повзають. Муцин збирають, фільтрують та додають у косметичні формули. Це етичний та безпечний процес.' },
      { type: 'heading', level: 2, text: 'Які переваги муцину?' },
      { type: 'featureList', items: [
        { icon: '💧', title: 'Глибоке зволоження', text: 'Містить гіалуронову та гліколеву кислоту природного походження' },
        { icon: '🩹', title: 'Загоєння та відновлення', text: 'Алантоїн прискорює регенерацію при постакне та подразненнях' },
        { icon: '⏳', title: 'Антивіковий ефект', text: 'Колаген та еластин підтримують пружність шкіри' },
        { icon: '✨', title: 'Освітлення', text: 'Вирівнює тон шкіри та зменшує пігментацію' },
      ]},
      { type: 'image', src: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80', alt: 'Продукти з муцином', caption: 'Муцин равлика — один з найпопулярніших K-beauty інгредієнтів' },
      { type: 'heading', level: 2, text: 'Для кого підходить?' },
      { type: 'grid', columns: 2, items: [
        { title: 'Суха шкіра', icon: '🏜️', items: ['Глибоке зволоження', 'Відновлення бар\'єру'] },
        { title: 'Проблемна шкіра', icon: '🎯', items: ['Загоєння постакне', 'Заспокоєння запалень'] },
        { title: 'Зріла шкіра', icon: '🌟', items: ['Антивіковий догляд', 'Підвищення пружності'] },
        { title: 'Чутлива шкіра', icon: '🌸', items: ['Заспокоєння', 'Але спочатку протестуйте!'] },
      ]},
      { type: 'heading', level: 2, text: 'Найкращі продукти з муцином' },
      { type: 'productHighlight', products: [
        { name: 'COSRX Advanced Snail 96 Mucin Power Essence', description: 'Культовий продукт з 96% муцину. Легка текстура, швидко вбирається.' },
        { name: 'Mizon All In One Snail Repair Cream', description: 'Крем з 92% муцину. Відмінно зволожує та відновлює шкіру.' },
        { name: 'Benton Snail Bee High Content Essence', description: 'Комбінація муцину та бджолиної отрути для проблемної шкіри.' },
      ]},
      { type: 'heading', level: 2, text: 'Як використовувати?' },
      { type: 'stepList', items: [
        { title: 'Очистіть шкіру', text: 'Подвійне очищення для максимального ефекту' },
        { title: 'Нанесіть тонер', text: 'Підготуйте шкіру до активів' },
        { title: 'Есенція з муцином', text: 'Нанесіть на все обличчя легкими рухами' },
        { title: 'Закрийте кремом', text: 'Зафіксуйте всі корисні компоненти' },
      ]},
      { type: 'callout', variant: 'tip', title: 'Порада', text: 'Муцин можна поєднувати майже з будь-якими інгредієнтами. Він добре працює з вітаміном C, ніацинамідом, ретинолом.' },
      { type: 'heading', level: 2, text: 'Висновок' },
      { type: 'paragraph', text: 'Муцин равлика — це не просто тренд, а науково підтверджений інгредієнт з безліччю переваг. Спробуйте — і ваша шкіра скаже дякую!' },
    ],
    relatedProducts: [
      { name: 'COSRX Snail Mucin Essence', link: '/catalog?search=cosrx+snail' },
      { name: 'Mizon Snail Repair Cream', link: '/catalog?search=mizon+snail' },
      { name: 'Benton Snail Bee Essence', link: '/catalog?search=benton+snail' },
    ],
  },
  'winter-skincare-tips': {
    title: 'Зимовий догляд: як захистити шкіру від холоду',
    description: 'Поради щодо адаптації рутини для холодної пори року та продукти, які врятують від сухості.',
    category: 'Догляд',
    readTime: '6 хв',
    date: '15 грудня 2024',
    author: 'Катерина',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80',
    content: [
      { type: 'heading', level: 2, text: 'Чому взимку шкірі потрібен особливий догляд?' },
      { type: 'paragraph', text: 'Холодне повітря на вулиці та сухе тепле в приміщенні — це подвійний удар по шкірі. Захисний бар\'єр слабшає, волога випаровується швидше, і шкіра стає сухою, чутливою та схильною до подразнень.' },
      { type: 'statGrid', stats: [
        { value: '-40%', label: 'вологості в повітрі взимку' },
        { value: '2x', label: 'швидше випаровується волога' },
        { value: '+30%', label: 'збільшується чутливість' },
      ]},
      { type: 'heading', level: 2, text: 'Як адаптувати рутину для зими' },
      { type: 'featureList', items: [
        { icon: '🧴', title: 'Замініть гель на крем', text: 'Легкі гелі чудові влітку, але взимку потрібні щільніші формули' },
        { icon: '💧', title: 'Додайте олію', text: 'Кілька крапель поверх крему "запечатають" вологу' },
        { icon: '🧪', title: 'Зменшіть ексфоліацію', text: 'Скоротіть кислоти до 1-2 разів на тиждень' },
        { icon: '☀️', title: 'Не забувайте SPF', text: 'Сніг відбиває до 80% UV-випромінювання!' },
      ]},
      { type: 'image', src: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80', alt: 'Зимовий догляд', caption: 'Зимова рутина потребує більше зволоження' },
      { type: 'heading', level: 2, text: 'Must-have інгредієнти для зими' },
      { type: 'grid', columns: 2, items: [
        { title: 'Кераміди', icon: '🛡️', items: ['Відновлюють бар\'єр', 'Утримують вологу'], recommendation: 'Illiyoon Ceramide Ato Cream' },
        { title: 'Гіалуронова кислота', icon: '💧', items: ['Притягує вологу', 'Наносьте на вологу шкіру!'], recommendation: 'Torriden Dive-In Serum' },
        { title: 'Центела азіатська', icon: '🌿', items: ['Заспокоює подразнення', 'Допомагає при почервоніннях'], recommendation: 'Anua Heartleaf Toner' },
        { title: 'Сквалан', icon: '✨', items: ['Імітує ліпіди шкіри', 'Не забиває пори'] },
      ]},
      { type: 'heading', level: 2, text: 'Додаткові поради' },
      { type: 'callout', variant: 'tip', title: 'Лайфхаки для зими', text: '• Зволожувач повітря — врятує від сухості в приміщенні\n• Тепла, а не гаряча вода — гаряча сушить шкіру\n• Бальзам для губ — делікатна шкіра губ потребує захисту\n• Руки та тіло — їм теж потрібне додаткове зволоження' },
      { type: 'heading', level: 2, text: 'Приклад зимової рутини' },
      { type: 'twoColumn', left: { title: '☀️ Ранок', items: ['М\'яке очищення (або вода)', 'Зволожуючий тонер', 'Сироватка з ГК', 'Живильний крем', 'SPF'] }, right: { title: '🌙 Вечір', items: ['Подвійне очищення', 'Тонер', 'Сироватка (ретинол 1-2р/тижд)', 'Крем з керамідами', 'Олія (за потреби)'] }},
      { type: 'heading', level: 2, text: 'Висновок' },
      { type: 'paragraph', text: 'Зима — це не привід миритися з сухістю та дискомфортом. Правильно підібрана рутина допоможе шкірі залишатися здоровою та сяючою навіть у найхолодніші дні.' },
    ],
    relatedProducts: [
      { name: 'Illiyoon Ceramide Cream', link: '/catalog?search=illiyoon' },
      { name: 'Torriden Dive-In Serum', link: '/catalog?search=torriden' },
      { name: 'Anua Heartleaf Toner', link: '/catalog?search=anua+toner' },
    ],
  },
  'acne-prone-skin-routine': {
    title: 'Догляд за проблемною шкірою: корейський підхід',
    description: 'Як побудувати рутину для шкіри, схильної до висипань, без агресивних засобів.',
    category: 'Догляд',
    readTime: '7 хв',
    date: '10 грудня 2024',
    author: 'Катерина',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1200&q=80',
    content: [
      { type: 'heading', level: 2, text: 'Корейський підхід до проблемної шкіри' },
      { type: 'paragraph', text: 'На відміну від західного підходу "висушити все", корейська філософія базується на балансі: контролювати висипання, але не пересушувати шкіру. Бо зневоднена шкіра виробляє ще більше себуму!' },
      { type: 'heading', level: 2, text: 'Основні принципи' },
      { type: 'featureList', items: [
        { icon: '🫧', title: 'Делікатне очищення', text: 'Забудьте про агресивні засоби з SLS. Вони порушують бар\'єр і провокують висипання.' },
        { icon: '💧', title: 'Зволоження — обов\'язково', text: 'Навіть жирній шкірі потрібне зволоження! Обирайте легкі гелеві текстури.' },
        { icon: '🎯', title: 'Точковий вплив', text: 'Наносьте активи точково на проблемні зони, а не на все обличчя.' },
      ]},
      { type: 'image', src: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80', alt: 'Догляд за проблемною шкірою', caption: 'Баланс — ключ до здорової шкіри' },
      { type: 'heading', level: 2, text: 'Ключові інгредієнти' },
      { type: 'ingredientCard', number: 1, name: 'BHA (саліцилова кислота)', description: 'Проникає в пори та очищує їх зсередини. Ідеальна для чорних крапок та запалень.', products: ['COSRX BHA Blackhead Power Liquid'] },
      { type: 'ingredientCard', number: 2, name: 'Ніацинамід', description: 'Регулює виробництво себуму, звужує пори, вирівнює тон.', products: ['Beauty of Joseon Glow Serum'] },
      { type: 'ingredientCard', number: 3, name: 'Центела азіатська', description: 'Заспокоює запалення та прискорює загоєння постакне.', products: ['COSRX Centella Blemish Cream'] },
      { type: 'heading', level: 2, text: 'Приклад рутини' },
      { type: 'twoColumn', left: { title: '☀️ Ранок', items: ['Гель для вмивання з низьким pH', 'Заспокійливий тонер', 'Легка сироватка з ніацинамідом', 'Гелевий зволожувач', 'Некомедогенний SPF'] }, right: { title: '🌙 Вечір', items: ['Гідрофільна олія', 'Гель для вмивання', 'BHA-тонер (через день)', 'Сироватка', 'Легкий крем', 'Точково — засіб від прищів'] }},
      { type: 'heading', level: 2, text: 'Чого уникати' },
      { type: 'callout', variant: 'warning', title: 'Заборонений список', text: '• Спирт — сушить і подразнює\n• Комедогенні олії — кокосова, зародків пшениці\n• Занадто часта ексфоліація — максимум 2-3 рази/тиждень\n• Вичавлювання — залишає шрами та розносить бактерії' },
      { type: 'heading', level: 2, text: 'Важливі поради' },
      { type: 'grid', columns: 2, items: [
        { title: 'Гігієна', icon: '🛏️', items: ['Змінюйте наволочку раз/тиждень', 'Не торкайтесь обличчя', 'Очищуйте телефон'] },
        { title: 'Харчування', icon: '🥗', items: ['Менше молочних продуктів', 'Менше цукру', 'Більше води'] },
      ]},
      { type: 'callout', variant: 'info', title: 'Коли до лікаря?', text: '• Домашній догляд не допомагає 2-3 місяці\n• Глибокі кістозні висипання\n• Акне залишає шрами' },
      { type: 'heading', level: 2, text: 'Висновок' },
      { type: 'paragraph', text: 'Проблемна шкіра — це не вирок. З правильним підходом та терпінням можна досягти чистої, здорової шкіри. Головне — не перестаратися з активами та не забувати про зволоження!' },
    ],
    relatedProducts: [
      { name: 'COSRX BHA Power Liquid', link: '/catalog?search=cosrx+bha' },
      { name: 'Beauty of Joseon Glow Serum', link: '/catalog?search=beauty+joseon+serum' },
      { name: 'COSRX Centella Blemish Cream', link: '/catalog?search=cosrx+centella' },
    ],
  },
}

// Content block types
type ContentBlock = 
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'callout'; variant: 'info' | 'tip' | 'warning'; title: string; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'step'; number: number; title: string; text: string }
  | { type: 'recommendation'; text: string }
  | { type: 'grid'; columns: 2 | 3; items: { title: string; icon: string; items: string[]; recommendation?: string }[] }
  | { type: 'twoColumn'; left: { title: string; description?: string; items: string[] }; right: { title: string; description?: string; items: string[] } }
  | { type: 'ingredientCard'; number: number; name: string; subtitle?: string; description: string; benefits?: string[]; warning?: string; idealFor?: string[]; products?: string[] }
  | { type: 'statGrid'; stats: { value: string; label: string }[] }
  | { type: 'comparison'; items: { title: string; subtitle: string; pros: string[]; cons: string[]; examples: string }[] }
  | { type: 'featureList'; items: { icon: string; title: string; text: string }[] }
  | { type: 'stepList'; items: { title: string; text: string }[] }
  | { type: 'productHighlight'; products: { name: string; description: string }[] }

// Generate static params for all blog posts
export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({
    slug,
  }))
}

// Generate metadata for each post
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = blogPosts[params.slug]
  
  if (!post) {
    return {
      title: 'Стаття не знайдена | Eonni',
    }
  }

  return {
    title: `${post.title} | Блог Eonni`,
    description: post.description,
    keywords: `K-beauty, корейська косметика, ${post.category.toLowerCase()}, догляд за шкірою`,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      locale: 'uk_UA',
      publishedTime: post.date,
      authors: [post.author],
    },
  }
}

// Content renderer component
function ContentRenderer({ block, index }: { block: ContentBlock; index: number }) {
  switch (block.type) {
    case 'heading':
      if (block.level === 2) {
        return (
          <h2 key={index} className="font-bebas uppercase text-[28px] sm:text-[36px] lg:text-[42px] text-black mt-12 sm:mt-16 mb-6 first:mt-0">
            {block.text}
          </h2>
        )
      }
      return (
        <h3 key={index} className="font-bebas uppercase text-[22px] sm:text-[26px] lg:text-[30px] text-black mt-8 mb-4">
          {block.text}
        </h3>
      )

    case 'paragraph':
      return (
        <p key={index} className="font-gilroy text-[16px] sm:text-[17px] lg:text-[18px] leading-[28px] sm:leading-[30px] lg:leading-[32px] text-[#444444] mb-6">
          {block.text}
        </p>
      )

    case 'callout':
      const variants = {
        info: { bg: 'bg-[#E8F4FD]', border: 'border-[#2196F3]', icon: 'ℹ️' },
        tip: { bg: 'bg-[#E8F5E9]', border: 'border-[#4CAF50]', icon: '💡' },
        warning: { bg: 'bg-[#FFF3E0]', border: 'border-[#FF9800]', icon: '⚠️' },
      }
      const v = variants[block.variant]
      return (
        <div key={index} className={`${v.bg} ${v.border} border-l-4 rounded-r-[16px] p-6 my-8`}>
          <div className="flex items-start gap-3">
            <span className="text-[24px]">{v.icon}</span>
            <div>
              <p className="font-gilroy font-semibold text-[16px] sm:text-[17px] text-black mb-2">{block.title}</p>
              <p className="font-gilroy text-[15px] sm:text-[16px] leading-[24px] text-[#444444] whitespace-pre-line">{block.text}</p>
            </div>
          </div>
        </div>
      )

    case 'image':
      return (
        <figure key={index} className="my-10 sm:my-12">
          <div className="relative aspect-[16/9] rounded-[20px] overflow-hidden bg-[#F8F7FB]">
            <Image
              src={block.src}
              alt={block.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-4 text-center text-[14px] text-[#666666] italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )

    case 'step':
      return (
        <div key={index} className="flex gap-4 sm:gap-6 my-6 sm:my-8">
          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#BCC2F4] to-[#6046A3] flex items-center justify-center text-white font-bebas text-[20px] sm:text-[24px]">
            {block.number}
          </div>
          <div className="flex-1 pt-1">
            <h4 className="font-bebas uppercase text-[20px] sm:text-[24px] text-black mb-2">{block.title}</h4>
            <p className="font-gilroy text-[15px] sm:text-[16px] leading-[26px] text-[#444444]">{block.text}</p>
          </div>
        </div>
      )

    case 'recommendation':
      return (
        <div key={index} className="bg-[#F8F7FB] rounded-[12px] px-5 py-4 my-4 ml-0 sm:ml-[72px]">
          <p className="font-gilroy text-[14px] sm:text-[15px] text-[#6046A3] font-medium">
            {block.text}
          </p>
        </div>
      )

    case 'grid':
      return (
        <div key={index} className={`grid gap-4 sm:gap-6 my-8 sm:my-10 ${block.columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {block.items.map((item, i) => (
            <div key={i} className="bg-[#F8F7FB] rounded-[20px] p-6">
              <div className="text-[32px] mb-3">{item.icon}</div>
              <h4 className="font-bebas uppercase text-[20px] text-black mb-3">{item.title}</h4>
              <ul className="space-y-2">
                {item.items.map((li, j) => (
                  <li key={j} className="font-gilroy text-[14px] sm:text-[15px] text-[#444444] flex items-start gap-2">
                    <span className="text-[#6046A3] mt-1">•</span>
                    {li}
                  </li>
                ))}
              </ul>
              {item.recommendation && (
                <p className="mt-4 pt-4 border-t border-[#E5E5E5] font-gilroy text-[13px] text-[#6046A3] font-medium">
                  👉 {item.recommendation}
                </p>
              )}
            </div>
          ))}
        </div>
      )

    case 'twoColumn':
      return (
        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 my-8 sm:my-10">
          {[block.left, block.right].map((col, i) => (
            <div key={i} className="bg-[#F8F7FB] rounded-[20px] p-6">
              <h4 className="font-bebas uppercase text-[22px] text-black mb-2">{col.title}</h4>
              {col.description && (
                <p className="font-gilroy text-[14px] text-[#666] mb-4">{col.description}</p>
              )}
              <ul className="space-y-2">
                {col.items.map((item, j) => (
                  <li key={j} className="font-gilroy text-[15px] text-[#444444] flex items-start gap-2">
                    <span className="text-[#6046A3]">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )

    case 'ingredientCard':
      return (
        <div key={index} className="bg-white border border-[#E5E5E5] rounded-[24px] p-6 sm:p-8 my-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6046A3] flex items-center justify-center text-white font-bebas text-[18px]">
              {block.number}
            </div>
            <div>
              <h4 className="font-bebas uppercase text-[24px] sm:text-[28px] text-black">{block.name}</h4>
              {block.subtitle && (
                <p className="font-gilroy text-[14px] text-[#999] italic">{block.subtitle}</p>
              )}
            </div>
          </div>
          <p className="font-gilroy text-[15px] sm:text-[16px] leading-[26px] text-[#444444] mb-4">{block.description}</p>
          {block.benefits && (
            <div className="mb-4">
              <p className="font-gilroy font-semibold text-[14px] text-black mb-2">Переваги:</p>
              <ul className="space-y-1">
                {block.benefits.map((b, i) => (
                  <li key={i} className="font-gilroy text-[14px] text-[#444444] flex items-start gap-2">
                    <span className="text-[#4CAF50]">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {block.idealFor && (
            <div className="mb-4">
              <p className="font-gilroy font-semibold text-[14px] text-black mb-2">Ідеально для:</p>
              <div className="flex flex-wrap gap-2">
                {block.idealFor.map((item, i) => (
                  <span key={i} className="px-3 py-1 bg-[#F8F7FB] rounded-full text-[13px] text-[#666]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          {block.warning && (
            <div className="bg-[#FFF3E0] rounded-[12px] p-4 mb-4">
              <p className="font-gilroy text-[14px] text-[#E65100]">⚠️ {block.warning}</p>
            </div>
          )}
          {block.products && block.products.length > 0 && (
            <div className="pt-4 border-t border-[#E5E5E5]">
              <p className="font-gilroy font-semibold text-[14px] text-[#6046A3] mb-2">Рекомендуємо:</p>
              <div className="flex flex-wrap gap-2">
                {block.products.map((p, i) => (
                  <span key={i} className="px-3 py-1 bg-[#F8F7FB] rounded-full text-[13px] text-black">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )

    case 'statGrid':
      return (
        <div key={index} className="grid grid-cols-3 gap-4 my-8 sm:my-10">
          {block.stats.map((stat, i) => (
            <div key={i} className="text-center p-4 sm:p-6 bg-gradient-to-br from-[#F8F7FB] to-[#E8E6F0] rounded-[16px]">
              <p className="font-bebas text-[32px] sm:text-[40px] lg:text-[48px] text-[#6046A3]">{stat.value}</p>
              <p className="font-gilroy text-[12px] sm:text-[14px] text-[#666] leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      )

    case 'comparison':
      return (
        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-8 sm:my-10">
          {block.items.map((item, i) => (
            <div key={i} className="bg-white border border-[#E5E5E5] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <h4 className="font-bebas uppercase text-[22px] text-black">{item.title}</h4>
              <p className="font-gilroy text-[14px] text-[#666] mb-4">{item.subtitle}</p>
              <div className="space-y-3">
                <div>
                  <p className="font-gilroy font-semibold text-[13px] text-[#4CAF50] mb-1">Плюси:</p>
                  <ul className="space-y-1">
                    {item.pros.map((p, j) => (
                      <li key={j} className="font-gilroy text-[14px] text-[#444] flex items-start gap-2">
                        <span className="text-[#4CAF50]">+</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-gilroy font-semibold text-[13px] text-[#F44336] mb-1">Мінуси:</p>
                  <ul className="space-y-1">
                    {item.cons.map((c, j) => (
                      <li key={j} className="font-gilroy text-[14px] text-[#444] flex items-start gap-2">
                        <span className="text-[#F44336]">−</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="pt-3 border-t border-[#E5E5E5] font-gilroy text-[13px] text-[#999]">
                  Приклади: {item.examples}
                </p>
              </div>
            </div>
          ))}
        </div>
      )

    case 'featureList':
      return (
        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 sm:my-10">
          {block.items.map((item, i) => (
            <div key={i} className="flex gap-4 p-5 bg-[#F8F7FB] rounded-[16px]">
              <div className="flex-shrink-0 text-[28px]">{item.icon}</div>
              <div>
                <h4 className="font-gilroy font-semibold text-[16px] text-black mb-1">{item.title}</h4>
                <p className="font-gilroy text-[14px] text-[#666] leading-[22px]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      )

    case 'stepList':
      return (
        <div key={index} className="my-8 sm:my-10 space-y-4">
          {block.items.map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#6046A3] flex items-center justify-center text-white font-bebas text-[14px]">
                {i + 1}
              </div>
              <div className="flex-1 pt-1">
                <h4 className="font-gilroy font-semibold text-[16px] text-black">{item.title}</h4>
                <p className="font-gilroy text-[14px] text-[#666] mt-1">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      )

    case 'productHighlight':
      return (
        <div key={index} className="my-8 sm:my-10 space-y-4">
          {block.products.map((product, i) => (
            <div key={i} className="flex gap-4 p-5 bg-gradient-to-r from-[#F8F7FB] to-white border border-[#E5E5E5] rounded-[16px]">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#BCC2F4] flex items-center justify-center text-[24px]">
                ✨
              </div>
              <div>
                <h4 className="font-gilroy font-semibold text-[16px] text-black">{product.name}</h4>
                <p className="font-gilroy text-[14px] text-[#666] mt-1">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
      )

    default:
      return null
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts[params.slug]

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-10 sm:py-14 lg:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,_rgba(188,194,244,0.5),_rgba(255,255,255,0)_60%),radial-gradient(circle_at_85%_18%,_rgba(255,228,237,0.45),_rgba(255,255,255,0)_60%)]" />
        <div className="relative max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[14px] text-[#666666] hover:text-black transition-colors mb-6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Назад до блогу
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#6046A3] text-[12px] text-white font-medium">
              {post.category}
            </span>
            <span className="text-[14px] text-[#999999]">{post.readTime} читання</span>
          </div>
          <h1 className="font-bebas uppercase text-black text-[32px] leading-[36px] sm:text-[44px] sm:leading-[48px] lg:text-[56px] lg:leading-[60px] max-w-[900px]">
            {post.title}
          </h1>
          <p className="mt-4 font-gilroy text-[16px] sm:text-[18px] text-[#666] max-w-[700px] leading-[28px]">
            {post.description}
          </p>
          <div className="mt-6 flex items-center gap-4 text-[14px] text-[#666666]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#BCC2F4] flex items-center justify-center text-white font-semibold text-[14px]">
                {post.author[0]}
              </div>
              <span>{post.author}</span>
            </div>
            <span>•</span>
            <span>{post.date}</span>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="pb-8 sm:pb-12">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="relative aspect-[21/9] rounded-[24px] overflow-hidden bg-[#F8F7FB]">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="py-8 sm:py-12">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-[800px] mx-auto lg:max-w-none lg:mx-0">
            {post.content.map((block, index) => (
              <ContentRenderer key={index} block={block} index={index} />
            ))}
          </div>

          {/* Related Products */}
          {post.relatedProducts && post.relatedProducts.length > 0 && (
            <div className="mt-16 rounded-[24px] bg-gradient-to-br from-[#F8F7FB] to-[#E8E6F0] p-8 sm:p-10">
              <h3 className="font-bebas uppercase text-[28px] sm:text-[32px] text-black mb-6">🛍️ Рекомендовані продукти</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {post.relatedProducts.map((product) => (
                  <Link
                    key={product.name}
                    href={product.link}
                    className="flex items-center justify-between p-5 rounded-[16px] bg-white hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1"
                  >
                    <span className="font-gilroy text-[15px] text-black font-medium">{product.name}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6046A3" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-[14px] text-[#666666]">Поділитись статтею:</p>
            <div className="flex gap-3">
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(`https://eonni.com.ua/blog/${params.slug}`)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-[#F8F7FB] flex items-center justify-center hover:bg-[#BCC2F4] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.07-.78 4.19-1.82 6.99-3.02 8.38-3.61 3.99-1.66 4.82-1.95 5.36-1.96.12 0 .38.03.55.17.14.12.18.28.2.45-.02.07-.02.14-.03.27z"/>
                </svg>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://eonni.com.ua/blog/${params.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-[#F8F7FB] flex items-center justify-center hover:bg-[#BCC2F4] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://eonni.com.ua/blog/${params.slug}`)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-[#F8F7FB] flex items-center justify-center hover:bg-[#BCC2F4] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* More Articles */}
      <section className="py-16 sm:py-20 bg-[#F8F7FB]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <h2 className="font-bebas uppercase text-[32px] sm:text-[40px] text-black mb-8 text-center">Читайте також</h2>
          <div className="flex justify-center">
            <Link
              href="/blog"
              className="inline-flex h-[54px] px-10 items-center justify-center rounded-[14px] bg-black text-white uppercase font-gilroy text-[16px] font-semibold hover:bg-[#333] transition-colors"
            >
              Всі статті
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
