import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { listProducts } from '@/lib/productStore'

export const dynamic = 'force-dynamic'

type ProductCard = {
  id: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  isNew: boolean
}

export default async function CatalogPage() {
  const rows = (await listProducts('is_active = 1')) as Array<{
    id: string
    name: string
    sale_price: number | null
    original_price: number | null
    discount_amount: number | null
    image_path: string | null
    image_url: string | null
    is_new: number
  }>

  const products: ProductCard[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: row.sale_price ?? 0,
      originalPrice: row.original_price ?? undefined,
      discount: row.discount_amount ?? undefined,
      image: row.image_path || row.image_url || '/products/product-1.png',
      isNew: row.is_new === 1,
    }))

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PromoBanner />
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="flex items-end justify-between gap-6 mb-12">
            <h1 className="font-bebas uppercase text-black text-[48px] leading-[52px] sm:text-[64px] sm:leading-[68px] lg:text-[80px] lg:leading-[80px]">
              Каталог
            </h1>
            <span className="text-[16px] text-[#666666]">
              Усього товарів: {products.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="w-full group">
                <div className="relative w-full h-[340px] sm:h-[360px] lg:h-[380px] xl:h-[400px] rounded-[20px] overflow-hidden bg-[#F8F7FB] border border-[#E5E5E5] shadow-[0_4px_16px_rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 393px, (min-width: 1024px) 360px, (min-width: 640px) 320px, 100vw"
                  />

                  {product.isNew && (
                    <div
                      className="absolute top-3 right-3 h-[22px] px-2 rounded-[6px] bg-white text-black uppercase flex items-center"
                      style={{
                        fontFamily: 'Gilroy, sans-serif',
                        fontSize: '16px',
                        lineHeight: '22px',
                        fontWeight: 400,
                        letterSpacing: '0',
                      }}
                    >
                      NEW
                    </div>
                  )}

                  {product.discount && (
                    <div className="absolute top-3 left-3 h-[30px] px-3 rounded-[8px] bg-[#BCC2F4] text-black text-[16px] font-semibold tracking-[0.02em] flex items-center shadow-[0_6px_16px_rgba(188,194,244,0.45)]">
                      Знижка ₴{product.discount}
                    </div>
                  )}

                  <button
                    className="absolute bottom-3 right-3 bg-white rounded-lg p-2.5 hover:bg-[#F5F5F5] transition-colors shadow-md"
                    aria-label="Add to cart"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </button>
                </div>

                <div>
                  <h3
                    className="text-black text-[18px] leading-[24px] font-normal mb-2"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '48px',
                    }}
                  >
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2">
                    <span className="text-black text-[18px] leading-[24px] font-semibold">
                      ₴{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[#999999] line-through text-[14px] leading-[20px] font-normal">
                        ₴{product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
