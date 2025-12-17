import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import Hero from '@/components/sections/Hero'
import FeaturedIn from '@/components/sections/FeaturedIn'
import NewProducts from '@/components/sections/NewProducts'
import Categories from '@/components/sections/Categories'
import PromoDiscount from '@/components/sections/PromoDiscount'
import ExclusiveProducts from '@/components/sections/ExclusiveProducts'
import TipsSection from '@/components/sections/TipsSection'
import ReviewsSection from '@/components/sections/ReviewsSection'
import SubscribeSection from '@/components/sections/SubscribeSection'
import DeliverySection from '@/components/sections/DeliverySection'
import Footer from '@/components/layout/Footer'
import { listProducts } from '@/lib/productStore'

type ProductCard = {
  id: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  isNew: boolean
  slug: string
}

export default async function Home() {
  const mapRow = (row: {
    id: string
    name: string
    sale_price: number | null
    original_price: number | null
    discount_amount: number | null
    image_path: string | null
    image_url: string | null
    is_new: number
  }): ProductCard => ({
    id: row.id,
    name: row.name,
    price: row.sale_price ?? 0,
    originalPrice: row.original_price ?? undefined,
    discount: row.discount_amount ?? undefined,
    image: row.image_path || row.image_url || '/products/product-1.png',
    isNew: row.is_new === 1,
    slug: row.id,
  })

  const newRows = (await listProducts('is_active = 1 AND is_new = 1')).slice(0, 6) as Array<{
    id: string
    name: string
    sale_price: number | null
    original_price: number | null
    discount_amount: number | null
    image_path: string | null
    image_url: string | null
    is_new: number
  }>
  const exclusiveRows = (await listProducts('is_active = 1 AND is_exclusive = 1')).slice(0, 6) as Array<{
    id: string
    name: string
    sale_price: number | null
    original_price: number | null
    discount_amount: number | null
    image_path: string | null
    image_url: string | null
    is_new: number
  }>

  const newProducts = newRows.map(mapRow)
  const exclusiveProducts = exclusiveRows.map(mapRow)

  return (
    <main className="min-h-screen">
      <Header />
      <PromoBanner />
      <Hero />
      <FeaturedIn />
      <NewProducts products={newProducts} />
      <Categories />
      <PromoDiscount />
      <ExclusiveProducts products={exclusiveProducts} />
      <TipsSection />
      <ReviewsSection />
      <SubscribeSection />
      <DeliverySection />
      <Footer />
    </main>
  )
}
