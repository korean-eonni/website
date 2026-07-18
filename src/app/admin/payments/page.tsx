import Link from 'next/link'
import { isAuthed } from '@/lib/adminAuth'
import { getAdminEmailEvents, getAdminOrders } from '@/lib/adminData'

export const dynamic = 'force-dynamic'

const paymentLabels: Record<string, string> = {
  platon: 'Карткою онлайн',
  card: 'Переказ на картку',
  cash_on_delivery: 'Накладений платіж',
}

function date(value: string | null) {
  return value ? new Date(value).toLocaleString('uk-UA') : '—'
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {
  if (!isAuthed()) return null
  const [orders, emailData] = await Promise.all([getAdminOrders(), getAdminEmailEvents()])
  const status = searchParams?.status || 'all'
  const paymentOrders = orders.filter((order) => status === 'all' || order.payment_status === status)
  const paid = orders.filter((order) => order.payment_status === 'paid').length
  const failed = orders.filter((order) => order.payment_status === 'failed').length

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6046A3]">Finance & delivery</p>
        <h1 className="mt-2 text-3xl font-semibold">Оплати та email-квитанції</h1>
        <p className="mt-1 text-sm text-black/50">Єдина точка контролю платежів і відправлення підтверджень покупцям.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ['Оплачено', paid, 'bg-emerald-50 text-emerald-800'],
          ['Очікує', orders.filter((order) => order.payment_status === 'pending').length, 'bg-amber-50 text-amber-900'],
          ['Помилка', failed, 'bg-red-50 text-red-800'],
        ].map(([label, value, tone]) => (
          <div key={String(label)} className={`rounded-2xl border border-black/10 p-5 ${tone}`}>
            <p className="text-xs opacity-70">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          ['Email усього', emailData.analytics.total],
          ['Надіслано', emailData.analytics.sent],
          ['У черзі', emailData.analytics.queued],
          ['Помилки', emailData.analytics.failed],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-black/10 bg-white px-4 py-3">
            <p className="text-xs text-black/45">{label}</p>
            <p className="mt-1 text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
            <div>
              <h2 className="font-semibold">Платежі</h2>
              <p className="text-xs text-black/45">{paymentOrders.length} записів</p>
            </div>
            <div className="flex gap-1">
              {['all', 'pending', 'paid', 'failed', 'refunded'].map((item) => (
                <Link key={item} href={`/admin/payments?status=${item}`} className={`rounded-lg px-2.5 py-1.5 text-xs ${status === item ? 'bg-[#17131F] text-white' : 'bg-black/5'}`}>
                  {item === 'all' ? 'Усі' : item}
                </Link>
              ))}
            </div>
          </div>
          <div className="max-h-[680px] overflow-auto">
            {paymentOrders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between gap-4 border-t border-black/[0.06] px-5 py-4 first:border-0 hover:bg-black/[0.02]">
                <div>
                  <p className="font-mono text-xs font-semibold">{order.id}</p>
                  <p className="mt-1 text-xs text-black/45">{paymentLabels[order.payment_method] || order.payment_method} · {date(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{order.total_amount.toLocaleString('uk-UA')} ₴</p>
                  <p className={`text-xs ${order.payment_status === 'paid' ? 'text-emerald-700' : order.payment_status === 'failed' ? 'text-red-700' : 'text-amber-700'}`}>{order.payment_status}</p>
                </div>
              </Link>
            ))}
            {!paymentOrders.length && <p className="p-10 text-center text-sm text-black/45">Платежів немає.</p>}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div className="border-b border-black/10 px-5 py-4">
            <h2 className="font-semibold">Журнал email</h2>
            <p className="text-xs text-black/45">Квитанції, підтвердження та помилки доставки</p>
          </div>
          {!emailData.available ? (
            <div className="p-6">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Журнал email ще не створено або локальна база не підключена. Після активації сервісу
                квитанцій тут автоматично з’являться статуси sent / failed та зв’язок із замовленням.
              </div>
            </div>
          ) : emailData.events.length ? (
            <div className="max-h-[680px] overflow-auto">
              {emailData.events.map((event) => (
                <div key={event.id} className="border-t border-black/[0.06] px-5 py-4 first:border-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{event.recipient}</p>
                      <p className="mt-1 text-xs text-black/45">{event.kind} · {date(event.created_at)}</p>
                      {event.order_id && <Link href={`/admin/orders/${event.order_id}`} className="mt-1 block font-mono text-xs text-[#6046A3]">{event.order_id}</Link>}
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs ${event.status === 'sent' ? 'bg-emerald-50 text-emerald-700' : event.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-black/5'}`}>
                      {event.status}
                    </span>
                  </div>
                  {event.error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{event.error}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="p-10 text-center text-sm text-black/45">Email-подій поки немає.</p>
          )}
        </section>
      </div>
    </main>
  )
}
