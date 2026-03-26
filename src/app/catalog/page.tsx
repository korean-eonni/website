import { Suspense } from 'react'
import CatalogContent from './CatalogContent'
import { listProducts } from '@/lib/productStore'

export const dynamic = 'force-dynamic'

function CatalogSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="animate-pulse">
        <div className="h-[80px] bg-gray-100" />
        <div className="h-[40px] bg-gray-50" />
        <div className="h-[200px] bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100" />
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="flex gap-8">
            <div className="w-[260px] space-y-4 hidden lg:block">
              <div className="h-8 bg-gray-200 rounded w-32" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-square bg-gray-200 mb-4 rounded-lg" />
                  <div className="h-[72px] bg-gray-200 mb-2 rounded" />
                  <div className="h-[27px] w-[80px] bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type CatalogProduct = {
  id: string
  name: string
  short_description: string | null
  sale_price: number | null
  original_price: number | null
  discount_amount: number | null
  image_url: string | null
  image_path: string | null
  image_url_2: string | null
  image_url_3: string | null
  image_url_4: string | null
  image_url_5: string | null
  is_new: number
  is_exclusive: number
  category: string | null
  subcategory: string | null
  brand: string | null
  tags: string | null
  volume_options: string | null
  stock_quantity: number | null
  skin_type: string | null
  ingredients: string | null
  rating: number | null
}

export default async function CatalogPage() {
  let products: CatalogProduct[] = []
  try {
    const rawProducts = await listProducts('is_active = 1')
    products = rawProducts.map(p => ({
      id: p.id,
      name: p.name,
      short_description: p.short_description,
      sale_price: p.sale_price,
      original_price: p.original_price,
      discount_amount: p.discount_amount,
      image_url: p.image_url,
      image_path: p.image_path,
      image_url_2: p.image_url_2 ?? null,
      image_url_3: p.image_url_3 ?? null,
      image_url_4: p.image_url_4 ?? null,
      image_url_5: p.image_url_5 ?? null,
      is_new: p.is_new,
      is_exclusive: p.is_exclusive,
      category: p.category,
      subcategory: p.subcategory,
      brand: p.brand,
      tags: p.tags,
      volume_options: p.volume_options,
      stock_quantity: p.stock_quantity,
      skin_type: p.skin_type,
      ingredients: p.ingredients,
      rating: p.rating,
    }))
  } catch {
    // Fallback: CatalogContent will fetch client-side
  }

  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogContent initialProducts={products} />
    </Suspense>
  )
}
