import Image from 'next/image'
import Link from 'next/link'
import type { PublicProductRecord } from '@/lib/productStore'

export default function ProductListingGrid({
  products,
}: {
  products: PublicProductRecord[]
}) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const image = product.image_url || product.image_path
        const href = `/product/${encodeURIComponent(product.id)}`

        return (
          <article key={product.id} className="min-w-0">
            <Link href={href} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-[18px] bg-white">
                {image ? (
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm text-gray-500">
                    Фото готується
                  </div>
                )}
              </div>
              {product.brand && (
                <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6046A3]">
                  {product.brand}
                </p>
              )}
              <h2 className="mt-1 line-clamp-3 text-[15px] font-semibold leading-[1.35] text-black sm:text-[17px]">
                {product.name}
              </h2>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-[18px] font-semibold text-black">
                  {product.sale_price ? `${product.sale_price} ₴` : 'Ціна уточнюється'}
                </span>
                {product.original_price &&
                  product.sale_price &&
                  product.original_price > product.sale_price && (
                    <span className="text-sm text-gray-500 line-through">
                      {product.original_price} ₴
                    </span>
                  )}
              </div>
              <p className="mt-1 text-[13px] text-[#4D6B57]">
                {(product.stock_quantity ?? 0) > 0
                  ? 'В наявності'
                  : product.coming_soon
                    ? 'Скоро в наявності'
                    : 'Немає в наявності'}
              </p>
            </Link>
          </article>
        )
      })}
    </div>
  )
}
