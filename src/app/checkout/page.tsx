'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import Link from 'next/link'

type ShippingMethod = 'nova_poshta' | 'ukrposhta' | 'pickup'
type PaymentMethod = 'liqpay' | 'card' | 'cash_on_delivery' | 'bank_transfer'

type City = {
  Ref: string
  Description: string
  AreaDescription: string
}

type Warehouse = {
  Ref: string
  Description: string
  Number: string
  TypeOfWarehouse: string
}

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
          <div className={`flex items-center gap-2 ${currentStep >= step.num ? 'text-[#6046A3]' : 'text-[#999]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-semibold ${
              currentStep > step.num 
                ? 'bg-[#6046A3] text-white' 
                : currentStep === step.num 
                  ? 'bg-[#BCC2F4] text-[#6046A3]' 
                  : 'bg-[#E5E5E5] text-[#999]'
            }`}>
              {currentStep > step.num ? '✓' : step.num}
            </div>
            <span className="hidden sm:inline text-[14px] font-medium">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 sm:w-16 h-[2px] mx-2 ${currentStep > step.num ? 'bg-[#6046A3]' : 'bg-[#E5E5E5]'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
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
  const [citySearch, setCitySearch] = useState('')
  const [cities, setCities] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [warehouseSearch, setWarehouseSearch] = useState('')
  const [address, setAddress] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false)

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery')
  const [notes, setNotes] = useState('')

  // Shipping cost
  const shippingCost = shippingMethod === 'pickup' ? 0 : subtotal >= 1500 ? 0 : 70
  const total = subtotal + shippingCost

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

  // Load warehouses when city is selected (only for Nova Poshta)
  useEffect(() => {
    if (!selectedCity || shippingMethod !== 'nova_poshta') {
      setWarehouses([])
      return
    }

    const loadWarehouses = async () => {
      try {
        const res = await fetch('/api/nova-poshta/warehouses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cityRef: selectedCity.Ref,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setWarehouses(data.warehouses || [])
        }
      } catch (err) {
        console.error('Failed to load warehouses:', err)
      }
    }

    loadWarehouses()
  }, [selectedCity, shippingMethod])

  // Filter warehouses by search
  const filteredWarehouses = warehouses.filter(w => 
    w.Description.toLowerCase().includes(warehouseSearch.toLowerCase()) ||
    w.Number.includes(warehouseSearch)
  )

  const validateStep1 = () => {
    if (!firstName.trim()) return 'Введіть ім\'я'
    if (!lastName.trim()) return 'Введіть прізвище'
    if (!email.trim() || !email.includes('@')) return 'Введіть коректний email'
    if (!phone.trim() || phone.length < 10) return 'Введіть коректний номер телефону'
    return null
  }

  const validateStep2 = () => {
    if (shippingMethod === 'pickup') return null
    if (shippingMethod === 'nova_poshta') {
      if (!selectedCity) return 'Оберіть місто'
      if (!selectedWarehouse) return 'Оберіть відділення'
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
        shippingAddress: address || null,
        paymentMethod,
        notes,
        items: items.map(item => ({
          productId: item.product_id,
          productName: item.product?.name || '',
          productImage: item.product?.image_url || null,
          quantity: item.quantity,
          price: item.product?.sale_price || 0,
        })),
        totalAmount: total,
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

      // Clear cart
      await clearCart()

      // Redirect to success page
      router.push(`/orders/${orderId}/success`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <section className="py-20">
          <div className="max-w-[600px] mx-auto px-6 text-center">
            <svg className="w-20 h-20 mx-auto text-[#BBBBBB] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h1 className="font-bebas text-[40px] text-black mb-4">Кошик порожній</h1>
            <p className="text-[#666] mb-8">Додайте товари до кошика, щоб оформити замовлення</p>
            <Link
              href="/catalog"
              className="inline-block px-10 py-4 bg-[#6046A3] text-white font-semibold rounded-lg hover:bg-[#4D3882] transition-colors"
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
    <main className="min-h-screen bg-[#F8F7FB]">
      <section className="py-8 sm:py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Breadcrumbs */}
          <nav className="text-[14px] text-[#666666] mb-6">
            <Link href="/" className="hover:underline">Головна</Link>
            {' > '}
            <Link href="/cart" className="hover:underline">Кошик</Link>
            {' > '}
            <span className="text-black">Оформлення замовлення</span>
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
              <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm">
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
                          className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#6046A3] transition-colors"
                          placeholder="Ваше ім'я"
                        />
                      </div>
                      <div>
                        <label className="block text-[14px] text-[#666] mb-2">Прізвище *</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#6046A3] transition-colors"
                          placeholder="Ваше прізвище"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-[14px] text-[#666] mb-2">Email *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#6046A3] transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-[14px] text-[#666] mb-2">Телефон *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#6046A3] transition-colors"
                        placeholder="+380 XX XXX XX XX"
                      />
                    </div>

                    <button
                      onClick={handleNextStep}
                      className="mt-8 w-full sm:w-auto px-12 py-4 bg-[#6046A3] text-white font-semibold rounded-lg hover:bg-[#4D3882] transition-colors"
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
                        shippingMethod === 'nova_poshta' ? 'border-[#6046A3] bg-[#F5F3FF]' : 'border-[#E5E5E5] hover:border-[#BBBBBB]'
                      }`}>
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'nova_poshta'}
                          onChange={() => {
                            setShippingMethod('nova_poshta')
                            setSelectedWarehouse(null)
                          }}
                          className="w-5 h-5 accent-[#6046A3]"
                        />
                        <Image src="/icons/nova-poshta.svg" alt="Нова Пошта" width={40} height={40} className="flex-shrink-0" />
                        <div className="flex-grow">
                          <p className="font-medium">Нова Пошта</p>
                          <p className="text-[13px] text-[#666]">Відділення або поштомат</p>
                        </div>
                        <span className="text-[14px] text-[#666]">
                          {subtotal >= 1500 ? 'Безкоштовно' : 'від ₴70'}
                        </span>
                      </label>

                      {/* Ukrposhta */}
                      <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        shippingMethod === 'ukrposhta' ? 'border-[#6046A3] bg-[#F5F3FF]' : 'border-[#E5E5E5] hover:border-[#BBBBBB]'
                      }`}>
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'ukrposhta'}
                          onChange={() => {
                            setShippingMethod('ukrposhta')
                            setSelectedWarehouse(null)
                          }}
                          className="w-5 h-5 accent-[#6046A3]"
                        />
                        <Image src="/icons/ukrposhta.svg" alt="Укрпошта" width={40} height={40} className="flex-shrink-0" />
                        <div className="flex-grow">
                          <p className="font-medium">Укрпошта</p>
                          <p className="text-[13px] text-[#666]">Відділення</p>
                        </div>
                        <span className="text-[14px] text-[#666]">
                          {subtotal >= 1500 ? 'Безкоштовно' : 'від ₴50'}
                        </span>
                      </label>

                      {/* Pickup */}
                      <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        shippingMethod === 'pickup' ? 'border-[#6046A3] bg-[#F5F3FF]' : 'border-[#E5E5E5] hover:border-[#BBBBBB]'
                      }`}>
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'pickup'}
                          onChange={() => setShippingMethod('pickup')}
                          className="w-5 h-5 accent-[#6046A3]"
                        />
                        <div className="w-10 h-10 bg-[#F0F0F0] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">Самовивіз</p>
                          <p className="text-[13px] text-[#666]">Київ, вул. Левка Лук'яненка, 21</p>
                        </div>
                        <span className="text-[14px] text-[#059669] font-medium">Безкоштовно</span>
                      </label>
                    </div>

                    {/* City & Warehouse/Address Selection */}
                    {shippingMethod !== 'pickup' && (
                      <div className="space-y-4">
                        {/* City Search (for Nova Poshta) */}
                        {shippingMethod === 'nova_poshta' && (
                          <>
                            <div className="relative">
                              <label className="block text-[14px] text-[#666] mb-2">Місто *</label>
                              <input
                                type="text"
                                value={selectedCity ? selectedCity.Description : citySearch}
                                onChange={(e) => {
                                  setCitySearch(e.target.value)
                                  setSelectedCity(null)
                                  setSelectedWarehouse(null)
                                  setShowCityDropdown(true)
                                }}
                                onFocus={() => setShowCityDropdown(true)}
                                className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#6046A3] transition-colors"
                                placeholder="Почніть вводити назву міста"
                              />
                              
                              {showCityDropdown && cities.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
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

                            {/* Warehouse Selection */}
                            {selectedCity && (
                              <div className="relative">
                                <label className="block text-[14px] text-[#666] mb-2">
                                  Відділення / Поштомат *
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
                                  className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#6046A3] transition-colors"
                                  placeholder="Оберіть відділення"
                                />
                                
                                {showWarehouseDropdown && filteredWarehouses.length > 0 && (
                                  <div className="absolute z-10 w-full mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg max-h-[250px] overflow-y-auto">
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
                              </div>
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
                                className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#6046A3] transition-colors"
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
                                className="w-full h-[50px] px-4 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#6046A3] transition-colors"
                                placeholder="Вул. Хрещатик, 1 або індекс 01001"
                              />
                            </div>
                            <p className="text-[13px] text-[#999]">
                              Вкажіть адресу найближчого відділення Укрпошти або поштовий індекс для доставки
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    <div className="mt-8 flex gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="px-8 py-4 border border-[#BBBBBB] text-black rounded-lg hover:bg-[#F8F7FB] transition-colors"
                      >
                        Назад
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="flex-grow sm:flex-grow-0 px-12 py-4 bg-[#6046A3] text-white font-semibold rounded-lg hover:bg-[#4D3882] transition-colors"
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
                        paymentMethod === 'cash_on_delivery' ? 'border-[#6046A3] bg-[#F5F3FF]' : 'border-[#E5E5E5] hover:border-[#BBBBBB]'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'cash_on_delivery'}
                          onChange={() => setPaymentMethod('cash_on_delivery')}
                          className="w-5 h-5 accent-[#6046A3]"
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

                      {/* LiqPay */}
                      <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'liqpay' ? 'border-[#6046A3] bg-[#F5F3FF]' : 'border-[#E5E5E5] hover:border-[#BBBBBB]'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'liqpay'}
                          onChange={() => setPaymentMethod('liqpay')}
                          className="w-5 h-5 accent-[#6046A3]"
                        />
                        <Image src="/icons/liqpay.svg" alt="LiqPay" width={40} height={40} className="flex-shrink-0" />
                        <div className="flex-grow">
                          <p className="font-medium">LiqPay</p>
                          <p className="text-[13px] text-[#666]">Visa, Mastercard, Apple Pay, Google Pay</p>
                        </div>
                      </label>

                      {/* Card */}
                      <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'card' ? 'border-[#6046A3] bg-[#F5F3FF]' : 'border-[#E5E5E5] hover:border-[#BBBBBB]'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="w-5 h-5 accent-[#6046A3]"
                        />
                        <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-[#1D4ED8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">Оплата на картку</p>
                          <p className="text-[13px] text-[#666]">Переказ на картку ПриватБанку</p>
                        </div>
                      </label>

                      {/* Bank Transfer */}
                      <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'bank_transfer' ? 'border-[#6046A3] bg-[#F5F3FF]' : 'border-[#E5E5E5] hover:border-[#BBBBBB]'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={() => setPaymentMethod('bank_transfer')}
                          className="w-5 h-5 accent-[#6046A3]"
                        />
                        <div className="w-10 h-10 bg-[#D1FAE5] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">Безготівковий розрахунок</p>
                          <p className="text-[13px] text-[#666]">Для юридичних осіб</p>
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
                        className="w-full px-4 py-3 border border-[#BBBBBB] rounded-lg font-gilroy text-[16px] outline-none focus:border-[#6046A3] transition-colors resize-none"
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
                        className="flex-grow sm:flex-grow-0 px-12 py-4 bg-[#6046A3] text-white font-semibold rounded-lg hover:bg-[#4D3882] transition-colors disabled:opacity-50"
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
              <div className="bg-white rounded-[24px] p-6 shadow-sm sticky top-28">
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
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#6046A3] text-white text-[11px] rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-[13px] text-black line-clamp-2">{item.product?.name}</p>
                        <p className="text-[13px] font-medium mt-1">₴{((item.product?.sale_price || 0) * item.quantity).toFixed(0)}</p>
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
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#666]">Доставка</span>
                    <span>{shippingCost === 0 ? <span className="text-[#059669]">Безкоштовно</span> : `₴${shippingCost}`}</span>
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
