'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import ExclusiveProducts from '@/components/sections/ExclusiveProducts'
import ReviewsSection from '@/components/sections/ReviewsSection'
import SubscribeSection from '@/components/sections/SubscribeSection'
import DeliverySection from '@/components/sections/DeliverySection'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'

type Product = {
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

const PRODUCTS_PER_PAGE = 20

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(!checked)}
        className="sr-only peer"
      />
      <div
        className={`w-[16px] h-[16px] border border-[#BBBBBB] rounded-sm flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#6046A3] peer-focus-visible:ring-offset-1 ${
          checked ? 'bg-[#6046A3] border-[#6046A3]' : 'bg-white group-hover:border-[#999]'
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span className="font-gilroy text-[14px] leading-[18px] text-black">{label}</span>
    </label>
  )
}

function FilterSection({ 
  title, isOpen, onToggle, children 
}: { 
  title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode 
}) {
  return (
    <div className="border-b border-[#E5E5E5] pb-4">
      <button onClick={onToggle} className="flex items-center justify-between w-full py-2">
        <span className="font-gilroy font-medium text-[16px] leading-[21px] text-black">{title}</span>
        <span className="text-[20px] text-[#666]">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  )
}

function ActiveFilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-[10px] h-[30px] px-[10px] bg-[#FFE8F0] rounded-sm">
      <span className="font-gilroy text-[14px] text-black">{label}</span>
      <button onClick={onRemove} className="text-[#666] hover:text-black">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

function VolumeButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-[40px] px-[25px] py-[11px] border transition-colors font-gilroy text-[14px] ${
        selected ? 'border-[#6046A3] bg-[#F5F3FF] text-[#6046A3]' : 'border-[#BBBBBB] text-black hover:border-[#999]'
      }`}
    >
      {label}
    </button>
  )
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (productId: string) => void }) {
  const [adding, setAdding] = useState(false)
  const mainImage = product.image_url || product.image_path || '/products/product-1.png'
  const allImages = [mainImage, product.image_url_2, product.image_url_3, product.image_url_4, product.image_url_5].filter(Boolean) as string[]
  const [hoveredIndex, setHoveredIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startCycling = () => {
    if (allImages.length <= 1) return
    intervalRef.current = setInterval(() => {
      setHoveredIndex((prev) => (prev + 1) % allImages.length)
    }, 1000)
  }

  const stopCycling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setHoveredIndex(0)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    await onAddToCart(product.id)
    setTimeout(() => setAdding(false), 500)
  }

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative w-full aspect-square bg-[#F8F7FB] overflow-hidden mb-4" onMouseEnter={startCycling} onMouseLeave={stopCycling}>
        <Image
          src={allImages[hoveredIndex]}
          alt={product.name}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(min-width: 1280px) 288px, (min-width: 640px) 280px, 100vw"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjg4IiBoZWlnaHQ9IjI4OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjhGN0ZCIi8+PC9zdmc+"
        />
        {allImages.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-[2]">
            {allImages.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === hoveredIndex ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
        )}
        
        {product.discount_amount != null && product.discount_amount > 0 && (
          <div className="absolute top-3 left-3 h-[30px] px-3 bg-[#BCC2F4] text-black text-[14px] font-semibold flex items-center">
            Знижка ₴{product.discount_amount}
          </div>
        )}
        
        {product.is_new === 1 && (
          <div className="absolute top-3 right-3 h-[26px] px-3 bg-white text-black text-[14px] font-medium flex items-center">
            NEW
          </div>
        )}
        
        <button
          className={`absolute bottom-3 right-3 w-[40px] h-[40px] rounded-lg flex items-center justify-center transition-all shadow-sm disabled:cursor-not-allowed ${
            adding ? 'bg-[#6046A3] text-white' : 'bg-white hover:bg-[#F5F5F5] text-black'
          }`}
          aria-label="Додати в кошик"
          onClick={handleAddToCart}
          disabled={adding}
        >
          {adding ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          )}
        </button>
      </div>
      
      <h3
        className="font-gilroy text-[14px] sm:text-[18px] leading-[18px] sm:leading-[24px] text-black mb-2"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '54px',
        }}
      >
        {product.name}
      </h3>

      <div className="flex items-center gap-2">
        <span className="font-gilroy font-semibold text-[16px] sm:text-[21px] leading-[22px] sm:leading-[27px] text-black">
          ₴{product.sale_price ?? 0}
        </span>
        {product.original_price && product.original_price > (product.sale_price ?? 0) && (
          <span className="font-gilroy text-[13px] sm:text-[16px] text-[#999999] line-through">
            ₴{product.original_price}
          </span>
        )}
      </div>
    </Link>
  )
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full aspect-square bg-gray-200 mb-4 rounded-lg" />
      <div className="h-[72px] bg-gray-200 mb-2 rounded" />
      <div className="h-[27px] w-[80px] bg-gray-200 rounded" />
    </div>
  )
}

export default function CatalogContent({ initialProducts }: { initialProducts?: Product[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryParam = searchParams.get('category')
  const searchParam = searchParams.get('search')
  const { addToCart } = useCart()
  
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [loading, setLoading] = useState(!(initialProducts && initialProducts.length > 0))
  const [filtersOpen, setFiltersOpen] = useState(false)
  
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])
  const [priceInitialized, setPriceInitialized] = useState(false)
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [onSaleOnly, setOnSaleOnly] = useState(false)
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<'price-desc' | 'price-asc' | 'newest'>('price-desc')

  // Show more states
  const [showAllBrands, setShowAllBrands] = useState(false)
  const [showAllIngredients, setShowAllIngredients] = useState(false)
  const [showAllSkinTypes, setShowAllSkinTypes] = useState(false)
  const [showAllSubcategories, setShowAllSubcategories] = useState(false)

  // Filter section open states
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [subcategoryOpen, setSubcategoryOpen] = useState(true)
  const [priceOpen, setPriceOpen] = useState(true)
  const [saleOpen, setSaleOpen] = useState(true)
  const [ratingOpen, setRatingOpen] = useState(true)
  const [skinTypeOpen, setSkinTypeOpen] = useState(true)
  const [brandOpen, setBrandOpen] = useState(true)
  const [ingredientsOpen, setIngredientsOpen] = useState(false)
  const [volumeOpen, setVolumeOpen] = useState(true)
  
  // Computed max price
  const maxPrice = useMemo(() => {
    const prices = products.map(p => p.sale_price ?? 0).filter(p => p > 0)
    return prices.length > 0 ? Math.ceil(Math.max(...prices)) : 5000
  }, [products])
  
  // Initialize price range once when products are loaded
  useEffect(() => {
    if (!priceInitialized && products.length > 0) {
      setPriceRange([0, maxPrice])
      setPriceInitialized(true)
    }
  }, [maxPrice, priceInitialized, products.length])
  
  // Fetch products client-side only if not prefetched
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) return
    
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        const productsArray = Array.isArray(data) ? data : (data.products || [])
        setProducts(productsArray)
      } catch {
        // Failed to fetch
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Exclusive products for the section below
  const exclusiveProducts = useMemo(() => {
    return products
      .filter(p => p.is_exclusive === 1)
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.sale_price ?? 0,
        originalPrice: p.original_price ?? undefined,
        discount: p.discount_amount ?? undefined,
        image: p.image_url || p.image_path || '/products/product-1.png',
        isNew: p.is_new === 1,
        slug: p.id,
      }))
  }, [products])
  
  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(PRODUCTS_PER_PAGE)
  }, [categoryParam, searchParam, priceRange, selectedSkinTypes, selectedBrands, selectedVolumes, selectedIngredients, selectedCategories, selectedSubcategories, onSaleOnly, minRating, sortBy])
  
  // Extract unique filter values - split comma-separated values
  const filterOptions = useMemo(() => {
    const categories = new Set<string>()
    const subcategories = new Set<string>()
    const skinTypes = new Set<string>()
    const brands = new Set<string>()
    const volumes = new Set<string>()
    const ingredients = new Set<string>()

    products.forEach(p => {
      if (p.category) categories.add(p.category)
      if (p.subcategory) subcategories.add(p.subcategory)
      if (p.skin_type) {
        p.skin_type.split(',').forEach(st => {
          const trimmed = st.trim()
          if (trimmed) skinTypes.add(trimmed)
        })
      }
      if (p.brand) brands.add(p.brand)
      if (p.volume_options) {
        p.volume_options.split(',').forEach(v => {
          const trimmed = v.trim()
          if (trimmed) volumes.add(trimmed)
        })
      }
      if (p.ingredients) {
        p.ingredients.split(',').forEach(i => {
          const trimmed = i.trim()
          if (trimmed) ingredients.add(trimmed)
        })
      }
    })

    return {
      categories: Array.from(categories).filter(Boolean).sort(),
      subcategories: Array.from(subcategories).filter(Boolean).sort(),
      skinTypes: Array.from(skinTypes).filter(Boolean).sort(),
      brands: Array.from(brands).filter(Boolean).sort(),
      volumes: Array.from(volumes).filter(Boolean).sort((a, b) => {
        const numA = parseInt(a) || 0
        const numB = parseInt(b) || 0
        return numA - numB
      }),
      ingredients: Array.from(ingredients).filter(Boolean).sort(),
    }
  }, [products])
  
  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...products]
    
    // Search filter
    if (searchParam) {
      const query = searchParam.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.tags && p.tags.toLowerCase().includes(query)) ||
        (p.short_description && p.short_description.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query)) ||
        (p.ingredients && p.ingredients.toLowerCase().includes(query))
      )
    }
    
    // Category filter from URL
    if (categoryParam) {
      result = result.filter(p =>
        p.category?.toLowerCase().includes(categoryParam.toLowerCase()) ||
        p.subcategory?.toLowerCase().includes(categoryParam.toLowerCase())
      )
    }

    // Category checkbox filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category || ''))
    }

    // Subcategory / product type filter
    if (selectedSubcategories.length > 0) {
      result = result.filter(p => selectedSubcategories.includes(p.subcategory || ''))
    }

    // On sale filter
    if (onSaleOnly) {
      result = result.filter(p => p.discount_amount != null && p.discount_amount > 0)
    }

    // Rating filter
    if (minRating > 0) {
      result = result.filter(p => (p.rating ?? 0) >= minRating)
    }

    // Price filter
    result = result.filter(p => {
      const price = p.sale_price ?? 0
      return price >= priceRange[0] && price <= priceRange[1]
    })
    
    // Skin type filter
    if (selectedSkinTypes.length > 0) {
      result = result.filter(p => {
        if (!p.skin_type) return false
        const productTypes = p.skin_type.split(',').map(s => s.trim())
        return selectedSkinTypes.some(st => productTypes.some(pt => pt.includes(st)))
      })
    }
    
    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand || ''))
    }
    
    // Volume filter
    if (selectedVolumes.length > 0) {
      result = result.filter(p => 
        selectedVolumes.some(v => p.volume_options?.includes(v))
      )
    }
    
    // Ingredients filter
    if (selectedIngredients.length > 0) {
      result = result.filter(p => {
        if (!p.ingredients) return false
        const productIngredients = p.ingredients.toLowerCase()
        return selectedIngredients.some(i => productIngredients.includes(i.toLowerCase()))
      })
    }
    
    // Sort
    switch (sortBy) {
      case 'price-desc':
        result.sort((a, b) => (b.sale_price ?? 0) - (a.sale_price ?? 0))
        break
      case 'price-asc':
        result.sort((a, b) => (a.sale_price ?? 0) - (b.sale_price ?? 0))
        break
      case 'newest':
        result.sort((a, b) => b.is_new - a.is_new)
        break
    }
    
    return result
  }, [products, searchParam, categoryParam, priceRange, selectedSkinTypes, selectedBrands, selectedVolumes, selectedIngredients, selectedCategories, selectedSubcategories, onSaleOnly, minRating, sortBy])
  
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount)
  }, [filteredProducts, displayCount])
  
  const hasMoreProducts = displayCount < filteredProducts.length
  
  const loadMoreProducts = useCallback(() => {
    setLoadingMore(true)
    setTimeout(() => {
      setDisplayCount(prev => prev + PRODUCTS_PER_PAGE)
      setLoadingMore(false)
    }, 300)
  }, [])
  
  const activeFilters = useMemo(() => {
    const filters: { label: string; onRemove: () => void }[] = []
    
    if (searchParam) {
      filters.push({
        label: `Пошук: "${searchParam}"`,
        onRemove: () => {
          const url = new URL(window.location.href)
          url.searchParams.delete('search')
          router.replace(url.pathname + url.search)
        }
      })
    }

    selectedCategories.forEach(c => {
      filters.push({
        label: c,
        onRemove: () => setSelectedCategories(prev => prev.filter(cat => cat !== c))
      })
    })

    selectedSubcategories.forEach(sc => {
      filters.push({
        label: sc,
        onRemove: () => setSelectedSubcategories(prev => prev.filter(s => s !== sc))
      })
    })

    if (onSaleOnly) {
      filters.push({
        label: 'Зі знижкою',
        onRemove: () => setOnSaleOnly(false)
      })
    }

    if (minRating > 0) {
      filters.push({
        label: `Від ${minRating} ★`,
        onRemove: () => setMinRating(0)
      })
    }

    selectedSkinTypes.forEach(st => {
      filters.push({
        label: st,
        onRemove: () => setSelectedSkinTypes(prev => prev.filter(s => s !== st))
      })
    })
    
    selectedBrands.forEach(b => {
      filters.push({
        label: b,
        onRemove: () => setSelectedBrands(prev => prev.filter(br => br !== b))
      })
    })
    
    selectedVolumes.forEach(v => {
      filters.push({
        label: v,
        onRemove: () => setSelectedVolumes(prev => prev.filter(vol => vol !== v))
      })
    })
    
    selectedIngredients.forEach(i => {
      filters.push({
        label: i,
        onRemove: () => setSelectedIngredients(prev => prev.filter(ing => ing !== i))
      })
    })
    
    return filters
  }, [searchParam, selectedCategories, selectedSubcategories, onSaleOnly, minRating, selectedSkinTypes, selectedBrands, selectedVolumes, selectedIngredients])
  
  const clearAllFilters = useCallback(() => {
    setPriceRange([0, maxPrice])
    setSelectedCategories([])
    setSelectedSubcategories([])
    setOnSaleOnly(false)
    setMinRating(0)
    setSelectedSkinTypes([])
    setSelectedBrands([])
    setSelectedVolumes([])
    setSelectedIngredients([])
    if (searchParam) {
      const url = new URL(window.location.href)
      url.searchParams.delete('search')
      router.replace(url.pathname + url.search)
    }
  }, [maxPrice, searchParam, router])
  
  const pageTitle = useMemo(() => {
    if (searchParam) return `Пошук: "${searchParam}"`
    if (categoryParam) {
      const categoryMap: Record<string, string> = {
        'face': 'Косметика для Обличчя',
        'body': 'Косметика для Тіла',
        'hair': 'Косметика для Волосся',
        'health': 'HEALTH & CARE',
        'makeup': 'Макіяж',
        'testers': 'Тестери',
      }
      return categoryMap[categoryParam.toLowerCase()] || categoryParam
    }
    return 'Каталог'
  }, [categoryParam, searchParam])

  const visibleBrands = showAllBrands ? filterOptions.brands : filterOptions.brands.slice(0, 8)
  const visibleSkinTypes = showAllSkinTypes ? filterOptions.skinTypes : filterOptions.skinTypes.slice(0, 6)
  const visibleSubcategories = showAllSubcategories ? filterOptions.subcategories : filterOptions.subcategories.slice(0, 8)
  const visibleIngredients = showAllIngredients ? filterOptions.ingredients : filterOptions.ingredients.slice(0, 8)

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="relative h-[200px] sm:h-[250px] overflow-hidden bg-gradient-to-r from-[#E8E0F0] via-[#D4E8F0] to-[#E8F0E0]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20" />
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px] h-full flex flex-col justify-end pb-8">
          <nav className="flex items-center gap-2 mb-4 text-[14px]">
            <Link href="/" className="text-[#666] hover:text-black transition-colors">Головна</Link>
            <span className="text-[#999]">&gt;</span>
            <span className="text-black">{pageTitle}</span>
          </nav>
          <h1 className="font-bebas text-[48px] sm:text-[64px] lg:text-[80px] leading-[1] text-black uppercase">
            {pageTitle}
          </h1>
        </div>
      </section>
      
      {/* Catalog Content */}
      <section className="py-8 sm:py-12">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-[72px] xl:px-[100px]">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-[260px] flex-shrink-0">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden w-[150px] h-[40px] px-[24px] py-[10px] border border-black flex items-center gap-[10px] mb-6"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="font-gilroy text-[14px]">ФІЛЬТРИ</span>
              </button>
              
              <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block space-y-6`}>
                <p className="font-gilroy text-[18px] leading-[24px] text-black">
                  Результати: {filteredProducts.length}
                </p>
                
                {/* Category filter */}
                {filterOptions.categories.length > 0 && (
                  <FilterSection title="Категорія" isOpen={categoryOpen} onToggle={() => setCategoryOpen(!categoryOpen)}>
                    {filterOptions.categories.map(cat => (
                      <Checkbox
                        key={cat}
                        checked={selectedCategories.includes(cat)}
                        onChange={(checked) => {
                          if (checked) setSelectedCategories(prev => [...prev, cat])
                          else setSelectedCategories(prev => prev.filter(c => c !== cat))
                        }}
                        label={cat}
                      />
                    ))}
                  </FilterSection>
                )}

                {/* Subcategory / Product type filter */}
                {filterOptions.subcategories.length > 0 && (
                  <FilterSection title="Тип продукту" isOpen={subcategoryOpen} onToggle={() => setSubcategoryOpen(!subcategoryOpen)}>
                    {visibleSubcategories.map(sc => (
                      <Checkbox
                        key={sc}
                        checked={selectedSubcategories.includes(sc)}
                        onChange={(checked) => {
                          if (checked) setSelectedSubcategories(prev => [...prev, sc])
                          else setSelectedSubcategories(prev => prev.filter(s => s !== sc))
                        }}
                        label={sc}
                      />
                    ))}
                    {filterOptions.subcategories.length > 8 && (
                      <button
                        onClick={() => setShowAllSubcategories(!showAllSubcategories)}
                        className="text-[14px] text-[#6046A3] hover:underline mt-2"
                      >
                        {showAllSubcategories ? 'Показати менше' : `Показати ще (${filterOptions.subcategories.length - 8})`}
                      </button>
                    )}
                  </FilterSection>
                )}

                {/* Price filter */}
                <FilterSection title="Ціна" isOpen={priceOpen} onToggle={() => setPriceOpen(!priceOpen)}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-[40px] border border-[#BBBBBB] px-[10px] flex items-center justify-between">
                      <span className="text-[#999] text-[14px]">₴</span>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full text-right font-gilroy text-[14px] outline-none"
                        min={0}
                        max={priceRange[1]}
                      />
                    </div>
                    <span className="text-[#999]">до</span>
                    <div className="flex-1 h-[40px] border border-[#BBBBBB] px-[10px] flex items-center justify-between">
                      <span className="text-[#999] text-[14px]">₴</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full text-right font-gilroy text-[14px] outline-none"
                        min={priceRange[0]}
                        max={maxPrice}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-[#6046A3]"
                  />
                  <div className="flex justify-between text-[12px] text-[#999] mt-1">
                    <span>₴0</span>
                    <span>Найбільша ціна: {maxPrice} грн</span>
                  </div>
                </FilterSection>
                
                {/* On Sale filter */}
                <FilterSection title="Знижки" isOpen={saleOpen} onToggle={() => setSaleOpen(!saleOpen)}>
                  <Checkbox
                    checked={onSaleOnly}
                    onChange={setOnSaleOnly}
                    label="Тільки зі знижкою"
                  />
                </FilterSection>

                {/* Rating filter */}
                <FilterSection title="Рейтинг" isOpen={ratingOpen} onToggle={() => setRatingOpen(!ratingOpen)}>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(stars => (
                      <button
                        key={stars}
                        onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                        className={`flex items-center gap-2 w-full py-1 px-2 rounded transition-colors ${
                          minRating === stars ? 'bg-[#F5F3FF]' : 'hover:bg-[#F8F7FB]'
                        }`}
                      >
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill={i <= stars ? '#F5A623' : 'none'} stroke={i <= stars ? '#F5A623' : '#BBBBBB'} strokeWidth="1">
                              <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 10.52l-3.52 1.83.67-3.93L2.3 5.64l3.94-.57L8 1.5z"/>
                            </svg>
                          ))}
                        </div>
                        <span className="font-gilroy text-[14px] text-[#666]">від {stars}</span>
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Skin Type filter */}
                {filterOptions.skinTypes.length > 0 && (
                  <FilterSection title={`За типом шкіри (${filterOptions.skinTypes.length})`} isOpen={skinTypeOpen} onToggle={() => setSkinTypeOpen(!skinTypeOpen)}>
                    {visibleSkinTypes.map(st => (
                      <Checkbox
                        key={st}
                        checked={selectedSkinTypes.includes(st)}
                        onChange={(checked) => {
                          if (checked) setSelectedSkinTypes(prev => [...prev, st])
                          else setSelectedSkinTypes(prev => prev.filter(s => s !== st))
                        }}
                        label={st}
                      />
                    ))}
                    {filterOptions.skinTypes.length > 6 && (
                      <button
                        onClick={() => setShowAllSkinTypes(!showAllSkinTypes)}
                        className="text-[14px] text-[#6046A3] hover:underline mt-2"
                      >
                        {showAllSkinTypes ? 'Показати менше' : `Показати ще (${filterOptions.skinTypes.length - 6})`}
                      </button>
                    )}
                  </FilterSection>
                )}
                
                {/* Brand filter */}
                {filterOptions.brands.length > 0 && (
                  <FilterSection title="Бренд" isOpen={brandOpen} onToggle={() => setBrandOpen(!brandOpen)}>
                    {visibleBrands.map(brand => (
                      <Checkbox
                        key={brand}
                        checked={selectedBrands.includes(brand)}
                        onChange={(checked) => {
                          if (checked) setSelectedBrands(prev => [...prev, brand])
                          else setSelectedBrands(prev => prev.filter(b => b !== brand))
                        }}
                        label={brand}
                      />
                    ))}
                    {filterOptions.brands.length > 8 && (
                      <button
                        onClick={() => setShowAllBrands(!showAllBrands)}
                        className="text-[14px] text-[#6046A3] hover:underline mt-2"
                      >
                        {showAllBrands ? 'Показати менше' : `Показати ще (${filterOptions.brands.length - 8})`}
                      </button>
                    )}
                  </FilterSection>
                )}
                
                {/* Ingredients filter */}
                {filterOptions.ingredients.length > 0 && (
                  <FilterSection title="За активними компонентами" isOpen={ingredientsOpen} onToggle={() => setIngredientsOpen(!ingredientsOpen)}>
                    {visibleIngredients.map(ing => (
                      <Checkbox
                        key={ing}
                        checked={selectedIngredients.includes(ing)}
                        onChange={(checked) => {
                          if (checked) setSelectedIngredients(prev => [...prev, ing])
                          else setSelectedIngredients(prev => prev.filter(i => i !== ing))
                        }}
                        label={ing}
                      />
                    ))}
                    {filterOptions.ingredients.length > 8 && (
                      <button
                        onClick={() => setShowAllIngredients(!showAllIngredients)}
                        className="text-[14px] text-[#6046A3] hover:underline mt-2"
                      >
                        {showAllIngredients ? 'Показати менше' : `Показати ще (${filterOptions.ingredients.length - 8})`}
                      </button>
                    )}
                  </FilterSection>
                )}
                
                {/* Volume filter */}
                {filterOptions.volumes.length > 0 && (
                  <FilterSection title="Розмір" isOpen={volumeOpen} onToggle={() => setVolumeOpen(!volumeOpen)}>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.volumes.map(vol => (
                        <VolumeButton
                          key={vol}
                          label={vol}
                          selected={selectedVolumes.includes(vol)}
                          onClick={() => {
                            if (selectedVolumes.includes(vol)) {
                              setSelectedVolumes(selectedVolumes.filter(v => v !== vol))
                            } else {
                              setSelectedVolumes([...selectedVolumes, vol])
                            }
                          }}
                        />
                      ))}
                    </div>
                  </FilterSection>
                )}
              </div>
            </aside>
            
            {/* Products Grid */}
            <div className="flex-1">
              {/* Active filters and sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  {activeFilters.map((filter, index) => (
                    <ActiveFilterTag key={index} label={filter.label} onRemove={filter.onRemove} />
                  ))}
                  {activeFilters.length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[14px] text-[#666] hover:text-black underline"
                    >
                      Очистити всі
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-gilroy text-[14px] text-[#666]">Сортувати:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'price-desc' | 'price-asc' | 'newest')}
                    className="font-gilroy text-[14px] text-black bg-transparent border-none outline-none cursor-pointer"
                  >
                    <option value="price-desc">За ціною (від більшої до меншої)</option>
                    <option value="price-asc">За ціною (від меншої до більшої)</option>
                    <option value="newest">Новинки</option>
                  </select>
                </div>
              </div>
              
              {/* Products */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-[#F8F7FB] rounded-[24px]">
                  <svg className="w-16 h-16 mx-auto text-[#BBBBBB] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="font-bebas text-[28px] text-black mb-3">
                    {searchParam ? `За запитом "${searchParam}" нічого не знайдено` : 'Товарів не знайдено'}
                  </h3>
                  <p className="text-[#666] mb-6 max-w-md mx-auto font-gilroy text-[15px]">
                    Спробуйте змінити параметри пошуку або очистити фільтри
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="inline-block px-8 py-3 bg-[#6046A3] text-white font-semibold rounded-lg hover:bg-[#4D3882] transition-colors text-[14px]"
                  >
                    Очистити фільтри
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-3 sm:gap-x-6 gap-y-6 sm:gap-y-10">
                    {displayedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                    ))}
                  </div>
                  
                  {/* Show More Button */}
                  {hasMoreProducts && (
                    <div className="mt-10 text-center">
                      <p className="font-gilroy text-[14px] text-[#666] mb-4">
                        Показано {displayedProducts.length} з {filteredProducts.length} товарів
                      </p>
                      <button
                        onClick={loadMoreProducts}
                        disabled={loadingMore}
                        className="inline-flex items-center justify-center h-[50px] px-10 border-2 border-black text-black font-semibold text-[15px] uppercase tracking-[0.05em] hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                      >
                        {loadingMore ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Завантаження...
                          </>
                        ) : (
                          `Показати ще ${Math.min(PRODUCTS_PER_PAGE, filteredProducts.length - displayCount)} товарів`
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {exclusiveProducts.length > 0 && (
        <ExclusiveProducts products={exclusiveProducts} />
      )}
      
      <ReviewsSection />
      <SubscribeSection />
      <DeliverySection />
      <Footer />
    </main>
  )
}
