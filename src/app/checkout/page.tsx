'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { MEMBER_DISCOUNT_LABEL, memberDiscountForLines } from '@/lib/memberDiscount'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'
import PhoneInput from '@/components/ui/PhoneInput'

type ShippingMethod = 'nova_poshta' | 'ukrposhta'
type PaymentMethod = 'platon' | 'card' | 'cash_on_delivery'

type City = {
  Ref: string
  SettlementRef?: string
  Description: string
  AreaDescription: string
}

type Street = { Ref: string; Description: string }

type Warehouse = {
  Ref: string
  Description: string
  Number: string
  TypeOfWarehouse: string
  CategoryOfWarehouse?: string // "Branch" | "Postomat"
}

// Nova Poshta delivery sub-type
type NpDeliveryType = 'branch' | 'postomat' | 'courier'

// Step indicator component
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'Контакти' },
    { num: 2, label: 'Доставка' },
    { num: 3, label: 'Оплата' },
  ]

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
      {steps.map((step, index) => (
        <div key={step.num} className="flex items-center">
          <div className={`flex items-center gap-2 ${currentStep >= step.num ? 'text-[#4348AE]' : 'text-[#999]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-semibold ${
              currentStep > step.num 
                ? 'bg-[#4348AE] text-white' 
                : currentStep === step.num 
                  ? 'bg-[#BCC2F4] text-[#4348AE]' 
                  : 'bg-[#E5E5E5] text-[#999]'
            }`}>
              {currentStep > step.num ? '✓' : step.num}
            </div>
            <span className="hidden sm:inline text-[14px] font-medium">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 sm:w-16 h-[2px] mx-2 ${currentStep > step.num ? 'bg-[#4348AE]' : 'bg-[#E5E5E5]'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart, giftMasks } = useCart()
  const { isMember } = useAuth()
  const [redirecting, setRedirecting] = useState(false)
  // Skin-test bundle promo (10% off) — activated from /skin-test "add full routine".
  const [promo, setPromo] = useState<string | null>(null)
  const [promoItems, setPromoItems] = useState<string[]>([])
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Contact info
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Shipping
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('nova_poshta')
  // Nova Poshta sub-type: branch (відділення) / postomat / courier (адресна доставка)
  const [npDeliveryType, setNpDeliveryType] = useState<NpDeliveryType>('branch')
  const [citySearch, setCitySearch] = useState('')
  const [cities, setCities] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [warehouseSearch, setWarehouseSearch] = useState('')
  const [address, setAddress] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false)
  // Nova Poshta courier address (street autocomplete + house number)
  const [streetSearch, setStreetSearch] = useState('')
  const [streets, setStreets] = useState<Street[]>([])
  const [selectedStreet, setSelectedStreet] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [apartment, setApartment] = useState('')
  const [showStreetDropdown, setShowStreetDropdown] = useState(false)

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery')
  const [notes, setNotes] = useState('')

  // Prefill contact fields from the logged-in user's profile (if any), so their
  // orders carry correct name/phone/email. Only fills empty fields — never
  // overwrites what the user is currently typing.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) return
        const { user } = await res.json()
        if (!user || cancelled) return
        if (user.first_name) setFirstName((v) => v || user.first_name)
        if (user.last_name) setLastName((v) => v || user.last_name)
        if (user.email) setEmail((v) => v || user.email)
        if (user.phone) setPhone((v) => v || user.phone)
      } catch {
        /* not logged in — leave fields empty */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Shipping cost
  // Free for carts over 2500 UAH; otherwise paid by the carrier's
  // tariff on receipt, so we don't add a fixed fee to the order total.
  // Pick up the skin-test promo flag + bundle items set when the routine was added.
  useEffect(() => {
    try {
      const p = localStorage.getItem('eonni_promo')
      const pi = localStorage.getItem('eonni_promo_items')
      if (p) setPromo(p)
      if (pi) setPromoItems(JSON.parse(pi))
    } catch {
      /* localStorage unavailable */
    }
  }, [])

  const freeShipping = subtotal >= 2500
  // Promo holds only while EVERY item from the test bundle is still in the cart.
  const cartIds = new Set(items.map((i) => i.product_id))
  const bundlePresent = promoItems.length > 0 && promoItems.every((id) => cartIds.has(id))
  const promoEligible = promo === 'SKINTEST10' && bundlePresent && subtotal > 0
  const promoDiscount = promoEligible ? Math.round(subtotal * 0.1) : 0

  // Registered-customer discount. Must mirror the order API exactly — that's what
  // decides the amount actually charged. The two discounts never stack.
  const memberDiscount = isMember
    ? memberDiscountForLines(items.map(i => ({ price: i.product?.sale_price, quantity: i.quantity })))
    : 0
  const memberApplied = memberDiscount >= promoDiscount && memberDiscount > 0
  const promoActive = promoEligible && !memberApplied && promoDiscount > 0
  const total = subtotal - Math.max(memberDiscount, promoDiscount)

  // Search cities (Nova Poshta API)
  useEffect(() => {
    if (citySearch.length < 2) {
      setCities([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/nova-poshta/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ search: citySearch }),
        })
        if (res.ok) {
          const data = await res.json()
          setCities(data.cities || [])
        }
      } catch (err) {
        console.error('Failed to search cities:', err)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [citySearch])

  // Load warehouses for the selected city — server-side search via Nova Poshta's
  // FindByString, debounced, so typing the first letters/number surfaces matches
  // across the WHOLE city (not a capped client-side list).
  useEffect(() => {
    if (!selectedCity || shippingMethod !== 'nova_poshta' || npDeliveryType === 'courier') {
      setWarehouses([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/nova-poshta/warehouses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cityRef: selectedCity.Ref, search: warehouseSearch }),
        })
        if (res.ok) {
          const data = await res.json()
          setWarehouses(data.warehouses || [])
        }
      } catch (err) {
        console.error('Failed to load warehouses:', err)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [selectedCity, shippingMethod, npDeliveryType, warehouseSearch])

  // Nova Poshta courier: street autocomplete for the selected settlement (debounced).
  useEffect(() => {
    if (
      !selectedCity?.SettlementRef ||
      shippingMethod !== 'nova_poshta' ||
      npDeliveryType !== 'courier' ||
      streetSearch.trim().length < 1
    ) {
      setStreets([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/nova-poshta/streets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settlementRef: selectedCity.SettlementRef, search: streetSearch }),
        })
        if (res.ok) {
          const data = await res.json()
          setStreets(data.streets || [])
        }
      } catch (err) {
        console.error('Failed to search streets:', err)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [selectedCity, shippingMethod, npDeliveryType, streetSearch])

  // Only split by type here — the text search is already done server-side.
  const filteredWarehouses = warehouses.filter(w =>
    npDeliveryType === 'postomat'
      ? w.CategoryOfWarehouse === 'Postomat'
      : w.CategoryOfWarehouse !== 'Postomat'
  )

  const validateStep1 = () => {
    if (!firstName.trim()) return 'Введіть ім\'я'
    if (!lastName.trim()) return 'Введіть прізвище'
    // Email is OPTIONAL — only validate the shape if the user typed something.
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Введіть коректний email'
    }
    // Ukrainian phone: +380 + 9 subscriber digits = 12 digits total.
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 12) return 'Введіть повний номер телефону'
    return null
  }

  const validateStep2 = () => {
    if (shippingMethod === 'nova_poshta') {
      if (!selectedCity) return 'Оберіть населений пункт'
      if (npDeliveryType === 'courier') {
        if (!selectedStreet.trim()) return 'Оберіть вулицю'
        if (!houseNumber.trim()) return 'Введіть номер будинку'
      } else if (!selectedWarehouse) {
        return npDeliveryType === 'postomat' ? 'Оберіть поштомат' : 'Оберіть відділення'
      }
    }
    if (shippingMethod === 'ukrposhta') {
      if (!address.trim() || address.split(',').length < 2) return 'Введіть місто та адресу'
    }
    return null
  }

  const handleNextStep = () => {
    setError(null)
    
    if (step === 1) {
      const err = validateStep1()
      if (err) {
        setError(err)
        return
      }
    } else if (step === 2) {
      const err = validateStep2()
      if (err) {
        setError(err)
        return
      }
    }
    
    setStep(step + 1)
  }

  const handleSubmitOrder = async () => {
    setError(null)
    setLoading(true)

    try {
      const orderData = {
        firstName,
        lastName,
        email,
        phone,
        shippingMethod,
        shippingCity: selectedCity?.Description || null,
        shippingWarehouse: selectedWarehouse?.Description || null,
        shippingAddress:
          shippingMethod === 'nova_poshta' && npDeliveryType === 'courier'
            ? `${selectedStreet}, буд. ${houseNumber}${apartment.trim() ? `, кв. ${apartment.trim()}` : ''}`
            : address || null,
        paymentMethod,
        promoCode: promoActive ? 'SKINTEST10' : null,
        notes,
        // Send ONLY product id + quantity. Server re-fetches prices and
        // computes the total — never trust client-supplied amounts.
        items: items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
        })),
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Помилка оформлення замовлення')
      }

      const { orderId } = await res.json()

      // Promo is single-use — clear it so it doesn't apply to a later order.
      if (promoActive) {
        try { localStorage.removeItem('eonni_promo') } catch { /* ignore */ }
      }

      // Online payment → hand off to Platon's hosted form. Do NOT clear the cart
      // first: clearing empties `items`, which flips this page to the "Кошик
      // порожній" view for a moment before the redirect. Show a redirect state
      // instead and clear the cart in the background as we navigate away.
      if (paymentMethod === 'platon') {
        setRedirecting(true)
        const payRes = await fetch('/api/platon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        })
        if (!payRes.ok) {
          setRedirecting(false)
          throw new Error('Не вдалося ініціювати онлайн-оплату. Спробуйте інший спосіб.')
        }
        const { endpoint, fields } = await payRes.json()
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = endpoint
        Object.entries(fields as Record<string, string>).forEach(([name, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = name
          input.value = String(value)
          form.appendChild(input)
        })
        document.body.appendChild(form)
        void clearCart() // best-effort; we're navigating away to Platon
        form.submit()
        return
      }

      // Offline methods (cash / bank transfer): clear cart and show success.
      await clearCart()
      router.push(`/orders/${orderId}/success`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (redirecting) {
    return (
      <main className="min-h-screen bg-[#E2F9FF]">
        <section className="py-20">
          <div className="max-w-[600px] mx-auto px-6 text-center">
            <div className="w-12 h-12 mx-auto mb-6 border-4 border-[#4348AE] border-t-transparent rounded-full animate-spin" />
            <h1 className="font-bebas text-[40px] text-black mb-3">Перенаправляємо на оплату…</h1>
            <p className="text-[#666]">Не закривайте сторінку — за мить відкриється захищена форма оплати Platon.</p>
          </div>
        </section>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#E2F9FF]">
        <section className="py-20">
          <div className="max-w-[600px] mx-auto px-6 text-center">
            <svg className="w-20 h-20 mx-auto text-[#BBBBBB] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h1 className="font-bebas text-[40px] text-black mb-4">Кошик порожній</h1>
            <p className="text-[#666] mb-8">Додайте товари до кошика, щоб оформити замовлення</p>
            <Link
              href="/catalog"
              className="inline-block px-10 py-4 bg-[#4348AE] text-white font-semibold rounded-lg hover:bg-[#373B8A] transition-colors"
            >
              Перейти до каталогу
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#E2F9FF]">
      <section className="py-8 sm:py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-[14px] text-[#666666] mb-6">
            <Link href="/" className="hover:text-[#4348AE] transition-colors">Головна</Link>
            <svg className="w-3.5 h-3.5 text-[#BBBBBB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            <Link href="/cart" className="hover:text-[#4348AE] transition-colors">Кошик</Link>
            <svg className="w-3.5 h-3.5 text-[#BBBBBB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            <span className="text-black font-medium">Оформлення замовлення</span>
          </nav>

          <h1 className="font-bebas uppercase text-black text-[40px] sm:text-[56px] leading-tight mb-8">
            Оформлення замовлення
          </h1>

          <StepIndicator currentStep={step} />

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[14px]">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Form */}
            <div className="flex-grow">
              <div className="bg-[#E2F9FF] rounded-[24px] p-6 sm:p-8 shadow-sm">
                {/* Step 1: Contact Info */}
                {step === 1 && (
                  <div>
                    <h2 className="font-bebas text-[28px] text-black mb-6">Контактна інформація</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[14px] text-[#666] mb-2">Ім'я *</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
                          placeholder="Ваше ім'я"
                        />
                      </div>
                      <div>
                        <label className="block text-[14px] text-[#666] mb-2">Прізвище *</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
                          placeholder="Ваше прізвище"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-[14px] text-[#666] mb-2">Email <span className="text-[#999]">(необов'язково)</span></label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-[14px] text-[#666] mb-2">Телефон *</label>
                      <PhoneInput value={phone} onChange={setPhone} required />
                    </div>

                    <button
                      onClick={handleNextStep}
                      className="mt-8 w-full sm:w-auto px-12 py-4 bg-[#4348AE] text-white font-semibold rounded-lg hover:bg-[#373B8A] transition-colors"
                    >
                      Продовжити
                    </button>
                  </div>
                )}

                {/* Step 2: Shipping */}
                {step === 2 && (
                  <div>
                    <h2 className="font-bebas text-[28px] text-black mb-6">Спосіб доставки</h2>

                    {/* Shipping Method Selection */}
                    <div className="space-y-3 mb-8">
                      {/* Nova Poshta */}
                      <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        shippingMethod === 'nova_poshta' ? 'border-[#4348AE] bg-[#F5F3FF]' : 'border-[#E5E5E5] hover:border-[#BBBBBB]'
                      }`}>
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'nova_poshta'}
                          onChange={() => {
                            setShippingMethod('nova_poshta')
                            setSelectedWarehouse(null)
                          }}
                          className="w-5 h-5 accent-[#4348AE]"
                        />
                        <Image src="/icons/nova-poshta.png" alt="Нова Пошта" width={500} height={179} className="flex-shrink-0 h-9 w-auto" />
                        <div className="flex-grow">
                          <p className="text-[13px] text-[#666]">Відділення або поштомат</p>
                        </div>
                        <span className="text-[14px] text-[#666]">
                          {subtotal >= 2500 ? 'Безкоштовно' : 'За тарифами перевізника'}
                        </span>
                      </label>

                      {/* Ukrposhta */}
                      <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        shippingMethod === 'ukrposhta' ? 'border-[#4348AE] bg-[#F5F3FF]' : 'border-[#E5E5E5] hover:border-[#BBBBBB]'
                      }`}>
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'ukrposhta'}
                          onChange={() => {
                            setShippingMethod('ukrposhta')
                            setSelectedWarehouse(null)
                          }}
                          className="w-5 h-5 accent-[#4348AE]"
                        />
                        <Image src="/icons/ukrposhta.svg" alt="Укрпошта" width={136} height={24} unoptimized className="flex-shrink-0 h-6 w-auto" />
                        <div className="flex-grow">
                          <p className="text-[13px] text-[#666]">Відділення</p>
                        </div>
                        <span className="text-[14px] text-[#666]">
                          {subtotal >= 2500 ? 'Безкоштовно' : 'За тарифами перевізника'}
                        </span>
                      </label>
                    </div>

                    {/* City & Warehouse/Address Selection */}
                    <div className="space-y-4">
                        {/* Nova Poshta: delivery type → settlement → warehouse / postomat / address */}
                        {shippingMethod === 'nova_poshta' && (
                          <>
                            {/* Delivery type */}
                            <div>
                              <label className="block text-[14px] text-[#666] mb-2">Тип доставки *</label>
                              <div className="grid grid-cols-3 gap-2">
                                {([
                                  { v: 'branch', label: 'Відділення' },
                                  { v: 'postomat', label: 'Поштомат' },
                                  { v: 'courier', label: "Кур'єр" },
                                ] as const).map((opt) => (
                                  <button
                                    key={opt.v}
                                    type="button"
                                    onClick={() => {
                                      setNpDeliveryType(opt.v)
                                      setSelectedWarehouse(null)
                                      setWarehouseSearch('')
                                      setAddress('')
                                      setSelectedStreet('')
                                      setStreetSearch('')
                                      setHouseNumber('')
                                      setApartment('')
                                    }}
                                    className={`h-[44px] px-2 rounded-lg border text-[14px] font-gilroy transition-colors ${
                                      npDeliveryType === opt.v
                                        ? 'border-[#4348AE] bg-[#F5F3FF] text-[#4348AE] font-semibold'
                                        : 'border-[#BBBBBB] text-black hover:border-[#999]'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Settlement */}
                            <div className="relative">
                              <label className="block text-[14px] text-[#666] mb-2">Населений пункт *</label>
                              <input
                                type="text"
                                value={selectedCity ? selectedCity.Description : citySearch}
                                onChange={(e) => {
                                  setCitySearch(e.target.value)
                                  setSelectedCity(null)
                                  setSelectedWarehouse(null)
                                  setSelectedStreet('')
                                  setStreetSearch('')
                                  setHouseNumber('')
                                  setApartment('')
                                  setShowCityDropdown(true)
                                }}
                                onFocus={() => setShowCityDropdown(true)}
                                className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
                                placeholder="Почніть вводити назву населеного пункту"
                              />
                              {showCityDropdown && cities.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-[#E2F9FF] border border-[#E5E5E5] rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                                  {cities.map((city) => (
                                    <button
                                      key={city.Ref}
                                      type="button"
                                      onClick={() => {
                                        setSelectedCity(city)
                                        setCitySearch('')
                                        setShowCityDropdown(false)
                                      }}
                                      className="w-full px-4 py-3 text-left hover:bg-[#F8F7FB] transition-colors"
                                    >
                                      <span className="font-medium">{city.Description}</span>
                                      <span className="text-[13px] text-[#666] ml-2">{city.AreaDescription} обл.</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Branch / Postomat selection */}
                            {selectedCity && npDeliveryType !== 'courier' && (
                              <div className="relative">
                                <label className="block text-[14px] text-[#666] mb-2">
                                  {npDeliveryType === 'postomat' ? 'Поштомат *' : 'Відділення *'}
                                </label>
                                <input
                                  type="text"
                                  value={selectedWarehouse ? selectedWarehouse.Description : warehouseSearch}
                                  onChange={(e) => {
                                    setWarehouseSearch(e.target.value)
                                    setSelectedWarehouse(null)
                                    setShowWarehouseDropdown(true)
                                  }}
                                  onFocus={() => setShowWarehouseDropdown(true)}
                                  className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
                                  placeholder={npDeliveryType === 'postomat' ? 'Оберіть поштомат або введіть номер' : 'Оберіть відділення або введіть номер'}
                                />
                                {showWarehouseDropdown && filteredWarehouses.length > 0 && (
                                  <div className="absolute z-10 w-full mt-1 bg-[#E2F9FF] border border-[#E5E5E5] rounded-lg shadow-lg max-h-[250px] overflow-y-auto">
                                    {filteredWarehouses.map((warehouse) => (
                                      <button
                                        key={warehouse.Ref}
                                        type="button"
                                        onClick={() => {
                                          setSelectedWarehouse(warehouse)
                                          setWarehouseSearch('')
                                          setShowWarehouseDropdown(false)
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-[#F8F7FB] transition-colors border-b border-[#F0F0F0] last:border-0"
                                      >
                                        <span className="text-[14px]">{warehouse.Description}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {showWarehouseDropdown && warehouseSearch && filteredWarehouses.length === 0 && (
                                  <p className="mt-2 text-[13px] text-[#999]">Нічого не знайдено за цим запитом.</p>
                                )}
                              </div>
                            )}

                            {/* Courier: street autocomplete + house number */}
                            {selectedCity && npDeliveryType === 'courier' && (
                              <>
                                <div className="relative">
                                  <label className="block text-[14px] text-[#666] mb-2">Вулиця *</label>
                                  <input
                                    type="text"
                                    value={selectedStreet || streetSearch}
                                    onChange={(e) => {
                                      setStreetSearch(e.target.value)
                                      setSelectedStreet('')
                                      setShowStreetDropdown(true)
                                    }}
                                    onFocus={() => setShowStreetDropdown(true)}
                                    className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
                                    placeholder="Почніть вводити назву вулиці"
                                  />
                                  {showStreetDropdown && streets.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-[#E2F9FF] border border-[#E5E5E5] rounded-lg shadow-lg max-h-[250px] overflow-y-auto">
                                      {streets.map((street) => (
                                        <button
                                          key={street.Ref}
                                          type="button"
                                          onClick={() => {
                                            setSelectedStreet(street.Description)
                                            setStreetSearch('')
                                            setShowStreetDropdown(false)
                                          }}
                                          className="w-full px-4 py-3 text-left hover:bg-[#F8F7FB] transition-colors border-b border-[#F0F0F0] last:border-0"
                                        >
                                          <span className="text-[14px]">{street.Description}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[14px] text-[#666] mb-2">Будинок *</label>
                                    <input
                                      type="text"
                                      value={houseNumber}
                                      onChange={(e) => setHouseNumber(e.target.value)}
                                      className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
                                      placeholder="12А"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[14px] text-[#666] mb-2">Кв. <span className="text-[#999]">(необов'язково)</span></label>
                                    <input
                                      type="text"
                                      value={apartment}
                                      onChange={(e) => setApartment(e.target.value)}
                                      className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
                                      placeholder="5"
                                    />
                                  </div>
                                </div>
                                <p className="mt-2 text-[13px] text-[#999]">Кур&apos;єр Нової Пошти привезе замовлення за вказаною адресою.</p>
                              </>
                            )}
                          </>
                        )}

                        {/* Address for Ukrposhta */}
                        {shippingMethod === 'ukrposhta' && (
                          <>
                            <div>
                              <label className="block text-[14px] text-[#666] mb-2">Місто *</label>
                              <input
                                type="text"
                                value={address.split(',')[0] || ''}
                                onChange={(e) => {
                                  const parts = address.split(',')
                                  parts[0] = e.target.value
                                  setAddress(parts.join(','))
                                }}
                                className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
                                placeholder="Введіть назву міста"
                              />
                            </div>
                            <div>
                              <label className="block text-[14px] text-[#666] mb-2">Адреса відділення або індекс *</label>
                              <input
                                type="text"
                                value={address.split(',').slice(1).join(',').trim() || ''}
                                onChange={(e) => {
                                  const city = address.split(',')[0] || ''
                                  setAddress(city ? `${city}, ${e.target.value}` : e.target.value)
                                }}
                                className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors"
                                placeholder="Вул. Хрещатик, 1 або індекс 01001"
                              />
                            </div>
                            <p className="text-[13px] text-[#999]">
                              Вкажіть адресу найближчого відділення Укрпошти або поштовий індекс для доставки
                            </p>
                          </>
                        )}
                    </div>

                    <div className="mt-8 flex gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="px-8 py-4 border border-[#BBBBBB] text-black rounded-lg hover:bg-[#F8F7FB] transition-colors"
                      >
                        Назад
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="flex-grow sm:flex-grow-0 px-12 py-4 bg-[#4348AE] text-white font-semibold rounded-lg hover:bg-[#373B8A] transition-colors"
                      >
                        Продовжити
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <div>
                    <h2 className="font-bebas text-[28px] text-black mb-6">Спосіб оплати</h2>

                    <div className="space-y-3 mb-8">
                      {/* Cash on Delivery */}
                      <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'cash_on_delivery' ? 'border-[#4348AE] bg-[#F5F3FF]' : 'border-[#E5E5E5] hover:border-[#BBBBBB]'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'cash_on_delivery'}
                          onChange={() => setPaymentMethod('cash_on_delivery')}
                          className="w-5 h-5 accent-[#4348AE]"
                        />
                        <div className="w-10 h-10 bg-[#FEF3C7] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-[#B45309]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">Накладний платіж</p>
                          <p className="text-[13px] text-[#666]">Оплата при отриманні</p>
                        </div>
                      </label>

                      {/* Platon — hosted form: card / Apple Pay / Google Pay / Privat24 / installments */}
                      <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'platon' ? 'border-[#4348AE] bg-[#F5F3FF]' : 'border-[#E5E5E5] hover:border-[#BBBBBB]'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'platon'}
                          onChange={() => setPaymentMethod('platon')}
                          className="w-5 h-5 accent-[#4348AE]"
                        />
                        <span className="text-[28px] flex-shrink-0 leading-none">💳</span>
                        <div className="flex-grow">
                          <p className="font-medium">Оплата карткою онлайн</p>
                          <p className="text-[13px] text-[#666]">Visa, Mastercard, Apple Pay, Google Pay, Privat24, оплата частинами</p>
                        </div>
                      </label>

                      {/* Card */}
                      <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'card' ? 'border-[#4348AE] bg-[#F5F3FF]' : 'border-[#E5E5E5] hover:border-[#BBBBBB]'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="w-5 h-5 accent-[#4348AE]"
                        />
                        <div className="w-10 h-10 bg-[#E2F9FF] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-[#1D4ED8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">Оплата на картку</p>
                          <p className="text-[13px] text-[#666]">Переказ на картку ПриватБанку</p>
                        </div>
                      </label>
                    </div>

                    {/* Notes */}
                    <div className="mb-8">
                      <label className="block text-[14px] text-[#666] mb-2">Коментар до замовлення</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#4348AE] transition-colors resize-none"
                        placeholder="Додаткова інформація..."
                      />
                    </div>

                    <div className="mt-8 flex gap-4">
                      <button
                        onClick={() => setStep(2)}
                        className="px-8 py-4 border border-[#BBBBBB] text-black rounded-lg hover:bg-[#F8F7FB] transition-colors"
                      >
                        Назад
                      </button>
                      <button
                        onClick={handleSubmitOrder}
                        disabled={loading}
                        className="flex-grow sm:flex-grow-0 px-12 py-4 bg-[#4348AE] text-white font-semibold rounded-lg hover:bg-[#373B8A] transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Оформлення...' : 'Підтвердити замовлення'}
                      </button>
                </div>
                </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-[380px] flex-shrink-0">
              <div className="bg-[#E2F9FF] rounded-[24px] p-6 shadow-sm sticky top-28">
                <h3 className="font-bebas text-[24px] text-black mb-4">Ваше замовлення</h3>

                {/* Items */}
                <div className="max-h-[250px] overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 py-3 border-b border-[#F0F0F0] last:border-0">
                      <div className="relative w-[50px] h-[50px] bg-[#F8F7FB] rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.image_url && (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#4348AE] text-white text-[11px] rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-[13px] text-black line-clamp-2">{item.product?.name}</p>
                        <p className="text-[13px] font-medium mt-1">₴{((item.product?.sale_price || 0) * item.quantity).toFixed(0)}</p>
                      </div>
                    </div>
                  ))}

                  {/* Gift masks (free) */}
                  {giftMasks.map((g) => (
                    <div key={`gift-${g.seq}`} className="flex gap-3 py-3 border-b border-[#F0F0F0] last:border-0">
                      <div className="relative w-[50px] h-[50px] bg-white rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-[#FFD6E6]">
                        <Image src={g.image} alt={g.name} fill className="object-cover" sizes="50px" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-[13px] text-black line-clamp-2">{g.name}</p>
                        <p className="text-[12px] font-semibold text-[#E84A8A] mt-1">Подарунок · ₴0</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 py-4 border-t border-[#E5E5E5]">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#666]">Товари</span>
                    <span>₴{subtotal.toFixed(0)}</span>
                  </div>
                  {memberApplied && (
                    <div className="flex justify-between text-[14px] font-semibold text-[#E84A8A]">
                      <span>{MEMBER_DISCOUNT_LABEL}</span>
                      <span>−₴{memberDiscount.toFixed(0)}</span>
                    </div>
                  )}
                  {promoActive && (
                    <div className="flex justify-between text-[14px] font-semibold text-[#E84A8A]">
                      <span>Знижка за тест шкіри −10%</span>
                      <span>−₴{promoDiscount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#666]">Доставка</span>
                    <span>{freeShipping ? <span className="text-[#059669]">Безкоштовно</span> : <span className="text-[#666]">За тарифами перевізника</span>}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#E5E5E5]">
                  <span className="font-medium">Разом:</span>
                  <span className="font-bebas text-[28px]">₴{total.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
