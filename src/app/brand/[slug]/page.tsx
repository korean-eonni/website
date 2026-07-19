import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import ProductListingGrid from '@/components/seo/ProductListingGrid'
import { brands } from '@/data/brands'
import { listPublicProducts } from '@/lib/productStore'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eonni.com.ua')
  .trim()
  .replace(/\/$/, '')

export const revalidate = 300

type Props = {
  params: { slug: string }
}

export function generateStaticParams() {
  return brands.map((brand) => ({ slug: brand.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = brands.find((item) => item.slug === params.slug)
  if (!brand) return { title: 'Бренд не знайдено', robots: { index: false } }

  const description = `${brand.name}: оригінальна корейська косметика в Україні. Актуальні ціни, наявність і швидка доставка від eonni.`
  return {
    title: `${brand.name} — купити корейську косметику в Україні`,
    description,
    alternates: { canonical: `/brand/${brand.slug}` },
    openGraph: {
      title: `${brand.name} | eonni`,
      description,
      url: `/brand/${brand.slug}`,
      type: 'website',
      locale: 'uk_UA',
      siteName: 'eonni',
      images: [{ url: brand.logo, alt: brand.name }],
    },
  }
}

export default async function BrandPage({ params }: Props) {
  const brand = brands.find((item) => item.slug === params.slug)
  if (!brand) notFound()

  const allProducts = await listPublicProducts()
  const products = allProducts.filter(
    (product) => product.brand?.toLowerCase() === brand.name.toLowerCase()
  )
  if (products.length === 0) notFound()

  const url = `${SITE_URL}/brand/${brand.slug}`
  const description = `${brand.name}: оригінальна корейська косметика, актуальні ціни та наявність. Доставка по Києву й усій Україні.`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name: `${brand.name} в eonni`,
    description,
    url,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Головна', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Бренди', item: `${SITE_URL}/brands` },
        { '@type': 'ListItem', position: 3, name: brand.name, item: url },
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
          <Link href="/brands" className="hover:underline">Бренди</Link>
          {' / '}
          <span>{brand.name}</span>
        </nav>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6046A3]">
          Бренд
        </p>
        <h1 className="mt-3 font-bebas text-[48px] uppercase leading-none text-black sm:text-[64px] lg:text-[80px]">
          {brand.name}
        </h1>
        <p className="mt-5 max-w-[820px] text-[16px] leading-7 text-[#333] sm:text-[18px]">
          {description}
        </p>
        <p className="mb-10 mt-3 text-sm text-[#666]">{products.length} товарів</p>
        <ProductListingGrid products={products} />
      </section>
      <Footer />
    </main>
  )
}
