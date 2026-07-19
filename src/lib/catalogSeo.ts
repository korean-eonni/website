export type SeoCategory = {
  slug: string
  name: string
  title: string
  description: string
  patterns: string[]
}

export const SEO_CATEGORIES: SeoCategory[] = [
  {
    slug: 'face',
    name: 'Обличчя',
    title: 'Корейська косметика для обличчя',
    description:
      'Сироватки, креми, тонери, маски, SPF та очищення з Кореї. Оригінальні засоби для догляду за обличчям з доставкою по Україні.',
    patterns: ['обличч', 'face'],
  },
  {
    slug: 'hair',
    name: 'Волосся',
    title: 'Корейська косметика для волосся',
    description:
      'Корейські шампуні, кондиціонери, есенції, олії та засоби для шкіри голови. Професійний догляд за волоссям з доставкою по Україні.',
    patterns: ['волосс', 'hair'],
  },
  {
    slug: 'body',
    name: 'Тіло',
    title: 'Корейська косметика для тіла',
    description:
      'Креми для рук і тіла, засоби для очищення, зволоження та відновлення шкіри. Оригінальна косметика з Кореї.',
    patterns: ['тіл', 'body', 'тел'],
  },
  {
    slug: 'health',
    name: 'Health & Care',
    title: 'Корейські вітаміни та Health & Care',
    description:
      'Корейські вітаміни, пробіотики, колаген та функціональні добавки для щоденного догляду за собою.',
    patterns: ['health', 'кейр', 'care', 'хелс', 'хелз'],
  },
  {
    slug: 'devices',
    name: 'Косметичні девайси',
    title: 'Корейські косметичні девайси',
    description:
      'Девайси та аксесуари для домашнього догляду за шкірою: очищення, ліфтинг і покращення проникнення косметики.',
    patterns: ['девайс', 'девай', 'devic', 'прилад', 'пристр', 'прибор'],
  },
  {
    slug: 'testers',
    name: 'Тестери та аксесуари',
    title: 'Тестери й аксесуари для догляду',
    description:
      'Тестери корейської косметики, спонжі, аплікатори та корисні аксесуари для щоденного догляду.',
    patterns: ['тестер', 'аксесуар', 'tester', 'accessor'],
  },
]

export function getSeoCategory(slug: string): SeoCategory | null {
  return SEO_CATEGORIES.find((category) => category.slug === slug) || null
}

export function getSeoCategoryForRaw(
  rawCategory: string | null | undefined
): SeoCategory | null {
  if (!rawCategory) return null
  const normalized = rawCategory.toLowerCase()
  return (
    SEO_CATEGORIES.find((category) =>
      category.patterns.some((pattern) => normalized.includes(pattern))
    ) || null
  )
}

export function productMatchesCategory(
  rawCategory: string | null | undefined,
  category: SeoCategory
): boolean {
  return getSeoCategoryForRaw(rawCategory)?.slug === category.slug
}
