import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Блог про корейську косметику',
  description:
    'Блог Eonni про корейську косметику: огляди засобів, поради з догляду, тренди K-beauty, ритуали для шкіри. Корисні матеріали від експертів.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Блог про корейську косметику | Eonni',
    description: 'Огляди, поради та тренди K-beauty від Eonni.',
    type: 'website',
    locale: 'uk_UA',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
