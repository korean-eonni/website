import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { isAuthed } from '@/lib/adminAuth'
import { getAdminInventory } from '@/lib/adminData'
import {
  getStockSyncStatus,
  processStockSyncQueue,
  queueFullStockReconciliation,
} from '@/lib/stockSync'

export const dynamic = 'force-dynamic'

type StockSyncView = {
  available: boolean
  pending: number
  failed: number
  lastSuccess: string | null
  lastError: string | null
}

function numberField(record: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const parsed = Number(record[key])
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

function stringField(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return null
}

function normalizeSyncStatus(value: unknown): StockSyncView {
  if (!value || typeof value !== 'object') {
    return { available: false, pending: 0, failed: 0, lastSuccess: null, lastError: null }
  }
  const record = value as Record<string, unknown>
  return {
    available:
      typeof record.configured === 'boolean'
        ? record.configured
        : record.available !== false,
    pending: numberField(record, 'pending', 'pendingCount', 'pending_count'),
    failed: numberField(record, 'failed', 'failedCount', 'failed_count'),
    lastSuccess: stringField(
      record,
      'lastSuccess',
      'lastSuccessAt',
      'lastSyncedAt',
      'last_success',
      'last_success_at',
      'last_synced_at'
    ),
    lastError: stringField(record, 'lastError', 'lastErrorAt', 'last_error', 'last_error_at'),
  }
}

async function reconcileStockAction() {
  'use server'
  if (!isAuthed()) redirect('/admin')

  let succeeded = false
  try {
    await queueFullStockReconciliation()
    const result = await processStockSyncQueue({ limit: 500 })
    succeeded = result.acquired && result.failed === 0
  } catch (error) {
    console.error('[admin/inventory] full stock reconciliation failed:', error)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/inventory')
  redirect(`/admin/inventory?sync=${succeeded ? 'success' : 'error'}`)
}

function money(value: number | null) {
  return value === null ? '—' : `${new Intl.NumberFormat('uk-UA').format(value)} ₴`
}

function formatSyncDate(value: string | null) {
  if (!value) return 'Ще не було'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('uk-UA')
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams?: { q?: string; stock?: string; sync?: string }
}) {
  if (!isAuthed()) return null
  const [inventory, rawSyncStatus] = await Promise.all([
    getAdminInventory(),
    process.env.POSTGRES_URL
      ? getStockSyncStatus().catch((error) => {
          console.error('[admin/inventory] stock sync status unavailable:', error)
          return null
        })
      : Promise.resolve(null),
  ])
  const syncStatus = normalizeSyncStatus(rawSyncStatus)
  const query = (searchParams?.q || '').trim().toLowerCase()
  const stock = searchParams?.stock || 'all'
  const filtered = inventory.filter((item) => {
    const quantity = item.stock_quantity ?? 0
    const matchesQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      (item.sku || '').toLowerCase().includes(query) ||
      (item.brand || '').toLowerCase().includes(query)
    const matchesStock =
      stock === 'all' ||
      (stock === 'out' && quantity <= 0 && !item.coming_soon) ||
      (stock === 'low' && quantity > 0 && quantity <= 5) ||
      (stock === 'healthy' && quantity > 5) ||
      (stock === 'soon' && Boolean(item.coming_soon))
    return matchesQuery && matchesStock
  })
  const out = inventory.filter((item) => (item.stock_quantity ?? 0) <= 0 && !item.coming_soon).length
  const low = inventory.filter((item) => (item.stock_quantity ?? 0) > 0 && (item.stock_quantity ?? 0) <= 5).length

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6046A3]">Inventory</p>
          <h1 className="mt-2 text-3xl font-semibold">Склад і залишки</h1>
          <p className="mt-1 text-sm text-black/50">{inventory.length} SKU · {low} мало · {out} закінчилися</p>
        </div>
        <Link href="/admin/products" className="rounded-xl bg-[#17131F] px-4 py-2.5 text-sm font-semibold text-white">
          Керування каталогом
        </Link>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          ['Усього SKU', inventory.length, 'bg-white'],
          ['Мало (1–5)', low, 'bg-amber-50'],
          ['Немає', out, 'bg-red-50'],
        ].map(([label, value, color]) => (
          <div key={String(label)} className={`rounded-2xl border border-black/10 p-4 ${color}`}>
            <p className="text-xs text-black/45">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {searchParams?.sync === 'success' && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          Звірку складу запущено та поточну чергу оброблено. Відкладені повтори продовжать
          синхронізацію автоматично, якщо Google Sheet тимчасово недоступний.
        </div>
      )}
      {searchParams?.sync === 'error' && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          Повну звірку не вдалося завершити зараз. Зміни залишаються в черзі для безпечної повторної
          спроби; перевірте статус нижче.
        </div>
      )}

      <section className="mb-5 rounded-2xl border border-black/10 bg-white p-5">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">Синхронізація залишків</h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs ${
                  syncStatus.available
                    ? syncStatus.failed > 0
                      ? 'bg-red-50 text-red-700'
                      : syncStatus.pending > 0
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-emerald-50 text-emerald-700'
                    : 'bg-black/5 text-black/50'
                }`}
              >
                {!syncStatus.available
                  ? 'Недоступно локально'
                  : syncStatus.failed > 0
                    ? 'Потрібна увага'
                    : syncStatus.pending > 0
                      ? 'Є черга'
                      : 'Синхронізовано'}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Postgres є оперативним джерелом правди: покупка одразу зменшує залишок, скасування
              повертає його. Кожна зміна негайно надсилається в Google Sheet, а при тимчасовій помилці
              автоматично повторюється через надійну чергу.
            </p>
          </div>
          <form action={reconcileStockAction}>
            <button
              type="submit"
              disabled={!syncStatus.available}
              className="w-full rounded-xl bg-[#6046A3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4D3882] disabled:cursor-not-allowed disabled:opacity-40 lg:w-auto"
            >
              Синхронізувати склад з Google Sheet
            </button>
          </form>
        </div>
        <div className="mt-5 grid gap-3 border-t border-black/[0.07] pt-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-black/40">Очікують</p>
            <p className="mt-1 text-xl font-semibold">{syncStatus.pending}</p>
          </div>
          <div>
            <p className="text-xs text-black/40">Помилки</p>
            <p className={`mt-1 text-xl font-semibold ${syncStatus.failed ? 'text-red-700' : ''}`}>
              {syncStatus.failed}
            </p>
          </div>
          <div>
            <p className="text-xs text-black/40">Останній успіх</p>
            <p className="mt-1 text-sm font-medium">{formatSyncDate(syncStatus.lastSuccess)}</p>
          </div>
          <div>
            <p className="text-xs text-black/40">Остання помилка</p>
            <p className="mt-1 truncate text-sm font-medium" title={syncStatus.lastError || undefined}>
              {syncStatus.lastError || 'Немає'}
            </p>
          </div>
        </div>
      </section>

      <form className="mb-5 grid gap-3 rounded-2xl border border-black/10 bg-white p-4 sm:grid-cols-[1fr_200px_auto]">
        <input name="q" defaultValue={searchParams?.q} placeholder="Назва, SKU або бренд" className="h-11 rounded-xl border border-black/15 px-4 text-sm outline-none focus:border-[#6046A3]" />
        <select name="stock" defaultValue={stock} className="h-11 rounded-xl border border-black/15 bg-white px-3 text-sm">
          <option value="all">Всі залишки</option>
          <option value="out">Закінчилися</option>
          <option value="low">Мало</option>
          <option value="healthy">Достатньо</option>
          <option value="soon">Скоро</option>
        </select>
        <button className="h-11 rounded-xl bg-[#17131F] px-5 text-sm font-semibold text-white">Фільтрувати</button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-black/[0.025] text-[11px] uppercase tracking-wider text-black/45">
              <tr>
                <th className="px-5 py-3 font-medium">Товар</th>
                <th className="px-5 py-3 font-medium">SKU / категорія</th>
                <th className="px-5 py-3 text-right font-medium">Ціна</th>
                <th className="px-5 py-3 text-center font-medium">Залишок</th>
                <th className="px-5 py-3 font-medium">Статус</th>
                <th className="px-5 py-3 text-right font-medium">Дія</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const quantity = item.stock_quantity ?? 0
                const tone = quantity <= 0 ? 'bg-red-50 text-red-700' : quantity <= 5 ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'
                return (
                  <tr key={item.id} className="border-t border-black/[0.06]">
                    <td className="px-5 py-4">
                      <span className="font-medium">{item.name}</span>
                      <span className="block text-xs text-black/40">{item.brand || 'Без бренду'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs">{item.sku || '—'}</span>
                      <span className="block text-xs text-black/40">{item.category || 'Без категорії'}</span>
                    </td>
                    <td className="px-5 py-4 text-right font-medium">{money(item.sale_price)}</td>
                    <td className="px-5 py-4 text-center text-lg font-semibold">{item.stock_quantity ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${tone}`}>
                        {item.coming_soon ? 'Скоро' : quantity <= 0 ? 'Немає' : quantity <= 5 ? 'Мало' : 'В наявності'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/${item.id}`} className="text-sm font-semibold text-[#6046A3]">Відкрити →</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!filtered.length && <p className="px-5 py-12 text-center text-sm text-black/45">Товарів за цими умовами не знайдено.</p>}
      </div>
      <p className="mt-4 text-xs text-black/45">
        Поточний залишок зберігається в базі Eonni: покупки зменшують його, а скасування повертає
        товар. Google Sheet автоматично отримує той самий абсолютний залишок; невдалі записи
        залишаються в черзі й повторюються без повторного списання.
      </p>
    </main>
  )
}
