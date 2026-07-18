import { isAuthed } from '@/lib/adminAuth'
import { getAdminCustomers } from '@/lib/adminData'

export const dynamic = 'force-dynamic'

function money(value: number) {
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }).format(value)
}

function date(value: string | null) {
  return value ? new Date(value).toLocaleDateString('uk-UA') : '—'
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams?: { q?: string; type?: string }
}) {
  if (!isAuthed()) return null
  const customers = await getAdminCustomers()
  const query = (searchParams?.q || '').trim().toLowerCase()
  const type = searchParams?.type || 'all'
  const filtered = customers.filter((customer) => {
    const matchesQuery =
      !query ||
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      (customer.phone || '').includes(query)
    const matchesType =
      type === 'all' || (type === 'registered' ? customer.registered : !customer.registered)
    return matchesQuery && matchesType
  })

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6046A3]">CRM</p>
        <h1 className="mt-2 text-3xl font-semibold">Клієнти</h1>
        <p className="mt-1 text-sm text-black/50">
          {customers.length} унікальних покупців · lifetime value рахується лише за оплаченими замовленнями.
        </p>
      </div>

      <form className="mb-5 grid gap-3 rounded-2xl border border-black/10 bg-white p-4 sm:grid-cols-[1fr_200px_auto]">
        <input
          name="q"
          defaultValue={searchParams?.q}
          placeholder="Ім’я, email або телефон"
          className="h-11 rounded-xl border border-black/15 px-4 text-sm outline-none focus:border-[#6046A3]"
        />
        <select name="type" defaultValue={type} className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm">
          <option value="all">Усі клієнти</option>
          <option value="registered">З акаунтом</option>
          <option value="guest">Гостьові</option>
        </select>
        <button className="h-11 rounded-xl bg-[#17131F] px-5 text-sm font-semibold text-white">Знайти</button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-black/[0.025] text-[11px] uppercase tracking-wider text-black/45">
              <tr>
                <th className="px-5 py-3 font-medium">Клієнт</th>
                <th className="px-5 py-3 font-medium">Контакти</th>
                <th className="px-5 py-3 text-center font-medium">Замовлення</th>
                <th className="px-5 py-3 text-right font-medium">LTV</th>
                <th className="px-5 py-3 font-medium">Остання покупка</th>
                <th className="px-5 py-3 font-medium">Тип</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.key} className="border-t border-black/[0.06]">
                  <td className="px-5 py-4 font-medium">{customer.name}</td>
                  <td className="px-5 py-4">
                    {customer.email && <a href={`mailto:${customer.email}`} className="block hover:text-[#6046A3]">{customer.email}</a>}
                    {customer.phone && <a href={`tel:${customer.phone}`} className="block text-xs text-black/45 hover:text-[#6046A3]">{customer.phone}</a>}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-semibold">{customer.order_count}</span>
                    <span className="block text-xs text-black/40">{customer.paid_order_count} оплачених</span>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">{money(customer.lifetime_value)}</td>
                  <td className="px-5 py-4">{date(customer.last_order_at)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${customer.registered ? 'bg-emerald-50 text-emerald-700' : 'bg-black/5 text-black/55'}`}>
                      {customer.registered ? 'Акаунт' : 'Гість'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <p className="px-5 py-12 text-center text-sm text-black/45">Клієнтів за цими умовами не знайдено.</p>}
      </div>
    </main>
  )
}
