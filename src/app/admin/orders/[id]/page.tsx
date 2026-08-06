import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAuthed } from '@/lib/adminAuth'
import {
  getOrderById,
  getOrderItems,
  getUserById,
  getUserOrders,
  getOrdersByPhone,
  getOrdersByEmail,
  updateOrderStatus,
  updatePaymentStatus,
  type Order,
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
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled',
]
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: 'Накладений платіж',
  platon: 'Карткою онлайн',
  card: 'Переказ на картку',
}
const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Очікує оплати',
  paid: 'Оплачено',
  failed: 'Помилка',
  refunded: 'Повернено',
}
const SHIPPING_LABELS: Record<string, string> = {
  nova_poshta: 'Нова Пошта',
  ukrposhta: 'Укрпошта',
}

const money = (n: number) => `₴${Math.round(Number(n) || 0)}`
const normPhone = (p: string | null | undefined) => (p || '').replace(/\D/g, '')

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kyiv',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}
function shortDate(iso: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kyiv', day: '2-digit', month: '2-digit', year: '2-digit',
  }).format(new Date(iso))
}

async function setStatusAction(formData: FormData) {
  'use server'
  if (!isAuthed()) return
  const id = String(formData.get('id') || '')
  const status = String(formData.get('status') || '') as Order['status']
  if (id && STATUS_ORDER.includes(status)) await updateOrderStatus(id, status)
  redirect(`/admin/orders/${id}`)
}

async function setPaymentAction(formData: FormData) {
  'use server'
  if (!isAuthed()) return
  const id = String(formData.get('id') || '')
  const payment = String(formData.get('payment') || '') as Order['payment_status']
  if (id && ['pending', 'paid', 'failed', 'refunded'].includes(payment)) {
    await updatePaymentStatus(id, payment)
  }
  redirect(`/admin/orders/${id}`)
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-1.5">
      <span className="text-[13px] text-[#999] w-[130px] shrink-0">{label}</span>
      <span className="text-[14px] text-black break-words">{children}</span>
    </div>
  )
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  if (!isAuthed()) {
    return (
      <main className="min-h-screen bg-[#F8F7FB] flex items-center justify-center p-6">
        <Link href="/admin" className="px-6 py-3 bg-[#4348AE] text-white rounded-lg font-semibold">
          Увійти в адмін
        </Link>
      </main>
    )
  }

  const order = await getOrderById(params.id)
  if (!order) {
    return (
      <main className="min-h-screen bg-[#F8F7FB] flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-[#666]">Замовлення не знайдено.</p>
        <Link href="/admin/orders" className="text-[#4348AE] underline">← До списку</Link>
      </main>
    )
  }

  const items = await getOrderItems(order.id)

  // The account owner (if the order is tied to a registered user).
  const owner = order.user_id ? await getUserById(order.user_id) : null

  // Full order history for this customer — merged from account, phone and email,
  // so we can say "this is their Nth order".
  const [byUser, byPhone, byEmail] = await Promise.all([
    order.user_id ? getUserOrders(order.user_id) : Promise.resolve([] as Order[]),
    order.phone ? getOrdersByPhone(order.phone) : Promise.resolve([] as Order[]),
    order.email ? getOrdersByEmail(order.email) : Promise.resolve([] as Order[]),
  ])
  const historyMap = new Map<string, Order>()
  for (const o of [...byUser, ...byPhone, ...byEmail]) historyMap.set(o.id, o)
  const history = Array.from(historyMap.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const nth = history.findIndex((o) => o.id === order.id) + 1
  const total = history.length
  const registered = !!owner

  const ownerName = owner ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim() : ''
  const orderName = `${order.first_name} ${order.last_name}`.trim()
  const ownerDiffers =
    !!owner &&
    (ownerName !== orderName ||
      (owner.phone && normPhone(owner.phone) !== normPhone(order.phone)) ||
      (owner.email || '').toLowerCase() !== (order.email || '').toLowerCase())

  return (
    <main className="min-h-screen bg-[#F8F7FB] py-8">
      <div className="max-w-[820px] mx-auto px-4 sm:px-6">
        <Link href="/admin/orders" className="text-[14px] text-[#4348AE] hover:underline">
          ← До списку замовлень
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mt-3 mb-5">
          <div>
            <h1 className="font-bebas text-[38px] leading-none text-black">Замовлення</h1>
            <p className="font-mono text-[14px] text-[#666] mt-1">{order.id}</p>
            <p className="text-[13px] text-[#999] mt-1">{formatDate(order.created_at)}</p>
          </div>
          <div className="text-right">
            <p className="font-bebas text-[34px] leading-none text-black">{money(order.total_amount)}</p>
            <span
              className={`inline-block mt-2 text-[12px] font-medium px-2 py-[2px] rounded-full ${
                registered ? 'bg-[#FDE68A] text-[#92400E]' : 'bg-[#FBCFE8] text-[#9D174D]'
              }`}
            >
              {registered ? 'Зареєстрований' : 'Не зареєстрований'}
            </span>
          </div>
        </div>

        {/* Customer order count */}
        <div className="bg-[#EFECFB] rounded-xl px-4 py-3 mb-5 text-[14px] text-[#4B3FA6]">
          {total > 1
            ? `Це ${nth}-е замовлення цього клієнта (усього ${total})`
            : 'Перше замовлення цього клієнта'}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Client */}
          <section className="bg-white rounded-2xl border border-[#E5E5E5] p-5">
            <h2 className="text-[15px] font-semibold mb-2">Отримувач</h2>
            <Row label="Ім'я">{orderName || '—'}</Row>
            <Row label="Телефон">
              <a href={`tel:${order.phone}`} className="text-[#4348AE] hover:underline">{order.phone}</a>
            </Row>
            <Row label="Email">
              <a href={`mailto:${order.email}`} className="text-[#4348AE] hover:underline">{order.email}</a>
            </Row>
          </section>

          {/* Delivery */}
          <section className="bg-white rounded-2xl border border-[#E5E5E5] p-5">
            <h2 className="text-[15px] font-semibold mb-2">Доставка</h2>
            <Row label="Спосіб">{SHIPPING_LABELS[order.shipping_method] || order.shipping_method}</Row>
            {order.shipping_city && <Row label="Місто">{order.shipping_city}</Row>}
            {order.shipping_warehouse && <Row label="Відділення">{order.shipping_warehouse}</Row>}
            {order.shipping_address && <Row label="Адреса">{order.shipping_address}</Row>}
          </section>
        </div>

        {/* Account owner, when it differs from the order's own data */}
        {ownerDiffers && owner && (
          <section className="bg-white rounded-2xl border border-[#E5E5E5] p-5 mt-4">
            <h2 className="text-[15px] font-semibold mb-2">Власник акаунта</h2>
            <Row label="Ім'я">{ownerName || '—'}</Row>
            {owner.phone && <Row label="Телефон">{owner.phone}</Row>}
            <Row label="Email">{owner.email}</Row>
          </section>
        )}

        {/* Payment */}
        <section className="bg-white rounded-2xl border border-[#E5E5E5] p-5 mt-4">
          <h2 className="text-[15px] font-semibold mb-2">Оплата</h2>
          <Row label="Спосіб">{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</Row>
          <Row label="Статус">{PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}</Row>
        </section>

        {/* Items */}
        <section className="bg-white rounded-2xl border border-[#E5E5E5] p-5 mt-4">
          <h2 className="text-[15px] font-semibold mb-3">Товари ({items.length})</h2>
          <div className="divide-y divide-[#F0F0F0]">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[14px] text-black truncate">{it.product_name}</p>
                  <p className="text-[13px] text-[#999]">{money(it.price)} × {it.quantity}</p>
                </div>
                <p className="text-[14px] font-medium whitespace-nowrap">{money(it.price * it.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center border-t border-[#EEE] mt-2 pt-3">
            <span className="text-[14px] text-[#666]">Разом</span>
            <span className="font-bebas text-[24px]">{money(order.total_amount)}</span>
          </div>
        </section>

        {order.notes && (
          <section className="bg-white rounded-2xl border border-[#E5E5E5] p-5 mt-4">
            <h2 className="text-[15px] font-semibold mb-2">Примітки</h2>
            <p className="text-[14px] text-[#444] whitespace-pre-wrap">{order.notes}</p>
          </section>
        )}

        {/* Admin actions */}
        <section className="bg-white rounded-2xl border border-[#E5E5E5] p-5 mt-4">
          <h2 className="text-[15px] font-semibold mb-3">Керування</h2>
          <div className="flex flex-wrap gap-4">
            <form action={setStatusAction} className="flex items-center gap-2">
              <input type="hidden" name="id" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                className="h-10 px-3 border border-[#DDD] rounded-lg text-[14px] bg-white"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <button className="h-10 px-4 bg-[#4348AE] text-white rounded-lg text-[14px] font-medium">
                Зберегти статус
              </button>
            </form>

            <form action={setPaymentAction} className="flex items-center gap-2">
              <input type="hidden" name="id" value={order.id} />
              <select
                name="payment"
                defaultValue={order.payment_status}
                className="h-10 px-3 border border-[#DDD] rounded-lg text-[14px] bg-white"
              >
                <option value="pending">Очікує оплати</option>
                <option value="paid">Оплачено</option>
                <option value="failed">Помилка</option>
                <option value="refunded">Повернено</option>
              </select>
              <button className="h-10 px-4 border border-black text-black rounded-lg text-[14px] font-medium hover:bg-black hover:text-white transition-colors">
                Зберегти оплату
              </button>
            </form>
          </div>
        </section>

        {/* Customer history */}
        {history.length > 1 && (
          <section className="bg-white rounded-2xl border border-[#E5E5E5] p-5 mt-4 mb-8">
            <h2 className="text-[15px] font-semibold mb-3">Усі замовлення клієнта ({total})</h2>
            <div className="space-y-1.5">
              {history.slice().reverse().map((o) => (
                <a
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors ${
                    o.id === order.id ? 'bg-[#EFECFB]' : 'hover:bg-[#F8F7FB]'
                  }`}
                >
                  <span className="font-mono text-[13px] text-[#444] truncate">{o.id}</span>
                  <span className="text-[13px] text-[#999] whitespace-nowrap">{shortDate(o.created_at)}</span>
                  <span className="text-[13px] text-[#666] whitespace-nowrap">
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                  <span className="text-[14px] font-medium whitespace-nowrap">{money(o.total_amount)}</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
