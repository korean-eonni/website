import type { MetadataRoute } from 'next'
import { listProducts } from '@/lib/productStore'
import { SEO_CATEGORIES } from '@/lib/catalogSeo'
import { brands } from '@/data/brands'
import { BLOG_POSTS } from '@/lib/blogSeo'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eonni.com.ua').trim().replace(/\/$/, '')

export const revalidate = 3600 // refresh sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/catalog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/kyiv`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/brands`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/sales`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/skin-test`, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contacts`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/payment-delivery`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/returns-exchange`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/business-terms`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const collectionPages: MetadataRoute.Sitemap = [
    ...SEO_CATEGORIES.map((category) => ({
      url: `${SITE_URL}/category/${category.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...brands.map((brand) => ({
      url: `${SITE_URL}/brand/${brand.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.75,
    })),
    ...BLOG_POSTS.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    })),
  ]

  let productPages: MetadataRoute.Sitemap = []
  try {
    const products = await listProducts('is_active = 1')
    productPages = products.map((p) => ({
      url: `${SITE_URL}/product/${encodeURIComponent(p.id)}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'daily' as const,
      priority: 0.7,
      images: [
        p.image_url,
        p.image_path,
        p.image_url_2,
        p.image_url_3,
        p.image_url_4,
        p.image_url_5,
        p.image_url_6,
        p.image_url_7,
        p.image_url_8,
        p.image_url_9,
        p.image_url_10,
        p.image_url_11,
        p.image_url_12,
      ]
        .filter((image): image is string => Boolean(image))
        .filter((image, index, images) => images.indexOf(image) === index),
    }))
  } catch (err) {
    console.error('[sitemap] failed to load products:', err)
  }

  return [...staticPages, ...collectionPages, ...productPages]
}
