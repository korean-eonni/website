import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAuthed } from '@/lib/adminAuth'
import {
  getAllOrders,
  getOrderItems,
  updateOrderStatus,
  updatePaymentStatus,
  type Order,
  type OrderItem,
} from '@/lib/userStore'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Новий',
  confirmed: 'Підтверджено',
  processing: 'Опрацьовується',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
}
const STATUS_ORDER: Order['status'][] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: 'Накладений платіж',
  platon: 'Карткою онлайн',
  card: 'Переказ на картку',
}
const SHIPPING_LABELS: Record<string, string> = {
  nova_poshta: 'Нова Пошта',
  ukrposhta: 'Укрпошта',
}
const PAYMENT_STATUS_LABELS: Record<Order['payment_status'], string> = {
  pending: 'Очікує оплати',
  paid: 'Оплачено',
  failed: 'Помилка',
  refunded: 'Повернено',
}

async function setStatusAction(formData: FormData) {
  'use server'
  if (!isAuthed()) redirect('/admin')
  const id = String(formData.get('orderId') || '')
  const status = String(formData.get('status') || '') as Order['status']
  if (id && STATUS_ORDER.includes(status)) {
    await updateOrderStatus(id, status)
  }
  redirect('/admin/orders')
}

async function setPaymentAction(formData: FormData) {
  'use server'
  if (!isAuthed()) redirect('/admin')
  const id = String(formData.get('orderId') || '')
  const paymentStatus = String(formData.get('paymentStatus') || '') as Order['payment_status']
  if (id && ['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
    await updatePaymentStatus(id, paymentStatus)
  }
  redirect('/admin/orders')
}

function money(n: number) {
  return `₴${Math.round(Number(n) || 0)}`
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

export default async function AdminOrdersPage() {
  if (!isAuthed()) {
    return (
      <main className="min-h-screen bg-[#F8F7FB] flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="font-bebas text-[40px] text-black mb-4">Потрібен вхід</h1>
          <p className="text-[#666] mb-6">Увійдіть в адмін-панель, щоб переглядати замовлення.</p>
          <Link
            href="/admin"
            className="inline-block px-6 py-3 bg-[#6046A3] text-white rounded-lg font-semibold"
          >
            Перейти до входу
          </Link>
        </div>
      </main>
    )
  }

  const orders = await getAllOrders(100)
  const itemsByOrder = new Map<string, OrderItem[]>()
  await Promise.all(
    orders.map(async (o) => {
      itemsByOrder.set(o.id, await getOrderItems(o.id))
    })
  )

  const newCount = orders.filter((o) => o.status === 'pending').length
  const unpaidCard = orders.filter(
    (o) => o.payment_method === 'card' && o.payment_status !== 'paid'
  ).length

  return (
    <main className="min-h-screen bg-[#F8F7FB] py-10">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-bebas text-[40px] leading-none text-black">Замовлення</h1>
            <p className="text-[14px] text-[#666] mt-1">
              Усього: {orders.length} · Нових: {newCount}
              {unpaidCard > 0 ? ` · Очікують оплати на картку: ${unpaidCard}` : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="h-10 px-4 inline-flex items-center rounded-lg border border-black text-black uppercase text-[14px] hover:bg-black hover:text-white transition-colors"
            >
              Товари
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-10 text-center text-[#666]">
            Замовлень ще немає.
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((o) => {
              const items = itemsByOrder.get(o.id) || []
              const shipLine = [o.shipping_city, o.shipping_warehouse || o.shipping_address]
                .filter(Boolean)
                .join(', ')
              const isCardUnpaid = o.payment_method === 'card' && o.payment_status !== 'paid'
              return (
                <div
                  key={o.id}
                  className={`bg-white rounded-2xl border p-5 sm:p-6 ${
                    o.status === 'pending' ? 'border-[#6046A3]' : 'border-[#E5E5E5]'
                  }`}
                >
                  {/* Top row */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-mono text-[15px] font-semibold text-black">{o.id}</p>
                      <p className="text-[13px] text-[#999]">{formatDate(o.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bebas text-[26px] leading-none">{money(o.total_amount)}</p>
                      <span
                        className={`inline-block mt-1 text-[12px] px-2 py-[2px] rounded-full ${
                          o.payment_status === 'paid'
                            ? 'bg-[#D1FAE5] text-[#065F46]'
                            : isCardUnpaid
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : 'bg-[#F1F1F1] text-[#666]'
                        }`}
                      >
                        {PAYMENT_METHOD_LABELS[o.payment_method] || o.payment_method} ·{' '}
                        {PAYMENT_STATUS_LABELS[o.payment_status] || o.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* Body grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-[12px] uppercase tracking-wider text-[#999] mb-1">Клієнт</p>
                      <p className="text-[14px] text-black">
                        {o.first_name} {o.last_name}
                      </p>
                      <p className="text-[14px] text-[#444]">
                        <a href={`tel:${o.phone}`} className="hover:underline">
                          {o.phone}
                        </a>
                      </p>
                      <p className="text-[14px] text-[#444]">
                        <a href={`mailto:${o.email}`} className="hover:underline">
                          {o.email}
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] uppercase tracking-wider text-[#999] mb-1">Доставка</p>
                      <p className="text-[14px] text-black">
                        {SHIPPING_LABELS[o.shipping_method] || o.shipping_method}
                      </p>
                      {shipLine && <p className="text-[14px] text-[#444]">{shipLine}</p>}
                      {o.notes && (
                        <p className="text-[13px] text-[#666] mt-1">Коментар: {o.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t border-[#EEE] pt-3 mb-4">
                    {items.length === 0 ? (
                      <p className="text-[13px] text-[#999]">Позиції недоступні</p>
                    ) : (
                      <ul className="space-y-1">
                        {items.map((it) => (
                          <li key={it.id} className="flex justify-between text-[14px]">
                            <span className="text-[#333]">
                              {it.product_name} <span className="text-[#999]">× {it.quantity}</span>
                            </span>
                            <span className="text-[#333] whitespace-nowrap">
                              {money(it.price * it.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 border-t border-[#EEE] pt-4">
                    <form action={setStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="orderId" value={o.id} />
                      <select
                        name="status"
                        defaultValue={o.status}
                        className="h-9 rounded-lg border border-[#CCC] px-2 text-[14px] bg-white"
                      >
                        {STATUS_ORDER.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="h-9 px-3 rounded-lg bg-[#6046A3] text-white text-[14px] hover:bg-[#4D3882] transition-colors"
                      >
                        Зберегти статус
                      </button>
                    </form>

                    {o.payment_status !== 'paid' ? (
                      <form action={setPaymentAction}>
                        <input type="hidden" name="orderId" value={o.id} />
                        <input type="hidden" name="paymentStatus" value="paid" />
                        <button
                          type="submit"
                          className="h-9 px-3 rounded-lg border border-[#059669] text-[#059669] text-[14px] hover:bg-[#059669] hover:text-white transition-colors"
                        >
                          Позначити оплаченим
                        </button>
                      </form>
                    ) : (
                      <form action={setPaymentAction}>
                        <input type="hidden" name="orderId" value={o.id} />
                        <input type="hidden" name="paymentStatus" value="pending" />
                        <button
                          type="submit"
                          className="h-9 px-3 rounded-lg border border-[#CCC] text-[#666] text-[14px] hover:bg-[#F1F1F1] transition-colors"
                        >
                          Скасувати оплату
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
