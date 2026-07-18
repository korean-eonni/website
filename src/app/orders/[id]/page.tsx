'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'

type Order = {
  id: string
  user_id: string | null
  status: string
  total_amount: number
  shipping_method: string
  shipping_city: string | null
  shipping_warehouse: string | null
  shipping_address: string | null
  payment_method: string
  payment_status: string
  first_name: string
  last_name: string
  phone: string
  email: string
  notes: string | null
  tracking_number: string | null
  created_at: string
}

type OrderItem = {
  id: string
  product_name: string
  product_image: string | null
  quantity: number
  price: number
}

type Shipment = {
  trackingNumber: string | null
  status: string | null
  scheduledDeliveryDate: string | null
  actualDeliveryDate: string | null
  trackingCompleted: boolean
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Очікує підтвердження', color: '#B45309', bg: '#FEF3C7' },
  confirmed: { label: 'Підтверджено', color: '#1D4ED8', bg: '#E2F9FF' },
  processing: { label: 'Обробляється', color: '#7C3AED', bg: '#EDE9FE' },
  shipped: { label: 'Відправлено', color: '#0891B2', bg: '#E2F9FF' },
  delivered: { label: 'Доставлено', color: '#059669', bg: '#D1FAE5' },
  cancelled: { label: 'Скасовано', color: '#DC2626', bg: '#FEE2E2' },
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: 'Накладений платіж (оплата при отриманні)',
  platon: 'Оплата карткою онлайн',
  card: 'Переказ на картку',
}
const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Очікує оплати', color: '#B45309', bg: '#FEF3C7' },
  paid: { label: 'Оплачено', color: '#059669', bg: '#D1FAE5' },
  failed: { label: 'Помилка оплати', color: '#DC2626', bg: '#FEE2E2' },
  refunded: { label: 'Повернено', color: '#666', bg: '#F1F1F1' },
}
const SHIPPING_LABELS: Record<string, string> = {
  nova_poshta: 'Нова Пошта',
  ukrposhta: 'Укрпошта',
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [me, setMe] = useState<{
    id: string
    first_name: string | null
    last_name: string | null
    phone: string | null
    email: string
  } | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const accessToken = new URLSearchParams(window.location.search).get('token')
        const tokenQuery = accessToken ? `?token=${encodeURIComponent(accessToken)}` : ''
        const res = await fetch(`/api/orders/${orderId}${tokenQuery}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        })
        if (res.status === 401) {
          setUnauthorized(true)
          return
        }
        if (res.ok) {
          const data = await res.json()
          setOrder(data.order)
          setItems(data.items || [])
          setShipment(data.shipment || null)
        }
      } catch (error) {
        console.error('Failed to fetch order:', error)
      } finally {
        setLoading(false)
      }
    }
    // Who is viewing — so we can show the account holder's own profile details
    // for their own orders instead of whatever was typed at checkout.
    const fetchMe = async () => {
      try {
        const r = await fetch('/api/auth/me')
        if (r.ok) setMe((await r.json()).user || null)
      } catch {
        /* not logged in — ignore */
      }
    }
    if (orderId) {
      fetchOrder()
      fetchMe()
    }
  }, [orderId])

  const status = order ? STATUS_CONFIG[order.status] || STATUS_CONFIG.pending : null
  const payStatus = order
    ? PAYMENT_STATUS_CONFIG[order.payment_status] || PAYMENT_STATUS_CONFIG.pending
    : null
  const shipLine = order
    ? [order.shipping_city, order.shipping_warehouse || order.shipping_address].filter(Boolean).join(', ')
    : ''
  const itemsTotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0)

  // "Отримувач" always shows what was actually entered at checkout for THIS
  // order (so a gift/other-recipient order shows that person's details).
  const recipientName = order ? `${order.first_name} ${order.last_name}`.trim() : ''
  const recipientPhone = order?.phone || ''
  const recipientEmail = order?.email || ''

  // The viewer owns this order if it's linked to their account OR was placed
  // as a guest with their account email (same rule as in "Мої замовлення").
  const isOwner = !!(
    order &&
    me &&
    ((order.user_id && order.user_id === me.id) ||
      (order.email && me.email && order.email.toLowerCase() === me.email.toLowerCase()))
  )
  // For your own orders, additionally show your account details when they
  // differ from what was entered (e.g. ordered for someone else, or stray
  // input in old orders).
  const accountName = me ? `${me.first_name || ''} ${me.last_name || ''}`.trim() : ''
  const accountPhone = me?.phone || ''
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
  const normPhone = (s: string) => (s || '').replace(/\D/g, '')
  const showAccountInfo = !!(
    isOwner &&
    (norm(accountName) !== norm(recipientName) ||
      (accountPhone && normPhone(accountPhone) !== normPhone(recipientPhone)))
  )

  return (
    <main className="min-h-screen bg-[#F8F7FB]">
      <section className="py-12 sm:py-16">
        <div className="max-w-[800px] mx-auto px-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-10 h-10 border-2 border-[#6046A3] border-t-transparent rounded-full mx-auto" />
            </div>
          ) : unauthorized ? (
            <div className="text-center py-20">
              <h1 className="font-bebas text-[40px] text-black mb-4">Немає доступу</h1>
              <p className="text-[#666] mb-6">
                Це замовлення прив&apos;язане до акаунта. Увійдіть, щоб переглянути його.
              </p>
              <Link href="/account" className="text-[#6046A3] hover:underline">
                Перейти до акаунта
              </Link>
            </div>
          ) : !order ? (
            <div className="text-center py-20">
              <h1 className="font-bebas text-[40px] text-black mb-4">Замовлення не знайдено</h1>
              <Link href="/account?tab=orders" className="text-[#6046A3] hover:underline">
                До моїх замовлень
              </Link>
            </div>
          ) : (
            <>
              {/* Back link */}
              <Link
                href="/account?tab=orders"
                className="inline-flex items-center gap-1 text-[14px] text-[#6046A3] hover:underline mb-6"
              >
                ← До моїх замовлень
              </Link>

              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
                <div>
                  <h1 className="font-bebas text-[36px] sm:text-[44px] leading-none text-black">
                    Замовлення
                  </h1>
                  <p className="font-mono text-[15px] text-[#444] mt-1">{order.id}</p>
                  <p className="text-[14px] text-[#999] mt-1">від {formatDate(order.created_at)}</p>
                </div>
                {status && (
                  <span
                    className="px-3 py-1 rounded-full text-[13px] font-medium"
                    style={{ backgroundColor: status.bg, color: status.color }}
                  >
                    {status.label}
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="bg-[#E2F9FF] rounded-[24px] p-6 sm:p-8 shadow-sm mb-6">
                <h2 className="font-bebas text-[26px] text-black mb-6">Товари</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-4 border-b border-[#D7EEF5] last:border-0 last:pb-0"
                    >
                      <div className="relative w-[64px] h-[64px] bg-white rounded-lg overflow-hidden flex-shrink-0">
                        {item.product_image && (
                          <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="text-[14px] text-black">{item.product_name}</p>
                        <p className="text-[13px] text-[#666]">
                          {item.quantity} × ₴{Math.round(item.price)}
                        </p>
                      </div>
                      <p className="font-medium whitespace-nowrap">₴{Math.round(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-[#D7EEF5] flex justify-between items-center">
                  <span className="text-[18px] font-medium">Загальна сума</span>
                  <span className="font-bebas text-[32px]">₴{Math.round(order.total_amount || itemsTotal)}</span>
                </div>
              </div>

              {/* Delivery & Payment */}
              <div className="bg-[#E2F9FF] rounded-[24px] p-6 sm:p-8 shadow-sm mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-[14px] text-[#999] uppercase tracking-wider mb-3">Доставка</h3>
                    <p className="font-medium">
                      {SHIPPING_LABELS[order.shipping_method] || order.shipping_method}
                    </p>
                    {shipLine && <p className="text-[14px] text-[#444] mt-1">{shipLine}</p>}
                    {(shipment?.trackingNumber || order.tracking_number) && (
                      <div className="mt-2 text-[14px]">
                        <span className="text-[#666]">ТТН: </span>
                        <a
                          href={`https://novaposhta.ua/tracking/?cargo_number=${
                            shipment?.trackingNumber || order.tracking_number
                          }`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-[#6046A3] hover:underline"
                        >
                          {shipment?.trackingNumber || order.tracking_number}
                        </a>
                        {shipment?.status && (
                          <p className="mt-2 text-[13px] text-[#444]">{shipment.status}</p>
                        )}
                        {shipment?.scheduledDeliveryDate && !shipment.trackingCompleted && (
                          <p className="mt-1 text-[12px] text-[#777]">
                            Планова доставка: {shipment.scheduledDeliveryDate}
                          </p>
                        )}
                        {shipment?.actualDeliveryDate && (
                          <p className="mt-1 text-[12px] text-[#059669]">
                            Доставлено: {shipment.actualDeliveryDate}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[14px] text-[#999] uppercase tracking-wider mb-3">Оплата</h3>
                    <p className="font-medium">
                      {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
                    </p>
                    {payStatus && (
                      <span
                        className="inline-block mt-2 px-3 py-1 rounded-full text-[12px] font-medium"
                        style={{ backgroundColor: payStatus.bg, color: payStatus.color }}
                      >
                        {payStatus.label}
                      </span>
                    )}
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-6 pt-6 border-t border-[#D7EEF5]">
                    <h3 className="text-[14px] text-[#999] uppercase tracking-wider mb-2">Коментар</h3>
                    <p className="text-[14px] text-[#444]">{order.notes}</p>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div className="bg-[#E2F9FF] rounded-[24px] p-6 sm:p-8 shadow-sm mb-8">
                <h2 className="font-bebas text-[26px] text-black mb-6">Отримувач</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[14px] text-[#999]">Ім&apos;я</p>
                    <p className="font-medium">{recipientName}</p>
                  </div>
                  <div>
                    <p className="text-[14px] text-[#999]">Телефон</p>
                    <p className="font-medium">{recipientPhone}</p>
                  </div>
                  <div>
                    <p className="text-[14px] text-[#999]">Email</p>
                    <p className="font-medium">{recipientEmail}</p>
                  </div>
                </div>

                {showAccountInfo && (
                  <div className="mt-6 pt-6 border-t border-[#D7EEF5]">
                    <h3 className="text-[14px] text-[#999] uppercase tracking-wider mb-2">
                      Власник акаунта
                    </h3>
                    <p className="font-medium">{accountName}</p>
                    {accountPhone && <p className="text-[14px] text-[#444]">{accountPhone}</p>}
                  </div>
                )}
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
                  href="/account?tab=orders"
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
