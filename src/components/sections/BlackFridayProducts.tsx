'use client'

import { useEffect, useState } from 'react'
import NewProducts, { type Product } from '@/components/sections/NewProducts'
import { blackFridayPhase } from '@/lib/promo'

/**
 * «Чорна п'ятниця» carousel above «Новинки»: all promo products on one big
 * plate in the poster's lilac. The server already leaves it out after the
 * promo; the browser re-checks the date so a cached page can't show it late.
 */
export default function BlackFridayProducts({ products }: { products: Product[] }) {
  const [show, setShow] = useState(true)
  useEffect(() => {
    setShow(blackFridayPhase() !== 'after')
  }, [])
  if (!show || products.length === 0) return null
  return (
    <NewProducts
      products={products}
      title="Чорна п'ятниця"
      viewAllHref="/catalog?sale=true"
      viewAllLabel="Усі знижки"
      boxed
      iconsOffset={3}
    />
  )
}
