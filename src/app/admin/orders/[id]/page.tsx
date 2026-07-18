import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAuthed } from '@/lib/adminAuth'
import { getAdminOrderDetail } from '@/lib/adminData'
import {
  getOrderById,
  getOrderItems,
  updateOrderStatus,
  updatePaymentStatus,
  type Order,
} from '@/lib/userStore'
import {
  getEmailDeliveriesForOrder,
  sendOrderCreatedEmail,
  sendPaymentReceiptEmail,
} from '@/lib/emailDelivery'

export const dynamic = 'force-dynamic'

const statuses: Order['status'][] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const statusLabels: Record<string, string> = {
  pending: 'Новий',
  confirmed: 'Підтверджено',
  processing: 'В роботі',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
}

async function updateStatusAction(formData: FormData) {
  'use server'
  if (!isAuthed()) redirect('/admin')
  const orderId = String(formData.get('orderId') || '')
  const status = String(formData.get('status') || '') as Order['status']
  const tracking = String(formData.get('trackingNumber') || '').trim()
  if (orderId && statuses.includes(status)) await updateOrderStatus(orderId, status, tracking || undefined)
  redirect(`/admin/orders/${orderId}`)
}

async function updatePaymentAction(formData: FormData) {
  'use server'
  if (!isAuthed()) redirect('/admin')
  const orderId = String(formData.get('orderId') || '')
  const paymentStatus = String(formData.get('paymentStatus') || '') as Order['payment_status']
  if (orderId && ['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
    await updatePaymentStatus(orderId, paymentStatus)
    if (paymentStatus === 'paid') {
      const order = await getOrderById(orderId)
      if (order) await sendPaymentReceiptEmail(order, await getOrderItems(orderId))
    }
  }
  redirect(`/admin/orders/${orderId}`)
}

async function retryEmailAction(formData: FormData) {
  'use server'
  if (!isAuthed()) redirect('/admin')
  const orderId = String(formData.get('orderId') || '')
  const kind = String(formData.get('kind') || '')
  const order = orderId ? await getOrderById(orderId) : null
  if (order) {
    const items = await getOrderItems(orderId)
    if (kind === 'payment_receipt' && order.payment_status === 'paid') {
      await sendPaymentReceiptEmail(order, items)
    } else if (kind === 'order_created') {
      await sendOrderCreatedEmail(order, items)
    }
  }
  redirect(`/admin/orders/${orderId}`)
}

function money(value: number) {
  return `${new Intl.NumberFormat('uk-UA').format(value)} ₴`
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  if (!isAuthed()) return null
  const [{ order, items }, emailDeliveries] = await Promise.all([
    getAdminOrderDetail(params.id),
    getEmailDeliveriesForOrder(params.id),
  ])
  if (!order) {
    return (
      <main className="mx-auto max-w-[900px] px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">Замовлення не знайдено</h1>
        <Link href="/admin/orders" className="mt-4 inline-block text-sm font-semibold text-[#6046A3]">← До списку</Link>
      </main>
    )
  }
  const shippingAddress = [order.shipping_city, order.shipping_warehouse || order.shipping_address].filter(Boolean).join(', ')

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/admin/orders" className="text-sm font-semibold text-[#6046A3]">← Усі замовлення</Link>
        <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-mono text-2xl font-semibold">{order.id}</h1>
            <p className="mt-1 text-sm text-black/45">{new Date(order.created_at).toLocaleString('uk-UA')} · {order.item_count} одиниць</p>
          </div>
          <p className="text-3xl font-semibold">{money(order.total_amount)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <div className="border-b border-black/10 px-5 py-4"><h2 className="font-semibold">Склад замовлення</h2></div>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-t border-black/[0.06] px-5 py-4 first:border-0">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-[#F5F4F8]">
                  {item.product_image && <Image src={item.product_image} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.product_name}</p>
                  <p className="font-mono text-xs text-black/40">{item.product_id}</p>
                </div>
                <p className="text-sm text-black/50">× {item.quantity}</p>
                <p className="w-24 text-right text-sm font-semibold">{money(item.price * item.quantity)}</p>
              </div>
            ))}
            {!items.length && <p className="p-8 text-center text-sm text-black/45">Позиції недоступні.</p>}
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="font-semibold">Клієнт і доставка</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-black/40">Одержувач</p>
                <p className="mt-2 font-medium">{order.first_name} {order.last_name}</p>
                <a href={`tel:${order.phone}`} className="mt-1 block text-sm hover:text-[#6046A3]">{order.phone}</a>
                <a href={`mailto:${order.email}`} className="block text-sm hover:text-[#6046A3]">{order.email}</a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-black/40">Доставка</p>
                <p className="mt-2 font-medium">{order.shipping_method === 'nova_poshta' ? 'Нова Пошта' : order.shipping_method}</p>
                <p className="mt-1 text-sm text-black/60">{shippingAddress || 'Адресу не вказано'}</p>
              </div>
            </div>
            {order.notes && <div className="mt-5 rounded-xl bg-[#F5F4F8] p-4 text-sm"><span className="font-medium">Коментар:</span> {order.notes}</div>}
          </section>
        </div>

        <aside className="space-y-6">
          <form action={updateStatusAction} className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="font-semibold">Виконання</h2>
            <input type="hidden" name="orderId" value={order.id} />
            <label className="mt-4 block text-xs font-medium text-black/50" htmlFor="status">Статус</label>
            <select id="status" name="status" defaultValue={order.status} className="mt-1 h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm">
              {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
            </select>
            <label className="mt-4 block text-xs font-medium text-black/50" htmlFor="trackingNumber">Номер ТТН</label>
            <input id="trackingNumber" name="trackingNumber" defaultValue={order.tracking_number || ''} className="mt-1 h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
            <button className="mt-4 h-11 w-full rounded-xl bg-[#17131F] text-sm font-semibold text-white">Зберегти виконання</button>
          </form>

          <form action={updatePaymentAction} className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="font-semibold">Оплата</h2>
            <p className="mt-2 text-sm text-black/50">{order.payment_method} · поточний статус: <strong>{order.payment_status}</strong></p>
            <input type="hidden" name="orderId" value={order.id} />
            <select name="paymentStatus" defaultValue={order.payment_status} className="mt-4 h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm">
              <option value="pending">Очікує оплати</option>
              <option value="paid">Оплачено</option>
              <option value="failed">Помилка</option>
              <option value="refunded">Повернено</option>
            </select>
            <button className="mt-3 h-11 w-full rounded-xl border border-black/15 text-sm font-semibold hover:bg-black/5">Оновити оплату</button>
          </form>

          <section className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="font-semibold">Email клієнту</h2>
            <div className="mt-3 space-y-2">
              {emailDeliveries.map((delivery) => (
                <div key={delivery.id} className="rounded-xl bg-[#F5F4F8] px-3 py-2 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span>{delivery.kind === 'payment_receipt' ? 'Квитанція про оплату' : 'Підтвердження замовлення'}</span>
                    <span className={delivery.status === 'sent' ? 'text-emerald-700' : delivery.status === 'failed' ? 'text-red-700' : 'text-amber-700'}>
                      {delivery.status}
                    </span>
                  </div>
                  {delivery.error_message && <p className="mt-1 text-red-700">{delivery.error_message}</p>}
                </div>
              ))}
              {!emailDeliveries.length && <p className="text-sm text-black/45">Листів ще немає.</p>}
            </div>
            <div className="mt-4 grid gap-2">
              <form action={retryEmailAction}>
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="kind" value="order_created" />
                <button className="h-10 w-full rounded-xl border border-black/15 text-xs font-semibold hover:bg-black/5">
                  Надіслати підтвердження
                </button>
              </form>
              {order.payment_status === 'paid' && (
                <form action={retryEmailAction}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <input type="hidden" name="kind" value="payment_receipt" />
                  <button className="h-10 w-full rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                    Надіслати квитанцію
                  </button>
                </form>
              )}
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}
