import { cache } from 'react'
import { getProduct, type ProductRecord } from '@/lib/productStore'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eonni.com.ua')
  .trim()
  .replace(/\/$/, '')

export function decodeProductId(id: string): string {
  try {
    return decodeURIComponent(id)
  } catch {
    return id
  }
}

export const getSeoProduct = cache(async (id: string): Promise<ProductRecord | null> => {
  return getProduct(decodeProductId(id))
})

export function getProductPrimaryName(product: ProductRecord): string {
  const parts = product.name
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  const brand = product.brand?.trim().toLocaleLowerCase('uk-UA')
  if (
    parts.length >= 2 &&
    (!brand || parts[0].toLocaleLowerCase('uk-UA') === brand)
  ) {
    return `${parts[0]} ${parts[1]}`
  }

  const leadingName = (parts[0] || product.name)
    .split(/[.!?]/, 1)[0]
    .trim()
  if (leadingName.length <= 70) return leadingName

  const shortened = leadingName.slice(0, 70)
  return shortened.slice(0, shortened.lastIndexOf(' ')).trim()
}

export function getProductCanonicalUrl(product: ProductRecord): string {
  return `${SITE_URL}/product/${encodeURIComponent(product.id)}`
}

export function getProductMetaDescription(product: ProductRecord): string {
  const primaryName = getProductPrimaryName(product)
  const price = product.sale_price ? ` Ціна ${product.sale_price} ₴.` : ''
  const stock =
    (product.stock_quantity ?? 0) > 0
      ? ' В наявності.'
      : product.coming_soon
        ? ' Доступне передзамовлення.'
        : ''

  return `${primaryName} — оригінальна корейська косметика.${price}${stock} Доставка по Києву та Україні. Замовляйте в eonni.`
}

export function getProductGtin(product: ProductRecord): Record<string, string> {
  const barcode = product.barcode?.replace(/\D/g, '') || ''
  if (barcode.length === 8) return { gtin8: barcode }
  if (barcode.length === 12) return { gtin12: barcode }
  if (barcode.length === 13) return { gtin13: barcode }
  if (barcode.length === 14) return { gtin14: barcode }
  return {}
}
