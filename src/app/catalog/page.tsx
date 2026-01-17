import { Suspense } from 'react'
import CatalogContent from './CatalogContent'

export const dynamic = 'force-dynamic'

// Loading skeleton for the catalog
function CatalogSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="animate-pulse">
        <div className="h-[80px] bg-gray-100" />
        <div className="h-[40px] bg-gray-50" />
        <div className="h-[200px] bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100" />
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="flex gap-8">
            <div className="w-[260px] space-y-4">
              <div className="h-8 bg-gray-200 rounded w-32" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
            <div className="flex-1 grid grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-square bg-gray-200 mb-4" />
                  <div className="h-[72px] bg-gray-200 mb-2" />
                  <div className="h-[27px] w-[80px] bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogContent />
    </Suspense>
  )
}
