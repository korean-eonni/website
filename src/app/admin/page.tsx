import Link from 'next/link'
import { isAuthed } from '@/lib/adminAuth'
import { getDashboardData } from '@/lib/adminData'

export const dynamic = 'force-dynamic'

const paymentLabels: Record<string, string> = {
  platon: 'Карткою онлайн',
  card: 'Переказ на картку',
  cash_on_delivery: 'Накладений платіж',
}

function money(value: number) {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('uk-UA', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusLabel(status: string) {
  return {
    pending: 'Новий',
    confirmed: 'Підтверджено',
    processing: 'В роботі',
    shipped: 'Відправлено',
    delivered: 'Доставлено',
    cancelled: 'Скасовано',
  }[status] || status
}

export default async function AdminDashboardPage() {
  if (!isAuthed()) return null
  const data = await getDashboardData()

  const primaryMetrics = [
    { label: 'Оплачена виручка', value: money(data.revenue), hint: `${data.paidOrders} оплачених замовлень` },
    { label: 'Замовлення', value: String(data.orderCount), hint: `${data.pendingOrders} нових потребують уваги` },
    { label: 'Клієнти', value: String(data.customerCount), hint: 'Акаунти та гостьові покупці' },
    { label: 'Середній чек', value: money(data.averageOrderValue), hint: 'За всіма замовленнями' },
  ]

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#6046A3]">
            Операційний огляд
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Що відбувається в Eonni</h1>
          <p className="mt-2 max-w-2xl text-sm text-black/55">
            Продажі, клієнти, склад, платежі та задачі, що потребують реакції.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/orders" className="rounded-xl bg-[#17131F] px-4 py-2.5 text-sm font-semibold text-white">
            Відкрити замовлення
          </Link>
          <Link href="/admin/products" className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold">
            Керувати товарами
          </Link>
        </div>
      </div>

      {!data.databaseConfigured && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Локально POSTGRES_URL не задано, тому показані порожні безпечні стани. На Vercel дані
          підтягнуться з production Postgres.
        </div>
      )}
      {data.loadError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          Частину показників не вдалося завантажити. Перевірте сторінку «Система».
        </div>
      )}

      <section aria-label="Ключові показники" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryMetrics.map((metric, index) => (
          <article
            key={metric.label}
            className={`rounded-2xl border p-5 ${
              index === 0 ? 'border-[#17131F] bg-[#17131F] text-white' : 'border-black/10 bg-white'
            }`}
          >
            <p className={`text-xs font-medium ${index === 0 ? 'text-white/55' : 'text-black/45'}`}>
              {metric.label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{metric.value}</p>
            <p className={`mt-2 text-xs ${index === 0 ? 'text-white/55' : 'text-black/45'}`}>{metric.hint}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
            <div>
              <h2 className="font-semibold">Останні замовлення</h2>
              <p className="text-xs text-black/45">Найновіші операції магазину</p>
            </div>
            <Link href="/admin/orders" className="text-sm font-semibold text-[#6046A3]">Усі →</Link>
          </div>
          {data.recentOrders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-black/[0.025] text-[11px] uppercase tracking-wider text-black/45">
                  <tr>
                    <th className="px-5 py-3 font-medium">Замовлення</th>
                    <th className="px-5 py-3 font-medium">Клієнт</th>
                    <th className="px-5 py-3 font-medium">Статус</th>
                    <th className="px-5 py-3 text-right font-medium">Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-black/[0.06]">
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-semibold hover:text-[#6046A3]">
                          {order.id}
                        </Link>
                        <span className="mt-1 block text-xs text-black/40">{formatDate(order.created_at)}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-medium">{order.first_name} {order.last_name}</span>
                        <span className="block text-xs text-black/45">{order.email}</span>
                      </td>
                      <td className="px-5 py-3">{statusLabel(order.status)}</td>
                      <td className="px-5 py-3 text-right font-semibold">{money(order.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-12 text-center text-sm text-black/45">Замовлень поки немає.</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="font-semibold">Потребує уваги</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ['Нові замовлення', data.pendingOrders, '/admin/orders?status=pending'],
                ['Закінчилися', data.outOfStock, '/admin/inventory?stock=out'],
                ['Мало на складі', data.lowStock, '/admin/inventory?stock=low'],
                ['Невдалі оплати', data.failedPayments, '/admin/payments?status=failed'],
                ['Відгуки', data.pendingReviews, '/admin/reviews'],
                ['Запити на товар', data.restockRequests, '/admin/restock'],
              ].map(([label, value, href]) => (
                <Link key={String(label)} href={String(href)} className="rounded-xl bg-[#F5F4F8] p-3 transition hover:bg-[#EAE7F2]">
                  <span className="block text-2xl font-semibold">{value}</span>
                  <span className="text-xs text-black/50">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="font-semibold">Способи оплати</h2>
            <div className="mt-4 space-y-3">
              {data.paymentBreakdown.length ? data.paymentBreakdown.map((payment) => (
                <div key={payment.label} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{paymentLabels[payment.label] || payment.label}</p>
                    <p className="text-xs text-black/45">{payment.count} замовлень</p>
                  </div>
                  <p className="text-sm font-semibold">{money(payment.amount)}</p>
                </div>
              )) : <p className="text-sm text-black/45">Даних ще немає.</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Активні товари', data.activeProducts, '/admin/products'],
          ['Підписники', data.subscribers, '/admin/subscribers'],
          ['Складські ризики', data.lowStock + data.outOfStock, '/admin/inventory'],
          ['Email-квитанції', 'Статус', '/admin/payments'],
        ].map(([label, value, href]) => (
          <Link key={String(label)} href={String(href)} className="rounded-2xl border border-black/10 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-xs text-black/45">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </Link>
        ))}
      </section>
    </main>
  )
}
