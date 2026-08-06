'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import PhoneInput from '@/components/ui/PhoneInput'
import { useWishlist } from '@/contexts/WishlistContext'
import AccountAvatar from '@/components/account/AccountAvatar'

type User = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
}

type Order = {
  id: string
  status: string
  total_amount: number
  created_at: string
  tracking_number: string | null
  first_name: string
  last_name: string
  phone: string
  email: string
  shipping_method: string
  shipping_city: string | null
  shipping_warehouse: string | null
  items?: { product_name: string; quantity: number; price: number; product_image: string | null }[]
}

type WishlistProduct = {
  id: string
  name: string
  sale_price: number
  image_url: string | null
}

// Tab component
function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 sm:px-6 py-3 font-gilroy text-[14px] sm:text-[16px] transition-colors border-b-2 whitespace-nowrap ${
        active 
          ? 'border-[#4348AE] text-[#4348AE] font-semibold' 
          : 'border-transparent text-[#666] hover:text-black'
      }`}
    >
      {children}
    </button>
  )
}

// Order status badge
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Очікує підтвердження', color: '#B45309', bg: '#FEF3C7' },
    confirmed: { label: 'Підтверджено', color: '#1D4ED8', bg: '#E2F9FF' },
    processing: { label: 'Обробляється', color: '#7C3AED', bg: '#EDE9FE' },
    shipped: { label: 'Відправлено', color: '#0891B2', bg: '#E2F9FF' },
    delivered: { label: 'Доставлено', color: '#059669', bg: '#D1FAE5' },
    cancelled: { label: 'Скасовано', color: '#DC2626', bg: '#FEE2E2' },
  }
  
  const config = statusConfig[status] || statusConfig.pending
  
  return (
    <span 
      className="px-3 py-1 rounded-full text-[12px] sm:text-[13px] font-medium"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  )
}

// Guest Order Lookup
function GuestOrderLookup({ onOrdersFound }: { onOrdersFound: (orders: Order[]) => void }) {
  const [lookupType, setLookupType] = useState<'phone' | 'email'>('phone')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setSearched(true)

    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lookupType === 'phone' ? { phone } : { email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Помилка пошуку')
      }

      const orders = await res.json()
      onOrdersFound(orders)
    } catch (err: any) {
      setError(err.message)
      onOrdersFound([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#F8F7FB] rounded-[24px] p-6 sm:p-8">
      <h3 className="font-bebas text-[24px] sm:text-[28px] text-black mb-2">Відстежити замовлення</h3>
      <p className="text-[14px] text-[#666] mb-6">
        Введіть номер телефону або email, який ви вказували при оформленні замовлення
      </p>

      {/* Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setLookupType('phone')}
          className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-colors ${
            lookupType === 'phone'
              ? 'bg-[#4348AE] text-white'
              : 'bg-[#E2F9FF] text-[#666] border border-[#E5E5E5] hover:border-[#4348AE]'
          }`}
        >
          За телефоном
        </button>
        <button
          onClick={() => setLookupType('email')}
          className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-colors ${
            lookupType === 'email'
              ? 'bg-[#4348AE] text-white'
              : 'bg-[#E2F9FF] text-[#666] border border-[#E5E5E5] hover:border-[#4348AE]'
          }`}
        >
          За email
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[14px]">
          {error}
        </div>
      )}

      <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
        {lookupType === 'phone' ? (
          <PhoneInput value={phone} onChange={setPhone} required className="flex-1" />
        ) : (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
          />
        )}
        <button
          type="submit"
          disabled={loading}
          className="h-[50px] px-8 bg-[#4348AE] text-white font-semibold rounded-lg hover:bg-[#373B8A] transition-colors disabled:opacity-50"
        >
          {loading ? 'Пошук...' : 'Знайти'}
        </button>
      </form>

      {searched && !loading && (
        <p className="mt-4 text-[13px] text-[#999]">
          Якщо ви не знайшли своє замовлення, зверніться до нас: +380 73 273 73 30
        </p>
      )}
    </div>
  )
}

// Login/Register Form
function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Паролі не співпадають')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('Пароль має бути не менше 6 символів')
          setLoading(false)
          return
        }
        
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName, phone }),
        })
        
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Помилка реєстрації')
        }
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Невірний email або пароль')
        }
      }
      
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="bg-[#E2F9FF] rounded-[24px] border border-[#E5E5E5] p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <h2 className="font-bebas text-[32px] sm:text-[40px] text-black text-center mb-2">
        {mode === 'login' ? 'Вхід в акаунт' : 'Реєстрація'}
      </h2>
      <p className="text-[#666] text-center text-[14px] mb-8">
        {mode === 'login' 
          ? 'Увійдіть для доступу до замовлень та списку бажань' 
          : 'Створіть акаунт для зручних покупок'}
      </p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[14px]">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] text-[#666] mb-2">Ім&apos;я</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
                placeholder="Ваше ім'я"
              />
            </div>
            <div>
              <label className="block text-[14px] text-[#666] mb-2">Прізвище</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
                placeholder="Ваше прізвище"
              />
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-[14px] text-[#666] mb-2">
            {mode === 'login' ? 'Email або номер телефону *' : 'Email *'}
          </label>
          <input
            // Logging in accepts either, so it can't be type="email" — the browser
            // would reject a phone number before the form is ever submitted.
            type={mode === 'login' ? 'text' : 'email'}
            inputMode={mode === 'login' ? 'text' : 'email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
            placeholder={mode === 'login' ? 'your@email.com або 0XX XXX XX XX' : 'your@email.com'}
          />
        </div>
        
        {mode === 'register' && (
          <div>
            <label className="block text-[14px] text-[#666] mb-2">Телефон</label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
        )}
        
        <div>
          <label className="block text-[14px] text-[#666] mb-2">Пароль *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
            placeholder="••••••••"
          />
        </div>
        
        {mode === 'register' && (
          <div>
            <label className="block text-[14px] text-[#666] mb-2">Підтвердіть пароль *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
              placeholder="••••••••"
            />
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[54px] bg-[#4348AE] text-white font-semibold text-[16px] rounded-lg hover:bg-[#373B8A] transition-colors disabled:opacity-50"
        >
          {loading ? 'Зачекайте...' : (mode === 'login' ? 'Увійти' : 'Зареєструватися')}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-[14px] text-[#666]">
          {mode === 'login' ? 'Ще немає акаунту?' : 'Вже маєте акаунт?'}
          {' '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError(null)
            }}
            className="text-[#4348AE] font-semibold hover:underline"
          >
            {mode === 'login' ? 'Зареєструватися' : 'Увійти'}
          </button>
        </p>
      </div>
    </div>
  )
}

// Orders List Component
function OrdersList({ orders, showCustomerInfo = false }: { orders: Order[]; showCustomerInfo?: boolean }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-[#F8F7FB] rounded-[24px]">
        <svg className="w-16 h-16 mx-auto text-[#BBBBBB] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 className="font-bebas text-[24px] text-black mb-2">Замовлення не знайдено</h3>
        <p className="text-[#666] mb-6">Спробуйте інший номер телефону або email</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-[#E2F9FF] border border-[#E5E5E5] rounded-[16px] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-[13px] text-[#666]">Замовлення</p>
              <p className="font-semibold text-[16px] sm:text-[18px] text-black">{order.id}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {/* Order Items Preview */}
          {order.items && order.items.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {order.items.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex-shrink-0 w-[60px] h-[60px] bg-[#F8F7FB] rounded-lg overflow-hidden relative">
                  {item.product_image && (
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  )}
                  {item.quantity > 1 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#4348AE] text-white text-[10px] rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  )}
                </div>
              ))}
              {order.items.length > 4 && (
                <div className="flex-shrink-0 w-[60px] h-[60px] bg-[#F8F7FB] rounded-lg flex items-center justify-center text-[14px] text-[#666]">
                  +{order.items.length - 4}
                </div>
              )}
            </div>
          )}

          {showCustomerInfo && (
            <div className="mb-4 p-3 bg-[#F8F7FB] rounded-lg text-[13px]">
              <p><span className="text-[#666]">Отримувач:</span> {order.first_name} {order.last_name}</p>
              <p><span className="text-[#666]">Телефон:</span> {order.phone}</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E5E5E5]">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div>
                <p className="text-[11px] sm:text-[12px] text-[#999]">Дата</p>
                <p className="text-[13px] sm:text-[14px] text-black">
                  {new Date(order.created_at).toLocaleDateString('uk-UA')}
                </p>
              </div>
              <div>
                <p className="text-[11px] sm:text-[12px] text-[#999]">Сума</p>
                <p className="text-[13px] sm:text-[14px] font-semibold text-black">₴{order.total_amount}</p>
              </div>
              {order.tracking_number && (
                <div>
                  <p className="text-[11px] sm:text-[12px] text-[#999]">ТТН</p>
                  <p className="text-[13px] sm:text-[14px] text-[#4348AE] font-medium">{order.tracking_number}</p>
                </div>
              )}
            </div>
            <Link
              href={`/orders/${order.id}`}
              className="text-[14px] text-[#4348AE] font-medium hover:underline"
            >
              Детальніше →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

// User Dashboard
function UserDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') as 'orders' | 'wishlist' | 'settings' | null
  
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'settings'>(initialTab || 'orders')
  const [orders, setOrders] = useState<Order[]>([])
  // Wishlist comes from the client-side store (works without login); we just
  // resolve product details for the saved ids.
  const { ids: wishlistIds, remove: removeWishlistId } = useWishlist()
  const [productMap, setProductMap] = useState<Record<string, WishlistProduct>>({})
  const wishlist = wishlistIds.map((id) => productMap[id]).filter(Boolean) as WishlistProduct[]
  const [loading, setLoading] = useState(true)
  
  // Profile edit state
  const [editMode, setEditMode] = useState(false)
  const [firstName, setFirstName] = useState(user.first_name || '')
  const [lastName, setLastName] = useState(user.last_name || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    fetchData()
  }, [])
  
  const fetchData = async () => {
    setLoading(true)
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/user/orders'),
        fetch('/api/products'),
      ])

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }

      if (productsRes.ok) {
        const data = await productsRes.json()
        const arr = Array.isArray(data) ? data : (data.products || [])
        const map: Record<string, WishlistProduct> = {}
        for (const p of arr) {
          map[p.id] = { id: p.id, name: p.name, sale_price: p.sale_price ?? 0, image_url: p.image_url ?? null }
        }
        setProductMap(map)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone }),
      })
      
      if (res.ok) {
        setEditMode(false)
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }
  
  const removeFromWishlist = (productId: string) => {
    removeWishlistId(productId)
  }
  
  const latestOrder = orders[0]

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Who is signed in + the way out */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <AccountAvatar userId={user.id} initials={(user.first_name?.[0] || user.email[0]).toUpperCase()} />
          <div>
            <h1 className="font-bebas text-[28px] sm:text-[32px] text-black">
              {user.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Мій акаунт'}
            </h1>
            <p className="text-[#666] text-[13px] sm:text-[14px]">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-6 py-2 border border-[#DC2626] text-[#DC2626] rounded-lg hover:bg-red-50 transition-colors text-[14px] font-medium self-start sm:self-auto"
        >
          Вийти з акаунту
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-[#4348AE] border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-[#666]">Завантаження...</p>
        </div>
      ) : (
        <>
          {/* Tracking for the most recent order — why most people open this page */}
          <section className="mb-12">
            <h2 className="font-bebas uppercase text-black text-[28px] sm:text-[36px] mb-4">
              Відстежити замовлення
            </h2>
            {latestOrder ? (
              <OrderTrackingCard order={latestOrder} />
            ) : (
              <div className="rounded-[24px] bg-[#F8F7FB] p-8 text-center">
                <p className="text-[#666] mb-5">У вас поки немає замовлень для відстеження.</p>
                <Link
                  href="/catalog"
                  className="inline-block px-8 py-3 bg-[#4348AE] text-white rounded-lg hover:bg-[#373B8A] transition-colors"
                >
                  Перейти до каталогу
                </Link>
              </div>
            )}
          </section>

          <div className="grid gap-8 lg:gap-10 lg:grid-cols-[1.1fr,0.9fr] items-start">
            {/* Order history — newest first */}
            <section>
              <h2 className="font-bebas uppercase text-black text-[26px] sm:text-[32px] mb-4">
                Історія замовлень
              </h2>
              {orders.length === 0 ? (
                <div className="rounded-[20px] bg-[#F8F7FB] p-8 text-center text-[#666]">
                  Тут з&apos;являться ваші замовлення.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map((order, index) => (
                    <OrderHistoryCard key={order.id} order={order} index={index} />
                  ))}
                </div>
              )}
            </section>

            {/* Wishlist */}
            <section>
              <h2 className="font-bebas uppercase text-black text-[26px] sm:text-[32px] mb-4 flex items-center gap-2">
                Мої
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#E84A8A" stroke="#E84A8A" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </h2>
              {wishlist.length === 0 ? (
                <div className="rounded-[20px] bg-[#F8F7FB] p-8 text-center text-[#666]">
                  Додавайте улюблене кнопкою-сердечком.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {wishlist.map((product) => (
                    <div key={product.id} className="bg-[#E2F9FF] border border-[#E5E5E5] rounded-[16px] overflow-hidden">
                      <Link href={`/product/${product.id}`} className="block relative aspect-square bg-white">
                        {product.image_url && (
                          <Image src={product.image_url} alt={product.name} fill className="object-contain p-3" sizes="200px" />
                        )}
                      </Link>
                      <div className="p-3">
                        <Link href={`/product/${product.id}`}>
                          <h3 className="font-gilroy text-[13px] text-black hover:text-[#4348AE] transition-colors line-clamp-2 mb-1.5">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[15px]">₴{product.sale_price}</span>
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="p-1.5 text-[#999] hover:text-[#DC2626] transition-colors"
                            title="Видалити зі списку"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Personal details, kept so name/phone stay editable */}
          <section className="mt-12 max-w-[600px]">
            <div className="bg-[#E2F9FF] border border-[#E5E5E5] rounded-[24px] p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bebas text-[24px] sm:text-[28px] text-black">Особисті дані</h2>
                {!editMode && (
                  <button onClick={() => setEditMode(true)} className="text-[14px] text-[#4348AE] font-medium hover:underline">
                    Редагувати
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] text-[#666] mb-2">Ім&apos;я</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE]"
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] text-[#666] mb-2">Прізвище</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[14px] text-[#666] mb-2">Телефон</label>
                    <PhoneInput value={phone} onChange={setPhone} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-6 py-3 bg-[#4348AE] text-white rounded-lg hover:bg-[#373B8A] transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Збереження...' : 'Зберегти'}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-6 py-3 border border-[#BBBBBB] rounded-lg hover:bg-[#F8F7FB] transition-colors"
                    >
                      Скасувати
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-[15px]">
                  <p><span className="text-[#666]">Ім&apos;я: </span>{[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}</p>
                  <p><span className="text-[#666]">Email: </span>{user.email}</p>
                  <p><span className="text-[#666]">Телефон: </span>{user.phone || '—'}</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

/** Full detail of the most recent order, at the top of the account page. */
function OrderTrackingCard({ order }: { order: Order }) {
  const delivery = [order.shipping_city, order.shipping_warehouse].filter(Boolean).join(', ')
  return (
    <div className="rounded-[24px] border border-[#E5E5E5] bg-[#E2F9FF] p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-[12px] uppercase tracking-[0.18em] text-[#666]">Замовлення</p>
          <p className="font-bebas text-[26px] text-black leading-tight">#{order.id.slice(0, 8)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-[15px] mb-5">
        <p><span className="text-[#666]">Дата: </span>{new Date(order.created_at).toLocaleDateString('uk-UA')}</p>
        <p><span className="text-[#666]">Сума: </span><span className="font-semibold">₴{Number(order.total_amount).toFixed(0)}</span></p>
        {delivery && <p className="sm:col-span-2"><span className="text-[#666]">Доставка: </span>{delivery}</p>}
        <p className="sm:col-span-2">
          <span className="text-[#666]">ТТН: </span>
          {order.tracking_number ? (
            <span className="font-semibold">{order.tracking_number}</span>
          ) : (
            <span className="text-[#666]">буде додано після відправлення</span>
          )}
        </p>
      </div>

      {order.items && order.items.length > 0 && (
        <div className="border-t border-black/10 pt-4 space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between gap-4 text-[14px]">
              <span className="text-black/80">{item.product_name} x {item.quantity}</span>
              <span className="font-medium whitespace-nowrap">₴{Number(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Each order gets its own tint from the site palette, so the list reads as
// separate purchases at a glance rather than one long block.
const ORDER_TINTS = ['#FFE8F0', '#E2F9FF', '#F6F1FF', '#FFF8E9', '#F4F8F3']

function OrderHistoryCard({ order, index }: { order: Order; index: number }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block rounded-[18px] border border-white/70 p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(0,0,0,0.10)]"
      style={{ backgroundColor: ORDER_TINTS[index % ORDER_TINTS.length] }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="font-bebas text-[20px] text-black leading-tight">#{order.id.slice(0, 8)}</p>
        <StatusBadge status={order.status} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[14px]">
        <span className="text-black/65">{new Date(order.created_at).toLocaleDateString('uk-UA')}</span>
        <span className="font-semibold">₴{Number(order.total_amount).toFixed(0)}</span>
      </div>
      {order.items && order.items.length > 0 && (
        <p className="mt-2 text-[13px] text-black/60 line-clamp-1">
          {order.items.map((i) => i.product_name).join(', ')}
        </p>
      )}
    </Link>
  )
}

// Guest View (not logged in)
function GuestView({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [guestOrders, setGuestOrders] = useState<Order[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleOrdersFound = (orders: Order[]) => {
    setGuestOrders(orders)
    setHasSearched(true)
  }

  return (
    <div className="max-w-[900px] mx-auto">
      <h1 className="font-bebas text-[40px] sm:text-[56px] text-black text-center mb-4">
        Мій акаунт
      </h1>
      <p className="text-[#666] text-center text-[16px] mb-10 max-w-[500px] mx-auto">
        Увійдіть в акаунт або знайдіть ваше замовлення за номером телефону
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Guest Order Lookup */}
        <div>
          <GuestOrderLookup onOrdersFound={handleOrdersFound} />
          
          {/* Guest Orders Results */}
          {hasSearched && guestOrders.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bebas text-[24px] text-black mb-4">Знайдені замовлення</h3>
              <OrdersList orders={guestOrders} showCustomerInfo />
            </div>
          )}
        </div>

        {/* Login/Register */}
        <div>
          <AuthForm onSuccess={onAuthSuccess} />
        </div>
      </div>
    </div>
  )
}

function AccountContent() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [justSignedIn, setJustSignedIn] = useState(false)
  const router = useRouter()
  const { refresh: refreshAuth } = useAuth()

  // Confirm the sign-in for a moment, then drop the customer on the home page —
  // they came to log in, not to sit on the account screen.
  const handleAuthSuccess = async () => {
    setJustSignedIn(true)
    await checkAuth()
    setTimeout(() => router.push('/'), 1400)
  }

  useEffect(() => {
    checkAuth()
  }, [])
  
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
    // Keep the app-wide auth context in step, so member prices switch over
    // immediately instead of waiting for a full page load.
    await refreshAuth()
  }
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      await refreshAuth()
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-10 h-10 border-2 border-[#4348AE] border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  if (user) {
    return <UserDashboard user={user} onLogout={handleLogout} />
  }

  return (
    <>
      {justSignedIn && <SignedInToast />}
      <GuestView onAuthSuccess={handleAuthSuccess} />
    </>
  )
}

/** Brief confirmation shown right after signing in. */
function SignedInToast() {
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-[100px] z-[70] flex justify-center px-4 pointer-events-none"
    >
      <div className="flex items-center gap-3 rounded-[14px] bg-[#22C55E] text-white px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span className="font-gilroy text-[15px] font-semibold">Ви увійшли в свій профіль</span>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      <section className="py-10 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[72px] xl:px-[100px]">
          <Suspense fallback={
            <div className="text-center py-20">
              <div className="animate-spin w-10 h-10 border-2 border-[#4348AE] border-t-transparent rounded-full mx-auto" />
            </div>
          }>
            <AccountContent />
          </Suspense>
        </div>
      </section>
      
      <Footer />
    </main>
  )
}
