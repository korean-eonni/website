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

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <PromoBanner />
      <Hero />
      <FeaturedIn />
      <NewProducts />
      <Categories />
      <PromoDiscount />
      <ExclusiveProducts />
      <TipsSection />
      <ReviewsSection />
      <SubscribeSection />
      <DeliverySection />
      <Footer />
    </main>
  )
}
