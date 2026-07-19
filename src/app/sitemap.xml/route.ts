import { NextResponse } from 'next/server'
import { SEO_CATEGORIES } from '@/lib/catalogSeo'
import { brands } from '@/data/brands'
import { BLOG_POSTS } from '@/lib/blogSeo'
import { listProducts } from '@/lib/productStore'

export const revalidate = 300

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eonni.com.ua')
  .trim()
  .replace(/\/$/, '')

type SitemapEntry = {
  url: string
  lastModified?: Date
  changeFrequency: 'daily' | 'weekly' | 'monthly'
  priority: number
  images?: string[]
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function validDate(value: string): Date | undefined {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function entryXml(entry: SitemapEntry): string {
  const lastModified = entry.lastModified
    ? `\n<lastmod>${entry.lastModified.toISOString()}</lastmod>`
    : ''
  const images = (entry.images ?? [])
    .map((image) => `\n<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`)
    .join('')

  return `<url>
<loc>${escapeXml(entry.url)}</loc>${lastModified}
<changefreq>${entry.changeFrequency}</changefreq>
<priority>${entry.priority}</priority>${images}
</url>`
}

export async function GET() {
  const staticPages: SitemapEntry[] = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
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

  const collectionPages: SitemapEntry[] = [
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

  let productPages: SitemapEntry[] = []
  try {
    const products = await listProducts('is_active = 1')
    productPages = products.map((product) => ({
      url: `${SITE_URL}/product/${encodeURIComponent(product.id)}`,
      lastModified: validDate(product.updated_at),
      changeFrequency: 'daily' as const,
      priority: 0.7,
      images: [
        product.image_url,
        product.image_path,
        product.image_url_2,
        product.image_url_3,
        product.image_url_4,
        product.image_url_5,
        product.image_url_6,
        product.image_url_7,
        product.image_url_8,
        product.image_url_9,
        product.image_url_10,
        product.image_url_11,
        product.image_url_12,
      ]
        .filter((image): image is string => Boolean(image))
        .filter((image, index, images) => images.indexOf(image) === index),
    }))
  } catch (error) {
    console.error('[sitemap] failed to load products:', error)
  }

  const entries = [...staticPages, ...collectionPages, ...productPages]
    .map(entryXml)
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
