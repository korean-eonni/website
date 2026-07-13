import { NextResponse } from 'next/server'
import { listProducts } from '@/lib/productStore'

export const revalidate = 3600 // refresh feed hourly

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eonni.com.ua').trim().replace(/\/$/, '')

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
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Google Merchant Center product feed (XML).
 *
 * Submit this URL in Google Merchant Center:
 *   https://eonni.com.ua/api/feed/google-merchant
 *
 * Feed spec: https://support.google.com/merchants/answer/7052112
 */
export async function GET() {
  let products
  try {
    products = await listProducts('is_active = 1')
  } catch (err) {
    console.error('[merchant-feed] listProducts failed:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }

  const items = products
    .filter((p) => p.sale_price && p.sale_price > 0)
    .map((p) => {
      const inStock = !!(p.stock_quantity && p.stock_quantity > 0)
      const availability = inStock ? 'in_stock' : 'preorder'
      const description =
        stripHtml(p.short_description) ||
        stripHtml(p.long_description) ||
        p.name
      const image = p.image_url || p.image_path || `${SITE_URL}/logo.svg`
      const id = escapeXml(p.sku || p.id)
      const title = escapeXml(p.name).slice(0, 150)
      const desc = escapeXml(description).slice(0, 5000)
      const brand = p.brand ? escapeXml(p.brand) : 'Eonni'
      const link = `${SITE_URL}/product/${p.id}`
      const salePrice = `${p.sale_price!.toFixed(2)} UAH`
      const regularPrice = p.original_price
        ? `${p.original_price.toFixed(2)} UAH`
        : null

      return `
    <item>
      <g:id>${id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:price>${regularPrice ?? salePrice}</g:price>${
        regularPrice ? `\n      <g:sale_price>${salePrice}</g:sale_price>` : ''
      }
      <g:brand>${brand}</g:brand>
      <g:identifier_exists>${p.brand ? 'yes' : 'no'}</g:identifier_exists>
      <g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics</g:google_product_category>
      <g:product_type>${escapeXml(p.category || 'Корейська косметика')}</g:product_type>
      <g:mpn>${id}</g:mpn>
      <g:shipping>
        <g:country>UA</g:country>
        <g:service>Standard</g:service>
        <g:price>70.00 UAH</g:price>
      </g:shipping>
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Eonni — Корейська косметика</title>
    <link>${SITE_URL}</link>
    <description>Оригінальна корейська косметика з доставкою по Україні</description>${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
