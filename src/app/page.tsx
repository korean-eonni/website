import Hero from '@/components/sections/Hero'
import HomeIntro from '@/components/sections/HomeIntro'
import FeaturedIn from '@/components/sections/FeaturedIn'
import NewProducts from '@/components/sections/NewProducts'
import Categories from '@/components/sections/Categories'
import ExclusiveProducts from '@/components/sections/ExclusiveProducts'
import ReviewsSection from '@/components/sections/ReviewsSection'
import SubscribeSection from '@/components/sections/SubscribeSection'
import DeliverySection from '@/components/sections/DeliverySection'
import Footer from '@/components/layout/Footer'
import { listPublicProducts } from '@/lib/productStore'

export const revalidate = 60

type ProductCard = {
  id: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  images: string[]
  isNew: boolean
  slug: string
}

export default async function Home() {
  type RawRow = {
    id: string
    name: string
    sale_price: number | null
    original_price: number | null
    discount_amount: number | null
    image_path: string | null
    image_url: string | null
    image_url_2: string | null
    image_url_3: string | null
    image_url_4: string | null
    image_url_5: string | null
    is_new: number
  }

  const mapRow = (row: RawRow): ProductCard => {
    const mainImage = row.image_path || row.image_url || '/products/product-1.png'
    const allImages = [mainImage, row.image_url_2, row.image_url_3, row.image_url_4, row.image_url_5].filter(Boolean) as string[]
    return {
      id: row.id,
      name: row.name,
      price: row.sale_price ?? 0,
      originalPrice: row.original_price ?? undefined,
      discount: row.discount_amount ?? undefined,
      image: mainImage,
      images: allImages,
      isNew: row.is_new === 1,
      slug: row.id,
    }
  }

  const [newRows, exclusiveRows] = await Promise.all([
    listPublicProducts({ newOnly: true, limit: 12 }),
    listPublicProducts({ exclusiveOnly: true, limit: 12 }),
  ]) as [RawRow[], RawRow[]]

  const newProducts = newRows.map(mapRow)
  const exclusiveProducts = exclusiveRows.map(mapRow)

  return (
    <main className="min-h-screen -mt-[86px]">
      {/* Hero spans the full viewport from top:0 — so the floating header capsule
          appears DIRECTLY over the Hero face image, with no gap or backdrop strip. */}
      <div className="fixed top-0 left-0 right-0 h-screen z-0 bg-[#E2F9FF]">
        <Hero />
      </div>

      {/* Spacer: header height + hero visible area */}
      <div className="h-[576px] sm:h-[652px] lg:h-[calc(100vh)]" />

      {/* Content sections that scroll over the hero.
          translate3d promotes this to its own GPU layer so the fixed hero behind it doesn't
          repaint on every scroll frame; `contain: paint` further isolates section paints. */}
      <div
        className="relative z-10 bg-[#E2F9FF] rounded-t-[30px] sm:rounded-t-[40px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] overflow-hidden"
        style={{ transform: 'translate3d(0,0,0)', contain: 'paint' }}
      >
        <HomeIntro />
        <FeaturedIn />
        <NewProducts products={newProducts} />
        <Categories />
        <ExclusiveProducts products={exclusiveProducts} />
        <SubscribeSection />
        <DeliverySection />
        <ReviewsSection />
        <Footer />
      </div>
    </main>
  )
}
