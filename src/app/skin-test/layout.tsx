import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Тест на тип шкіри та персональний догляд',
  description:
    'Пройдіть безкоштовний тест на тип шкіри, визначте основні потреби та отримайте персональну K-beauty рутину з корейською косметикою.',
  alternates: { canonical: '/skin-test' },
  openGraph: {
    title: 'Тест на тип шкіри | eonni',
    description: 'Персональна K-beauty рутина за результатами безкоштовного тесту.',
    type: 'website',
    locale: 'uk_UA',
    url: '/skin-test',
    siteName: 'eonni',
  },
}

export default function SkinTestLayout({ children }: { children: React.ReactNode }) {
  return children
}
