import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAuthed } from '@/lib/adminAuth'
import { getAdminOrders } from '@/lib/adminData'
import {
  getOrderById,
  getOrderItems,
  updateOrderStatus,
  updatePaymentStatus,
  type Order,
} from '@/lib/userStore'
import { sendPaymentReceiptEmail } from '@/lib/emailDelivery'

export const dynamic = 'force-dynamic'

const statusLabels: Record<string, string> = {
  pending: 'Новий',
  confirmed: 'Підтверджено',
  processing: 'В роботі',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
}
const paymentLabels: Record<string, string> = {
  pending: 'Очікує',
  paid: 'Оплачено',
  failed: 'Помилка',
  refunded: 'Повернено',
}
const statuses: Order['status'][] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

async function updateStatusAction(formData: FormData) {
  'use server'
  if (!isAuthed()) redirect('/admin')
  const orderId = String(formData.get('orderId') || '')
  const status = String(formData.get('status') || '') as Order['status']
  if (orderId && statuses.includes(status)) await updateOrderStatus(orderId, status)
  redirect('/admin/orders')
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
  redirect('/admin/orders')
}

function money(value: number) {
  return `${new Intl.NumberFormat('uk-UA').format(value)} ₴`
}

function date(value: string) {
  return new Date(value).toLocaleString('uk-UA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string; payment?: string; delete?: string }
}) {
  if (!isAuthed()) return null
  const orders = await getAdminOrders()
  const query = (searchParams?.q || '').trim().toLowerCase()
  const status = searchParams?.status || 'all'
  const payment = searchParams?.payment || 'all'
  const filtered = orders.filter((order) => {
    const matchesQuery =
      !query ||
      order.id.toLowerCase().includes(query) ||
      order.email.toLowerCase().includes(query) ||
      order.phone.includes(query) ||
      `${order.first_name} ${order.last_name}`.toLowerCase().includes(query)
    return matchesQuery && (status === 'all' || order.status === status) && (payment === 'all' || order.payment_status === payment)
  })

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6046A3]">Order management</p>
        <h1 className="mt-2 text-3xl font-semibold">Замовлення</h1>
        <p className="mt-1 text-sm text-black/50">{orders.length} усього · {orders.filter((order) => order.status === 'pending').length} нових</p>
      </div>

      {searchParams?.delete === 'deleted' && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          Замовлення та його позиції остаточно видалено. Журнал уже надісланих email збережено.
        </div>
      )}
      {searchParams?.delete === 'not_cancelled' && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Замовлення не видалено: спочатку змініть його статус на «Скасовано», щоб залишки
          повернулися на склад рівно один раз.
        </div>
      )}
      {(searchParams?.delete === 'not_found' || searchParams?.delete === 'error') && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          Замовлення не вдалося видалити. Воно вже відсутнє або сталася помилка бази даних.
        </div>
      )}

      <form className="mb-5 grid gap-3 rounded-2xl border border-black/10 bg-white p-4 lg:grid-cols-[1fr_190px_190px_auto]">
        <input name="q" defaultValue={searchParams?.q} placeholder="№ замовлення, клієнт, email або телефон" className="h-11 rounded-xl border border-black/15 px-4 text-sm outline-none focus:border-[#6046A3]" />
        <select name="status" defaultValue={status} className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm">
          <option value="all">Усі статуси</option>
          {statuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
        </select>
        <select name="payment" defaultValue={payment} className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm">
          <option value="all">Усі оплати</option>
          {['pending', 'paid', 'failed', 'refunded'].map((item) => <option key={item} value={item}>{paymentLabels[item]}</option>)}
        </select>
        <button className="h-11 rounded-xl bg-[#17131F] px-5 text-sm font-semibold text-white">Фільтрувати</button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-black/[0.025] text-[11px] uppercase tracking-wider text-black/45">
              <tr>
                <th className="px-5 py-3 font-medium">Замовлення</th>
                <th className="px-5 py-3 font-medium">Клієнт</th>
                <th className="px-5 py-3 font-medium">Доставка</th>
                <th className="px-5 py-3 text-center font-medium">Товари</th>
                <th className="px-5 py-3 text-right font-medium">Сума</th>
                <th className="px-5 py-3 font-medium">Статус / оплата</th>
                <th className="px-5 py-3 text-right font-medium">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className={`border-t border-black/[0.06] ${order.status === 'pending' ? 'bg-[#FBFAFF]' : ''}`}>
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-semibold hover:text-[#6046A3]">{order.id}</Link>
                    <span className="mt-1 block text-xs text-black/40">{date(order.created_at)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium">{order.first_name} {order.last_name}</span>
                    <a href={`mailto:${order.email}`} className="block text-xs text-black/45 hover:text-[#6046A3]">{order.email}</a>
                    <a href={`tel:${order.phone}`} className="block text-xs text-black/45 hover:text-[#6046A3]">{order.phone}</a>
                  </td>
                  <td className="px-5 py-4">
                    <span>{order.shipping_method === 'nova_poshta' ? 'Нова Пошта' : order.shipping_method}</span>
                    <span className="block max-w-[220px] truncate text-xs text-black/45">{[order.shipping_city, order.shipping_warehouse || order.shipping_address].filter(Boolean).join(', ') || '—'}</span>
                  </td>
                  <td className="px-5 py-4 text-center font-semibold">{order.item_count}</td>
                  <td className="px-5 py-4 text-right font-semibold">{money(order.total_amount)}</td>
                  <td className="px-5 py-4">
                    <span className="block text-xs font-medium">{statusLabels[order.status] || order.status}</span>
                    <span className={`text-xs ${order.payment_status === 'paid' ? 'text-emerald-700' : order.payment_status === 'failed' ? 'text-red-700' : 'text-amber-700'}`}>
                      {paymentLabels[order.payment_status] || order.payment_status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {order.status === 'pending' && (
                        <form action={updateStatusAction}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <input type="hidden" name="status" value="confirmed" />
                          <button className="rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-medium hover:bg-black/5">
                            Підтвердити
                          </button>
                        </form>
                      )}
                      {order.payment_status !== 'paid' && (
                        <form action={updatePaymentAction}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <input type="hidden" name="paymentStatus" value="paid" />
                          <button className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50">Оплачено</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <p className="px-5 py-12 text-center text-sm text-black/45">Замовлень за цими умовами немає.</p>}
      </div>
    </main>
  )
}
