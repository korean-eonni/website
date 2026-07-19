import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import ProductListingGrid from '@/components/seo/ProductListingGrid'
import {
  getSeoCategory,
  productMatchesCategory,
  SEO_CATEGORIES,
} from '@/lib/catalogSeo'
import { listPublicProducts } from '@/lib/productStore'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eonni.com.ua')
  .trim()
  .replace(/\/$/, '')

export const revalidate = 300

type Props = {
  params: { slug: string }
}

export function generateStaticParams() {
  return SEO_CATEGORIES.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getSeoCategory(params.slug)
  if (!category) return { title: 'Категорію не знайдено', robots: { index: false } }

  return {
    title: `${category.title} — купити в Україні`,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: {
      title: `${category.title} | eonni`,
      description: category.description,
      url: `/category/${category.slug}`,
      type: 'website',
      locale: 'uk_UA',
      siteName: 'eonni',
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const category = getSeoCategory(params.slug)
  if (!category) notFound()

  const allProducts = await listPublicProducts()
  const products = allProducts.filter((product) =>
    productMatchesCategory(product.category, category)
  )

  if (products.length === 0) notFound()

  const url = `${SITE_URL}/category/${category.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name: category.title,
    description: category.description,
    url,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Головна', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${SITE_URL}/catalog` },
        { '@type': 'ListItem', position: 3, name: category.name, item: url },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/product/${encodeURIComponent(product.id)}`,
        name: product.name,
      })),
    },
  }

  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto max-w-[1440px] px-6 py-12 sm:px-8 sm:py-16 lg:px-[72px] xl:px-[100px]">
        <nav aria-label="Навігація" className="mb-6 text-sm text-[#555]">
          <Link href="/" className="hover:underline">Головна</Link>
          {' / '}
          <Link href="/catalog" className="hover:underline">Каталог</Link>
          {' / '}
          <span>{category.name}</span>
        </nav>
        <h1 className="font-bebas text-[48px] uppercase leading-none text-black sm:text-[64px] lg:text-[80px]">
          {category.title}
        </h1>
        <p className="mt-5 max-w-[820px] text-[16px] leading-7 text-[#333] sm:text-[18px]">
          {category.description}
        </p>
        <p className="mb-10 mt-3 text-sm text-[#666]">{products.length} товарів</p>
        <ProductListingGrid products={products} />
      </section>
      <Footer />
    </main>
  )
}
