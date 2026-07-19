import { notFound } from 'next/navigation'
import ProductPageClient from './ProductPageClient'
import { getSeoProduct } from '@/lib/productSeo'
import { listPublicProducts } from '@/lib/productStore'

export const revalidate = 60

type Props = {
  params: { id: string }
}

export default async function ProductPage({ params }: Props) {
  const product = await getSeoProduct(params.id)

  if (!product || product.is_active !== 1) {
    notFound()
  }

  const similarProducts = await listPublicProducts({
    category: product.category,
    exclude: product.id,
    limit: 60,
  })

  return (
    <ProductPageClient
      key={product.id}
      initialProduct={product}
      initialSimilarProducts={similarProducts}
    />
  )
}
