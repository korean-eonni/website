'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'

type Order = {
  id: string
  status: string
  total_amount: number
  shipping_method: string
  shipping_city: string | null
  shipping_warehouse: string | null
  payment_method: string
  payment_status: string
  first_name: string
  last_name: string
  phone: string
  email: string
  created_at: string
}

type OrderItem = {
  id: string
  product_name: string
  product_image: string | null
  quantity: number
  price: number
}

export default function OrderSuccessPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data.order)
          setItems(data.items || [])
        }
      } catch (error) {
        console.error('Failed to fetch order:', error)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const paymentMethodLabels: Record<string, string> = {
    cash_on_delivery: 'Накладний платіж',
    platon: 'Оплата карткою онлайн',
    card: 'Оплата на картку',
    bank_transfer: 'Безготівковий розрахунок',
  }

  const shippingMethodLabels: Record<string, string> = {
    nova_poshta: 'Нова Пошта',
    ukrposhta: 'Укрпошта',
  }

  return (
    <main className="min-h-screen bg-[#F8F7FB]">
      <section className="py-12 sm:py-20">
        <div className="max-w-[800px] mx-auto px-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-10 h-10 border-2 border-[#6046A3] border-t-transparent rounded-full mx-auto" />
            </div>
          ) : !order ? (
            <div className="text-center py-20">
              <h1 className="font-bebas text-[40px] text-black mb-4">Замовлення не знайдено</h1>
              <Link href="/" className="text-[#6046A3] hover:underline">
                Повернутися на головну
              </Link>
            </div>
          ) : (
            <>
              {/* Success Header */}
              <div className="text-center mb-10">
                <div className="w-20 h-20 mx-auto mb-6 bg-[#D1FAE5] rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="font-bebas text-[48px] sm:text-[56px] text-black mb-4">
                  Дякуємо за замовлення!
                </h1>
                <p className="text-[18px] text-[#666] max-w-md mx-auto">
                  Ваше замовлення #{order.id} успішно оформлено. Ми надішлемо підтвердження на {order.email}
                </p>
              </div>

              {/* Order Details */}
              <div className="bg-[#E2F9FF] rounded-[24px] p-6 sm:p-8 shadow-sm mb-6">
                <h2 className="font-bebas text-[28px] text-black mb-6">Деталі замовлення</h2>

                {/* Items */}
                <div className="space-y-4 mb-6 pb-6 border-b border-[#E5E5E5]">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-[60px] h-[60px] bg-[#F8F7FB] rounded-lg overflow-hidden flex-shrink-0">
                        {item.product_image && (
                          <Image
                            src={item.product_image}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="text-[14px] text-black">{item.product_name}</p>
                        <p className="text-[13px] text-[#666]">Кількість: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₴{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-[14px] text-[#999] uppercase tracking-wider mb-3">Доставка</h3>
                    <p className="font-medium">{shippingMethodLabels[order.shipping_method] || order.shipping_method}</p>
                    {order.shipping_city && <p className="text-[14px] text-[#666] mt-1">{order.shipping_city}</p>}
                    {order.shipping_warehouse && <p className="text-[14px] text-[#666]">{order.shipping_warehouse}</p>}
                  </div>
                  <div>
                    <h3 className="text-[14px] text-[#999] uppercase tracking-wider mb-3">Оплата</h3>
                    <p className="font-medium">{paymentMethodLabels[order.payment_method] || order.payment_method}</p>
                    {order.payment_method === 'card' && (
                      <div className="mt-3 p-3 bg-[#FEF3C7] rounded-lg">
                        <p className="text-[13px] text-[#B45309]">
                          Реквізити для оплати будуть надіслані на ваш email
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="mt-6 pt-6 border-t border-[#E5E5E5] flex justify-between items-center">
                  <span className="text-[18px] font-medium">Загальна сума:</span>
                  <span className="font-bebas text-[32px]">₴{order.total_amount.toFixed(0)}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-[#E2F9FF] rounded-[24px] p-6 sm:p-8 shadow-sm mb-6">
                <h2 className="font-bebas text-[28px] text-black mb-6">Контактна інформація</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[14px] text-[#999]">Отримувач</p>
                    <p className="font-medium">{order.first_name} {order.last_name}</p>
                  </div>
                  <div>
                    <p className="text-[14px] text-[#999]">Телефон</p>
                    <p className="font-medium">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-[14px] text-[#999]">Email</p>
                    <p className="font-medium">{order.email}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/catalog"
                  className="px-8 py-4 bg-[#6046A3] text-white text-center font-semibold rounded-lg hover:bg-[#4D3882] transition-colors"
                >
                  Продовжити покупки
                </Link>
                <Link
                  href="/account"
                  className="px-8 py-4 border border-[#6046A3] text-[#6046A3] text-center font-semibold rounded-lg hover:bg-[#F5F3FF] transition-colors"
                >
                  Мої замовлення
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

