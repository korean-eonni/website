import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { listProducts, type ProductRecord } from '@/lib/productStore'

export const revalidate = 300

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eonni.com.ua')
  .trim()
  .replace(/\/$/, '')

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function feedId(product: ProductRecord): string {
  const source = (product.sku || product.id).trim()
  if (Buffer.byteLength(source, 'utf8') <= 50) return source

  const digest = createHash('sha256').update(source).digest('hex').slice(0, 10)
  const asciiPrefix =
    source
      .normalize('NFKD')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/[-_.]{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 39) || 'eonni-product'

  return `${asciiPrefix}-${digest}`
}

function availability(product: ProductRecord): 'in_stock' | 'out_of_stock' {
  if ((product.stock_quantity ?? 0) > 0) return 'in_stock'
  // "Coming soon" is not a Merchant preorder unless checkout can actually
  // accept and fulfil an order before the item reaches stock.
  return 'out_of_stock'
}

function googleProductCategory(product: ProductRecord): string {
  const haystack = [
    product.category,
    product.subcategory,
    product.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (/health\s*&\s*care|бад|добавк|пробіот|probiotic|vitamin|collagen jelly stick/.test(haystack)) {
    return '525'
  }
  if (/шампун|shampoo/.test(haystack)) return '543615'
  if (/кондиціон|conditioner/.test(haystack)) return '543616'
  if (/волосс|hair|scalp/.test(haystack)) return '486'
  if (/spf|sun cream|sunscreen|сонцезах/.test(haystack)) return '2844'
  if (/cleanser|cleansing|пінка|очищ|гель для вмивання/.test(haystack)) return '2526'
  if (/тонер|toner|astringent/.test(haystack)) return '543658'
  if (/mask|маск|patch|патч/.test(haystack)) return '6262'
  if (/cream|крем|lotion|лосьйон|moistur/.test(haystack)) return '2592'
  if (/макіяж|makeup|tint|lipstick|тінт|помад/.test(haystack)) return '477'
  if (/девайс|device|ролер|roller|щітк|brush/.test(haystack)) return '2958'
  if (/аксесуар|спонж|sponge|tool|аплікатор/.test(haystack)) return '2619'
  if (/тіло|body|hand|рук/.test(haystack)) return '474'
  return '567'
}

function validGtin(barcode: string | null): string | null {
  const normalized = barcode?.replace(/\D/g, '') || ''
  return [8, 12, 13, 14].includes(normalized.length) ? normalized : null
}

function additionalImages(product: ProductRecord, primaryImage: string): string[] {
  return [
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
    .filter((image): image is string => Boolean(image) && image !== primaryImage)
    .filter((image, index, images) => images.indexOf(image) === index)
    .slice(0, 10)
}

function productXml(product: ProductRecord): string {
  const description =
    stripHtml(product.long_description) ||
    stripHtml(product.short_description) ||
    product.name
  const primaryImage = product.image_url || product.image_path || `${SITE_URL}/icon-192.png`
  const images = additionalImages(product, primaryImage)
  const canonical = `${SITE_URL}/product/${encodeURIComponent(product.id)}`
  const gtin = validGtin(product.barcode)
  const salePrice = `${Number(product.sale_price).toFixed(2)} UAH`
  const hasDiscount =
    Boolean(product.original_price) &&
    Number(product.original_price) > Number(product.sale_price)
  const regularPrice = hasDiscount
    ? `${Number(product.original_price).toFixed(2)} UAH`
    : salePrice
  const title = product.name.trim().slice(0, 150)
  const productType = [product.category, product.subcategory]
    .filter(Boolean)
    .join(' > ') || 'Корейська косметика'

  const optionalBrand = product.brand
    ? `\n      <g:brand>${escapeXml(product.brand)}</g:brand>`
    : ''
  const optionalGtin = gtin
    ? `\n      <g:gtin>${gtin}</g:gtin>\n      <g:identifier_exists>yes</g:identifier_exists>`
    : ''
  const optionalIdentifierExists =
    !gtin && !product.brand
      ? '\n      <g:identifier_exists>no</g:identifier_exists>'
      : ''
  const optionalSalePrice = hasDiscount
    ? `\n      <g:sale_price>${salePrice}</g:sale_price>`
    : ''
  const optionalImages = images
    .map((image) => `\n      <g:additional_image_link>${escapeXml(image)}</g:additional_image_link>`)
    .join('')

  return `
    <item>
      <g:id>${escapeXml(feedId(product))}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(description.slice(0, 5000))}</g:description>
      <g:link>${escapeXml(canonical)}</g:link>
      <g:canonical_link>${escapeXml(canonical)}</g:canonical_link>
      <g:image_link>${escapeXml(primaryImage)}</g:image_link>${optionalImages}
      <g:availability>${availability(product)}</g:availability>
      <g:condition>new</g:condition>
      <g:price>${regularPrice}</g:price>${optionalSalePrice}${optionalBrand}${optionalGtin}${optionalIdentifierExists}
      <g:google_product_category>${googleProductCategory(product)}</g:google_product_category>
      <g:product_type>${escapeXml(productType)}</g:product_type>
      <g:custom_label_0>${escapeXml(product.category || 'Каталог')}</g:custom_label_0>
    </item>`
}

/**
 * Google Merchant Center RSS 2.0 product data source.
 *
 * Public URL:
 *   https://eonni.com.ua/google-merchant-feed.xml
 */
export async function GET() {
  try {
    const products = await listProducts('is_active = 1')
    const items = products
      .filter(
        (product) =>
          Number(product.sale_price) > 0 &&
          Boolean(product.image_url || product.image_path)
      )
      .map(productXml)
      .join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>eonni — корейська косметика</title>
    <link>${SITE_URL}</link>
    <description>Оригінальна корейська косметика з доставкою по Україні</description>${items}
  </channel>
</rss>`

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('[merchant-feed] failed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
