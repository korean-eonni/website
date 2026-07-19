import type { Metadata } from 'next'
import {
  getProductCanonicalUrl,
  getProductGtin,
  getProductMetaDescription,
  getProductPrimaryName,
  getSeoProduct,
} from '@/lib/productSeo'
import { getProductRating } from '@/lib/reviewStore'
import { getSeoCategoryForRaw } from '@/lib/catalogSeo'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eonni.com.ua').trim().replace(/\/$/, '')

type Props = {
  params: { id: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await getSeoProduct(params.id)
    if (!product || product.is_active !== 1) {
      return {
        title: 'Товар не знайдено',
        robots: { index: false, follow: false },
      }
    }

    const primaryName = getProductPrimaryName(product)
    const title = `${primaryName} — купити`
    const description = getProductMetaDescription(product)
    const canonical = getProductCanonicalUrl(product)
    const image = product.image_url || product.image_path

    return {
      title,
      description,
      alternates: { canonical },
      keywords: [
        primaryName,
        `${primaryName} купити`,
        `${primaryName} Україна`,
        product.brand || '',
        product.category || '',
        'корейська косметика',
      ].filter(Boolean),
      openGraph: {
        type: 'website',
        url: canonical,
        title,
        description,
        locale: 'uk_UA',
        siteName: 'eonni',
        images: image ? [{ url: image, alt: product.name }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [image] : undefined,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      },
    }
  } catch (err) {
    console.error('[product/generateMetadata] error:', err)
    return {
      title: 'Товар',
      robots: { index: false, follow: false },
    }
  }
}

export default async function ProductLayout({ params, children }: Props) {
  let productJsonLd: Record<string, unknown> | null = null
  let breadcrumbJsonLd: Record<string, unknown> | null = null

  try {
    const product = await getSeoProduct(params.id)
    if (product && product.is_active === 1) {
      const reviewRating = await getProductRating(product.id)
      const images = [
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
      ].filter((image): image is string => Boolean(image))
      const productUrl = getProductCanonicalUrl(product)
      const availability =
        (product.stock_quantity ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock'

      productJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        name: product.name,
        description: product.short_description || product.long_description || product.name,
        image: images.length > 0 ? images : [`${SITE_URL}/logo.svg`],
        url: productUrl,
        mainEntityOfPage: productUrl,
        brand: product.brand
          ? { '@type': 'Brand', name: product.brand }
          : undefined,
        sku: product.sku || product.id,
        ...getProductGtin(product),
        offers: product.sale_price
          ? {
              '@type': 'Offer',
              '@id': `${productUrl}#offer`,
              url: productUrl,
              priceCurrency: 'UAH',
              price: product.sale_price,
              availability,
              itemCondition: 'https://schema.org/NewCondition',
              seller: { '@id': `${SITE_URL}/#organization` },
              shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                  '@type': 'MonetaryAmount',
                  value: '70',
                  currency: 'UAH',
                },
                shippingDestination: {
                  '@type': 'DefinedRegion',
                  addressCountry: 'UA',
                },
                deliveryTime: {
                  '@type': 'ShippingDeliveryTime',
                  handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
                  transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
                },
              },
            }
          : undefined,
        aggregateRating:
          reviewRating.count > 0
            ? {
                '@type': 'AggregateRating',
                ratingValue: Number(reviewRating.average.toFixed(2)),
                reviewCount: reviewRating.count,
              }
            : undefined,
      }

      // Breadcrumbs: Home › Catalog › Category › Product
      const crumbs: Array<{ name: string; url: string }> = [
        { name: 'Головна', url: SITE_URL },
        { name: 'Каталог', url: `${SITE_URL}/catalog` },
      ]
      if (product.category) {
        const seoCategory = getSeoCategoryForRaw(product.category)
        crumbs.push({
          name: product.category,
          url: seoCategory
            ? `${SITE_URL}/category/${seoCategory.slug}`
            : `${SITE_URL}/catalog`,
        })
      }
      crumbs.push({ name: product.name, url: productUrl })

      breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${productUrl}#breadcrumb`,
        itemListElement: crumbs.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          item: c.url,
        })),
      }
    }
  } catch (err) {
    console.error('[product/jsonld] error:', err)
  }

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      {children}
    </>
  )
}
