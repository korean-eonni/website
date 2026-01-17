'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Header from '@/components/layout/Header'
import PromoBanner from '@/components/sections/PromoBanner'
import ExclusiveProducts from '@/components/sections/ExclusiveProducts'
import ReviewsSection from '@/components/sections/ReviewsSection'
import SubscribeSection from '@/components/sections/SubscribeSection'
import DeliverySection from '@/components/sections/DeliverySection'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type Product = {
  id: string
  name: string
  short_description: string | null
  sale_price: number | null
  original_price: number | null
  discount_amount: number | null
  image_url: string | null
  image_path: string | null
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
}

// Toggle component
function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-[55px] h-[30px] rounded-[20px] border border-[#BBBBBB] p-[5px] transition-colors ${
        checked ? 'bg-[#BCC2F4]' : 'bg-white'
      }`}
    >
      <div
        className={`w-[20px] h-[20px] rounded-full transition-all ${
          checked ? 'bg-[#6046A3] translate-x-[25px]' : 'bg-[#BBBBBB] translate-x-0'
        }`}
      />
    </button>
  )
}

// Checkbox component
function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        className={`w-[16px] h-[16px] border border-[#BBBBBB] rounded-sm flex items-center justify-center transition-colors ${
          checked ? 'bg-[#6046A3] border-[#6046A3]' : 'bg-white group-hover:border-[#999]'
        }`}
        onClick={() => onChange(!checked)}
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

// Filter section component
function FilterSection({ 
  title, 
  isOpen, 
  onToggle, 
  children 
}: { 
  title: string; 
  isOpen: boolean; 
  onToggle: () => void; 
  children: React.ReactNode 
}) {
  return (
    <div className="border-b border-[#E5E5E5] pb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-2"
      >
        <span className="font-gilroy font-medium text-[16px] leading-[21px] text-black">{title}</span>
        <span className="text-[20px] text-[#666]">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  )
}

// Active filter tag
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

// Volume option button
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

// Product card component
function ProductCard({ product }: { product: Product }) {
  const displayName = product.short_description 
    ? `${product.short_description} – ${product.name}`
    : product.name

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative w-full aspect-square bg-[#F8F7FB] overflow-hidden mb-4">
        <Image
          src={product.image_url || product.image_path || '/products/product-1.png'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(min-width: 1024px) 288px, (min-width: 640px) 50vw, 100vw"
        />
        
        {product.discount_amount && product.discount_amount > 0 && (
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
          className="absolute bottom-3 right-3 w-[40px] h-[40px] bg-white rounded-lg flex items-center justify-center hover:bg-[#F5F5F5] transition-colors shadow-sm"
          aria-label="Додати в кошик"
          onClick={(e) => {
            e.preventDefault()
            // Add to cart logic
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
      </div>
      
      <h3 
        className="font-gilroy text-[18px] leading-[24px] text-black mb-2"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '72px',
        }}
      >
        {displayName}
      </h3>
      
      <div className="flex items-center gap-2">
        <span className="font-gilroy font-semibold text-[21px] leading-[27px] text-black">
          ₴{product.sale_price ?? 0}
        </span>
        {product.original_price && product.original_price > (product.sale_price ?? 0) && (
          <span className="font-gilroy text-[16px] text-[#999999] line-through">
            ₴{product.original_price}
          </span>
        )}
      </div>
    </Link>
  )
}

export default function CatalogContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  
  const [products, setProducts] = useState<Product[]>([])
  const [exclusiveProducts, setExclusiveProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  
  // Filter states
  const [inStockOnly, setInStockOnly] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [maxPrice, setMaxPrice] = useState(5000)
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'price-desc' | 'price-asc' | 'newest'>('price-desc')
  
  // Filter section open states
  const [priceOpen, setPriceOpen] = useState(true)
  const [skinTypeOpen, setSkinTypeOpen] = useState(true)
  const [brandOpen, setBrandOpen] = useState(true)
  const [ingredientsOpen, setIngredientsOpen] = useState(false)
  const [volumeOpen, setVolumeOpen] = useState(true)
  
  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        // Handle both array response and {products: [...]} response
        const productsArray = Array.isArray(data) ? data : (data.products || [])
        setProducts(productsArray)
        
        // Calculate max price
        const prices = productsArray.map((p: Product) => p.sale_price ?? 0).filter((p: number) => p > 0)
        if (prices.length > 0) {
          const max = Math.max(...prices)
          setMaxPrice(max)
          setPriceRange([0, max])
        }
        
        // Get exclusive products for the section
        const exclusive = productsArray
          .filter((p: Product) => p.is_exclusive === 1)
          .slice(0, 6)
          .map((p: Product) => ({
            id: p.id,
            name: p.name,
            price: p.sale_price ?? 0,
            originalPrice: p.original_price ?? undefined,
            discount: p.discount_amount ?? undefined,
            image: p.image_url || p.image_path || '/products/product-1.png',
            isNew: p.is_new === 1,
            slug: p.id,
          }))
        setExclusiveProducts(exclusive)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])
  
  // Extract unique filter values
  const filterOptions = useMemo(() => {
    const skinTypes = new Set<string>()
    const brands = new Set<string>()
    const volumes = new Set<string>()
    const ingredients = new Set<string>()
    
    products.forEach(p => {
      if (p.skin_type) skinTypes.add(p.skin_type)
      if (p.brand) brands.add(p.brand)
      if (p.volume_options) {
        p.volume_options.split(',').forEach(v => volumes.add(v.trim()))
      }
      if (p.ingredients) {
        // Extract key ingredients (first few)
        p.ingredients.split(',').slice(0, 5).forEach(i => ingredients.add(i.trim()))
      }
    })
    
    return {
      skinTypes: Array.from(skinTypes).filter(Boolean).sort(),
      brands: Array.from(brands).filter(Boolean).sort(),
      volumes: Array.from(volumes).filter(Boolean).sort((a, b) => {
        const numA = parseInt(a) || 0
        const numB = parseInt(b) || 0
        return numA - numB
      }),
      ingredients: Array.from(ingredients).filter(Boolean).sort().slice(0, 15),
    }
  }, [products])
  
  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...products]
    
    // Category filter from URL
    if (categoryParam) {
      result = result.filter(p => 
        p.category?.toLowerCase().includes(categoryParam.toLowerCase()) ||
        p.subcategory?.toLowerCase().includes(categoryParam.toLowerCase())
      )
    }
    
    // In stock filter
    if (inStockOnly) {
      result = result.filter(p => (p.stock_quantity ?? 0) > 0)
    }
    
    // Price filter
    result = result.filter(p => {
      const price = p.sale_price ?? 0
      return price >= priceRange[0] && price <= priceRange[1]
    })
    
    // Skin type filter
    if (selectedSkinTypes.length > 0) {
      result = result.filter(p => 
        selectedSkinTypes.some(st => p.skin_type?.includes(st))
      )
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
      result = result.filter(p => 
        selectedIngredients.some(i => p.ingredients?.toLowerCase().includes(i.toLowerCase()))
      )
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
  }, [products, categoryParam, inStockOnly, priceRange, selectedSkinTypes, selectedBrands, selectedVolumes, selectedIngredients, sortBy])
  
  // Get active filters for display
  const activeFilters = useMemo(() => {
    const filters: { label: string; onRemove: () => void }[] = []
    
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
  }, [selectedSkinTypes, selectedBrands, selectedVolumes, selectedIngredients])
  
  const clearAllFilters = useCallback(() => {
    setInStockOnly(false)
    setPriceRange([0, maxPrice])
    setSelectedSkinTypes([])
    setSelectedBrands([])
    setSelectedVolumes([])
    setSelectedIngredients([])
  }, [maxPrice])
  
  // Get page title based on category
  const pageTitle = useMemo(() => {
    if (categoryParam) {
      const categoryMap: Record<string, string> = {
        'face': 'Косметика для Обличчя',
        'body': 'Косметика для Тіла',
        'health': 'HEALTH & CARE',
        'makeup': 'Макіяж',
      }
      return categoryMap[categoryParam.toLowerCase()] || categoryParam
    }
    return 'Каталог'
  }, [categoryParam])
  
  // Count in-stock products
  const inStockCount = useMemo(() => {
    return products.filter(p => (p.stock_quantity ?? 0) > 0).length
  }, [products])

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <PromoBanner />
      
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
              {/* Mobile filter toggle */}
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
                {/* Results count */}
                <p className="font-gilroy text-[18px] leading-[24px] text-black">
                  Результати: {filteredProducts.length}
                </p>
                
                {/* In stock toggle */}
                <div className="flex items-center gap-3">
                  <Toggle checked={inStockOnly} onChange={setInStockOnly} />
                  <span className="font-gilroy text-[14px] text-black">В наявності ({inStockCount})</span>
                </div>
                
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
                
                {/* Skin Type filter */}
                <FilterSection title={`За типом шкіри (${filterOptions.skinTypes.length})`} isOpen={skinTypeOpen} onToggle={() => setSkinTypeOpen(!skinTypeOpen)}>
                  {filterOptions.skinTypes.map(st => (
                    <Checkbox
                      key={st}
                      checked={selectedSkinTypes.includes(st)}
                      onChange={(checked) => {
                        if (checked) {
                          setSelectedSkinTypes([...selectedSkinTypes, st])
                        } else {
                          setSelectedSkinTypes(selectedSkinTypes.filter(s => s !== st))
                        }
                      }}
                      label={st}
                    />
                  ))}
                </FilterSection>
                
                {/* Brand filter */}
                <FilterSection title="Бренд" isOpen={brandOpen} onToggle={() => setBrandOpen(!brandOpen)}>
                  {filterOptions.brands.slice(0, 6).map(brand => (
                    <Checkbox
                      key={brand}
                      checked={selectedBrands.includes(brand)}
                      onChange={(checked) => {
                        if (checked) {
                          setSelectedBrands([...selectedBrands, brand])
                        } else {
                          setSelectedBrands(selectedBrands.filter(b => b !== brand))
                        }
                      }}
                      label={brand}
                    />
                  ))}
                  {filterOptions.brands.length > 6 && (
                    <button className="text-[14px] text-[#6046A3] hover:underline mt-2">
                      Показати більше
                    </button>
                  )}
                </FilterSection>
                
                {/* Ingredients filter */}
                <FilterSection title="За активними компонентами" isOpen={ingredientsOpen} onToggle={() => setIngredientsOpen(!ingredientsOpen)}>
                  {filterOptions.ingredients.map(ing => (
                    <Checkbox
                      key={ing}
                      checked={selectedIngredients.includes(ing)}
                      onChange={(checked) => {
                        if (checked) {
                          setSelectedIngredients([...selectedIngredients, ing])
                        } else {
                          setSelectedIngredients(selectedIngredients.filter(i => i !== ing))
                        }
                      }}
                      label={ing}
                    />
                  ))}
                </FilterSection>
                
                {/* Volume filter */}
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
                    onChange={(e) => setSortBy(e.target.value as any)}
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
                    <div key={i} className="animate-pulse">
                      <div className="w-full aspect-square bg-gray-200 mb-4" />
                      <div className="h-[72px] bg-gray-200 mb-2" />
                      <div className="h-[27px] w-[80px] bg-gray-200" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="font-gilroy text-[18px] text-[#666] mb-4">
                    Товарів не знайдено
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="font-gilroy text-[14px] text-[#6046A3] hover:underline"
                  >
                    Очистити фільтри
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Exclusive Products Section */}
      {exclusiveProducts.length > 0 && (
        <ExclusiveProducts products={exclusiveProducts} />
      )}
      
      {/* Reviews Section */}
      <ReviewsSection />
      
      {/* Subscribe Section */}
      <SubscribeSection />
      
      {/* Delivery Section */}
      <DeliverySection />
      
      <Footer />
    </main>
  )
}

