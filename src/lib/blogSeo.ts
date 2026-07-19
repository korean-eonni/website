export const BLOG_POSTS = [
  { slug: '10-step-korean-skincare-routine', publishedAt: '2025-01-15' },
  { slug: 'best-ingredients-for-hydration', publishedAt: '2025-01-10' },
  { slug: 'how-to-choose-sunscreen', publishedAt: '2025-01-05' },
  { slug: 'double-cleansing-guide', publishedAt: '2024-12-28' },
  { slug: 'snail-mucin-benefits', publishedAt: '2024-12-20' },
  { slug: 'winter-skincare-tips', publishedAt: '2024-12-15' },
  { slug: 'acne-prone-skin-routine', publishedAt: '2024-12-10' },
] as const

export function getBlogPublishedAt(slug: string): string | null {
  return BLOG_POSTS.find((post) => post.slug === slug)?.publishedAt || null
}
