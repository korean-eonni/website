import Link from 'next/link'
import { isAuthed } from '@/lib/adminAuth'
import { getAllOrders, getAllUsers, type Order, type User } from '@/lib/userStore'
import { updateCustomerAction, deleteCustomerAction } from './actions'
import ConfirmDeleteButton from './ConfirmDeleteButton'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Новий',
  confirmed: 'Підтверджено',
  processing: 'Опрацьовується',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
}
const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-[#FEF3C7] text-[#92400E]',
  confirmed: 'bg-[#E0E7FF] text-[#3730A3]',
  processing: 'bg-[#EDE9FE] text-[#6D28D9]',
  shipped: 'bg-[#E2F9FF] text-[#0E7490]',
  delivered: 'bg-[#D1FAE5] text-[#065F46]',
  cancelled: 'bg-[#FEE2E2] text-[#B91C1C]',
}
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

// Per-day background tints, cycled by calendar day — colours pulled from the
// site's promo gradient (soft lavender / blue / cyan / lilac / purple / pink).
const DAY_TINTS = [
  { bg: '#EFECFB', accent: '#7C6FD6' },
  { bg: '#E8F1FC', accent: '#5E8BDD' },
  { bg: '#E7F8FD', accent: '#3EB4D0' },
  { bg: '#FBEEFB', accent: '#C56FC8' },
  { bg: '#F4EBFC', accent: '#9B6FD2' },
  { bg: '#FEEDF6', accent: '#DB6FA8' },
]

const money = (n: number) => `₴${Math.round(Number(n) || 0)}`
const normPhone = (p: string | null | undefined) => (p || '').replace(/\D/g, '')

function kyivDayKey(iso: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(iso))
}
function dayLabel(iso: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kyiv', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(iso))
}
function timeLabel(iso: string) {
  return new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kyiv', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

function RegisteredBadge({ registered }: { registered: boolean }) {
  return registered ? (
    <span className="inline-block text-[12px] font-medium px-2 py-[2px] rounded-full bg-[#FDE68A] text-[#92400E]">
      Зареєстрований
    </span>
  ) : (
    <span className="inline-block text-[12px] font-medium px-2 py-[2px] rounded-full bg-[#FBCFE8] text-[#9D174D]">
      Не зареєстрований
    </span>
  )
}

function LoginGate() {
  return (
    <main className="min-h-screen bg-[#F8F7FB] flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="font-bebas text-[40px] text-black mb-4">Потрібен вхід</h1>
        <p className="text-[#666] mb-6">Увійдіть в адмін-панель, щоб переглядати замовлення.</p>
        <Link href="/admin" className="inline-block px-6 py-3 bg-[#4348AE] text-white rounded-lg font-semibold">
          Перейти до входу
        </Link>
      </div>
    </main>
  )
}

type Customer = {
  key: string
  userId: string
  firstName: string
  lastName: string
  name: string
  phone: string
  email: string
  registered: boolean
  count: number
  total: number
  orders: Order[]
  lastIso: string
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { tab?: string }
}) {
  if (!isAuthed()) return <LoginGate />

  const tab = searchParams?.tab === 'customers' ? 'customers' : 'orders'
  const [orders, users] = await Promise.all([getAllOrders(500), getAllUsers()])

  // Registration lookup — an order is "registered" if it's linked to an account
  // or its email/phone matches a registered user.
  const regEmails = new Set(users.map((u) => (u.email || '').toLowerCase()))
  const regPhones = new Set(users.map((u) => normPhone(u.phone)).filter(Boolean))
  const isRegistered = (o: Order) =>
    !!o.user_id ||
    regEmails.has((o.email || '').toLowerCase()) ||
    (!!normPhone(o.phone) && regPhones.has(normPhone(o.phone)))

  const newCount = orders.filter((o) => o.status === 'pending').length

  return (
    <main className="min-h-screen bg-[#F8F7FB] py-8">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="font-bebas text-[40px] leading-none text-black">Адмін</h1>
            <p className="text-[14px] text-[#666] mt-1">
              Замовлень: {orders.length} · Нових: {newCount} · Покупців у базі: {users.length}
            </p>
          </div>
          <Link
            href="/admin"
            className="h-10 px-4 inline-flex items-center rounded-lg border border-black text-black uppercase text-[14px] hover:bg-black hover:text-white transition-colors"
          >
            Товари
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#E5E5E5]">
          <Link
            href="/admin/orders?tab=orders"
            className={`px-4 py-2.5 text-[15px] font-medium border-b-2 -mb-px transition-colors ${
              tab === 'orders' ? 'border-[#4348AE] text-[#4348AE]' : 'border-transparent text-[#666] hover:text-black'
            }`}
          >
            Замовлення
          </Link>
          <Link
            href="/admin/orders?tab=customers"
            className={`px-4 py-2.5 text-[15px] font-medium border-b-2 -mb-px transition-colors ${
              tab === 'customers' ? 'border-[#4348AE] text-[#4348AE]' : 'border-transparent text-[#666] hover:text-black'
            }`}
          >
            База покупців
          </Link>
        </div>

        {tab === 'orders' ? (
          <OrdersByDay orders={orders} isRegistered={isRegistered} />
        ) : (
          <CustomersView orders={orders} users={users} isRegistered={isRegistered} />
        )}
      </div>
    </main>
  )
}

function OrdersByDay({
  orders,
  isRegistered,
}: {
  orders: Order[]
  isRegistered: (o: Order) => boolean
}) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-10 text-center text-[#666]">
        Замовлень ще немає.
      </div>
    )
  }

  // Group consecutive (already date-desc) orders by Kyiv calendar day.
  const groups: { key: string; iso: string; orders: Order[] }[] = []
  for (const o of orders) {
    const k = kyivDayKey(o.created_at)
    const last = groups[groups.length - 1]
    if (!last || last.key !== k) groups.push({ key: k, iso: o.created_at, orders: [o] })
    else last.orders.push(o)
  }

  return (
    <div className="space-y-6">
      {groups.map((g, gi) => {
        const tint = DAY_TINTS[gi % DAY_TINTS.length]
        return (
          <section key={g.key} className="rounded-2xl p-4 sm:p-5" style={{ backgroundColor: tint.bg }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold capitalize" style={{ color: tint.accent }}>
                {dayLabel(g.iso)}
              </h2>
              <span className="text-[13px] font-medium" style={{ color: tint.accent }}>
                {g.orders.length} замовл.
              </span>
            </div>
            <div className="space-y-3">
              {g.orders.map((o) => (
                <OrderCard key={o.id} o={o} registered={isRegistered(o)} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function OrderCard({ o, registered }: { o: Order; registered: boolean }) {
  const shipLine = [o.shipping_city, o.shipping_warehouse || o.shipping_address].filter(Boolean).join(', ')
  return (
    <a
      href={`/admin/orders/${o.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white/80 hover:bg-white rounded-xl border border-white p-4 transition-colors shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* left: order # + client */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[14px] font-semibold text-black">{o.id}</span>
            <span className="text-[12px] text-[#999]">{timeLabel(o.created_at)}</span>
            <RegisteredBadge registered={registered} />
          </div>
          <p className="text-[14px] text-black mt-2">
            {o.first_name} {o.last_name}
          </p>
          <p className="text-[13px] text-[#555]">{o.phone}</p>
          <p className="text-[13px] text-[#555]">{o.email}</p>
          <p className="text-[13px] text-[#777] mt-1">
            {SHIPPING_LABELS[o.shipping_method] || o.shipping_method}
            {shipLine ? ` — ${shipLine}` : ''}
          </p>
        </div>
        {/* right: sum + payment + status */}
        <div className="text-right shrink-0">
          <p className="font-bebas text-[26px] leading-none text-black">{money(o.total_amount)}</p>
          <p className="text-[12px] text-[#666] mt-1">
            {PAYMENT_METHOD_LABELS[o.payment_method] || o.payment_method}
          </p>
          <p className="text-[12px] text-[#666]">
            {PAYMENT_STATUS_LABELS[o.payment_status] || o.payment_status}
          </p>
          <span
            className={`inline-block mt-2 text-[12px] font-medium px-2 py-[2px] rounded-full ${
              STATUS_COLORS[o.status] || 'bg-[#F1F1F1] text-[#666]'
            }`}
          >
            {STATUS_LABELS[o.status] || o.status}
          </span>
        </div>
      </div>
    </a>
  )
}

function CustomersView({
  orders,
  users,
  isRegistered,
}: {
  orders: Order[]
  users: User[]
  isRegistered: (o: Order) => boolean
}) {
  // Group orders into customers (by phone; fall back to email).
  const byKey = new Map<string, Order[]>()
  for (const o of orders) {
    const key = normPhone(o.phone) || `e:${(o.email || '').toLowerCase()}` || o.id
    if (!byKey.has(key)) byKey.set(key, [])
    byKey.get(key)!.push(o)
  }

  const customers: Customer[] = Array.from(byKey.values()).map((list) => {
    const latest = list[0]
    return {
      key: normPhone(latest.phone) || (latest.email || '').toLowerCase() || latest.id,
      userId: list.find((o) => o.user_id)?.user_id || '',
      firstName: latest.first_name,
      lastName: latest.last_name,
      name: `${latest.first_name} ${latest.last_name}`.trim(),
      phone: latest.phone,
      email: latest.email,
      registered: list.some(isRegistered),
      count: list.length,
      total: list.reduce((s, o) => s + Number(o.total_amount || 0), 0),
      orders: list,
      lastIso: latest.created_at,
    }
  })

  // Add registered users who have not ordered yet.
  const orderPhones = new Set(orders.map((o) => normPhone(o.phone)).filter(Boolean))
  const orderEmails = new Set(orders.map((o) => (o.email || '').toLowerCase()).filter(Boolean))
  for (const u of users) {
    const covered =
      (!!normPhone(u.phone) && orderPhones.has(normPhone(u.phone))) ||
      (!!u.email && orderEmails.has(u.email.toLowerCase()))
    if (!covered) {
      customers.push({
        key: `u:${u.id}`,
        userId: u.id,
        firstName: u.first_name || '',
        lastName: u.last_name || '',
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
        phone: u.phone || '',
        email: u.email,
        registered: true,
        count: 0,
        total: 0,
        orders: [],
        lastIso: u.created_at,
      })
    }
  }

  customers.sort((a, b) => new Date(b.lastIso).getTime() - new Date(a.lastIso).getTime())

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-10 text-center text-[#666]">
        Покупців ще немає.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {customers.map((c) => (
        <div key={c.key} className="bg-white rounded-2xl border border-[#E5E5E5] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[16px] font-semibold text-black">{c.name || '—'}</p>
                <RegisteredBadge registered={c.registered} />
              </div>
              {c.phone && (
                <p className="text-[14px] text-[#444]">
                  <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a>
                </p>
              )}
              {c.email && (
                <p className="text-[14px] text-[#444]">
                  <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a>
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[13px] text-[#999]">Замовлень</p>
              <p className="font-bebas text-[26px] leading-none">{c.count}</p>
              {c.total > 0 && <p className="text-[13px] text-[#666] mt-1">на {money(c.total)}</p>}
            </div>
          </div>

          {/* Actions — edit & delete */}
          <div className="flex flex-wrap items-start gap-2 mb-4">
            <details className="flex-1 min-w-[220px]">
              <summary className="inline-flex items-center cursor-pointer list-none select-none h-9 px-4 rounded-lg bg-[#4348AE] text-white text-[14px] font-medium w-fit hover:opacity-90">
                Редагувати дані
              </summary>
              <form action={updateCustomerAction} className="mt-3 grid sm:grid-cols-2 gap-2 bg-[#F8F7FB] rounded-xl p-3">
                <input type="hidden" name="userId" value={c.userId} />
                <input type="hidden" name="orderIds" value={c.orders.map((o) => o.id).join(',')} />
                <input
                  name="first_name"
                  defaultValue={c.firstName}
                  placeholder="Ім'я"
                  className="h-10 px-3 border border-[#DDD] rounded-lg text-[14px] bg-white"
                />
                <input
                  name="last_name"
                  defaultValue={c.lastName}
                  placeholder="Прізвище"
                  className="h-10 px-3 border border-[#DDD] rounded-lg text-[14px] bg-white"
                />
                <input
                  name="phone"
                  defaultValue={c.phone}
                  placeholder="Телефон"
                  className="h-10 px-3 border border-[#DDD] rounded-lg text-[14px] bg-white"
                />
                <input
                  name="email"
                  defaultValue={c.email}
                  placeholder="Email"
                  className="h-10 px-3 border border-[#DDD] rounded-lg text-[14px] bg-white"
                />
                <button className="h-10 px-6 bg-[#4348AE] text-white rounded-lg text-[14px] font-medium sm:col-span-2 sm:justify-self-start">
                  Зберегти зміни
                </button>
              </form>
            </details>
            <ConfirmDeleteButton
              action={deleteCustomerAction}
              userId={c.userId}
              orderIds={c.orders.map((o) => o.id).join(',')}
              name={c.name}
            />
          </div>

          {c.orders.length > 0 && (
            <div className="border-t border-[#EEE] pt-3">
              <p className="text-[12px] uppercase tracking-wider text-[#999] mb-2">Історія замовлень</p>
              <div className="space-y-1.5">
                {c.orders.map((o) => (
                  <a
                    key={o.id}
                    href={`/admin/orders/${o.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 text-[14px] px-3 py-2 rounded-lg hover:bg-[#F8F7FB] transition-colors"
                  >
                    <span className="font-mono text-[13px] text-[#444] truncate">{o.id}</span>
                    <span className="text-[13px] text-[#999] whitespace-nowrap">
                      {new Intl.DateTimeFormat('uk-UA', { timeZone: 'Europe/Kyiv', day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(o.created_at))}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-[1px] rounded-full whitespace-nowrap ${
                        STATUS_COLORS[o.status] || 'bg-[#F1F1F1] text-[#666]'
                      }`}
                    >
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                    <span className="text-[14px] font-medium whitespace-nowrap">{money(o.total_amount)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
