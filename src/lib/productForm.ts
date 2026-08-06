/**
 * One place that turns the admin product form into a ProductRecord.
 *
 * Both "add product" and "edit product" use this, so the two screens can never
 * drift apart — previously the edit screen silently dropped a dozen fields.
 */
import type { ProductRecord } from '@/lib/productStore'

export type ProductFormOptions = {
  /** Existing record when editing — used for id/created_at and as fallback. */
  existing?: ProductRecord | null
  /** Gallery URLs in slot order (1-12). */
  gallery: (string | null)[]
  /** Product id to write. */
  id: string
}

function textOf(formData: FormData, key: string, max?: number): string | null {
  const raw = String(formData.get(key) ?? '').trim()
  if (!raw) return null
  return max ? raw.slice(0, max) : raw
}

function numberOf(formData: FormData, key: string): number | null {
  const raw = formData.get(key)
  if (raw === null || String(raw).trim() === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function boolOf(formData: FormData, key: string): number {
  return formData.get(key) ? 1 : 0
}

/**
 * Build a complete product record from the form.
 *
 * Checkboxes only appear in the payload when ticked, so an unticked box means
 * 0 — that is intentional and matches how the form is rendered (every product
 * form always renders all three flags).
 */
export function productFromForm(
  formData: FormData,
  { existing, gallery, id }: ProductFormOptions
): ProductRecord {
  const now = new Date().toISOString()

  return {
    id,
    name: String(formData.get('name') ?? '').trim(),

    image_url: gallery[0] ?? null,
    image_path: null,
    image_url_2: gallery[1] ?? null,
    image_url_3: gallery[2] ?? null,
    image_url_4: gallery[3] ?? null,
    image_url_5: gallery[4] ?? null,
    image_url_6: gallery[5] ?? null,
    image_url_7: gallery[6] ?? null,
    image_url_8: gallery[7] ?? null,
    image_url_9: gallery[8] ?? null,
    image_url_10: gallery[9] ?? null,
    image_url_11: gallery[10] ?? null,
    image_url_12: gallery[11] ?? null,

    short_description: textOf(formData, 'short_description', 300),
    long_description: textOf(formData, 'long_description', 8000),

    supplier: textOf(formData, 'supplier', 80),
    cost_price: numberOf(formData, 'cost_price'),
    sale_price: numberOf(formData, 'sale_price'),
    original_price: numberOf(formData, 'original_price'),
    discount_amount: numberOf(formData, 'discount_amount'),
    stock_quantity: numberOf(formData, 'stock_quantity'),

    category: textOf(formData, 'category', 80),
    subcategory: textOf(formData, 'subcategory', 80),
    subcategory_2: textOf(formData, 'subcategory_2', 80),
    weight_grams: numberOf(formData, 'weight_grams'),
    tags: textOf(formData, 'tags', 400),
    sku: textOf(formData, 'sku', 40),
    barcode: textOf(formData, 'barcode', 40),
    brand: textOf(formData, 'brand', 80),

    volume_options: textOf(formData, 'volume_options', 200),
    rating: numberOf(formData, 'rating'),
    review_count: numberOf(formData, 'review_count'),

    age_group: textOf(formData, 'age_group', 40),
    ingredients: textOf(formData, 'ingredients', 4000),
    skin_type: textOf(formData, 'skin_type', 100),
    series: textOf(formData, 'series', 100),
    classification: textOf(formData, 'classification', 100),

    usage_instructions: textOf(formData, 'usage_instructions', 4000),
    clinical_proof: textOf(formData, 'clinical_proof', 4000),
    solves_problems: textOf(formData, 'solves_problems', 4000),
    key_ingredients: textOf(formData, 'key_ingredients', 4000),
    fit_skin: textOf(formData, 'fit_skin', 2000),
    compatibility: textOf(formData, 'compatibility', 4000),

    is_active: boolOf(formData, 'is_active'),
    is_new: boolOf(formData, 'is_new'),
    is_exclusive: boolOf(formData, 'is_exclusive'),
    coming_soon: boolOf(formData, 'coming_soon'),

    created_at: existing?.created_at ?? now,
    updated_at: now,
  }
}
