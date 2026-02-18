import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Контакти | Eonni — Корейська косметика',
  description:
    "Зв'яжіться з Eonni: телефон +380732737330, email support@eonni.com.ua, Instagram @eonni_korean_cosmetics. Працюємо щодня з 10:00 до 20:00. Київ, вул. Левка Лук'яненка, 21.",
  keywords: 'контакти Eonni, корейська косметика Київ, телефон, email, Instagram',
  openGraph: {
    title: 'Контакти | Eonni — Корейська косметика',
    description: 'Зв\'яжіться з нами: телефон, email, соціальні мережі. Працюємо щодня з 10:00 до 20:00.',
    type: 'website',
    locale: 'uk_UA',
  },
}

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return children
}
