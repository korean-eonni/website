import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Контакти магазину',
  description:
    "Зв'яжіться з Eonni: телефон +380732737330, email eonnisupport@gmail.com, Instagram @eonni.korean.cosmetics. Працюємо щодня з 10:00 до 20:00. Київ, вул. Левка Лук'яненка, 21.",
  keywords: 'контакти Eonni, корейська косметика Київ, телефон, email, Instagram',
  alternates: { canonical: '/contacts' },
  openGraph: {
    title: 'Контакти | eonni',
    description: 'Зв\'яжіться з нами: телефон, email, соціальні мережі. Працюємо щодня з 10:00 до 20:00.',
    type: 'website',
    locale: 'uk_UA',
    url: '/contacts',
    siteName: 'eonni',
  },
}

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return children
}
