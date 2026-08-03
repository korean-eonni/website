import type { MetadataRoute } from 'next'
import { listProducts } from '@/lib/productStore'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eonni.com.ua').trim().replace(/\/$/, '')

export const revalidate = 3600 // refresh sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/catalog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/kyiv`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/brands`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/sales`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contacts`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/payment-delivery`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/returns-exchange`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/business-terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  let productPages: MetadataRoute.Sitemap = []
  try {
    const products = await listProducts('is_active = 1')
    productPages = products.map((p) => ({
      url: `${SITE_URL}/product/${p.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (err) {
    console.error('[sitemap] failed to load products:', err)
  }

  return [...staticPages, ...productPages]
}
