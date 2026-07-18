import { isAuthed } from '@/lib/adminAuth'
import { getSystemStatus } from '@/lib/adminData'

export const dynamic = 'force-dynamic'

function date(value: string | null) {
  return value ? new Date(value).toLocaleString('uk-UA') : 'Немає даних'
}

export default async function AdminSystemPage() {
  if (!isAuthed()) return null
  const status = await getSystemStatus()

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6046A3]">Health check</p>
        <h1 className="mt-2 text-3xl font-semibold">Система та інтеграції</h1>
        <p className="mt-1 text-sm text-black/50">Read-only діагностика конфігурації без показу секретів.</p>
      </div>

      {!status.databaseConfigured && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          POSTGRES_URL не задано в локальному середовищі. Це очікувано для offline-режиму; production
          Vercel має бути підключений.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Інтеграції</h2>
          <div className="mt-4 space-y-3">
            {status.integrations.map((integration) => (
              <div key={integration.name} className="flex items-start justify-between gap-4 rounded-xl bg-[#F5F4F8] p-4">
                <div>
                  <p className="text-sm font-medium">{integration.name}</p>
                  <p className="mt-1 text-xs text-black/45">{integration.detail}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs ${integration.configured ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {integration.configured ? 'Налаштовано' : 'Відсутнє'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Таблиці Postgres</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {status.tables.map((table) => (
              <div key={table.name} className="flex items-center justify-between rounded-xl border border-black/[0.07] px-3 py-3">
                <code className="text-xs">{table.name}</code>
                <span aria-label={table.present ? 'існує' : 'відсутня'} className={`h-2.5 w-2.5 rounded-full ${table.present ? 'bg-emerald-500' : 'bg-red-400'}`} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="rounded-2xl border border-black/10 bg-[#17131F] p-5 text-white">
          <p className="text-xs text-white/50">Остання синхронізація каталогу</p>
          <p className="mt-3 text-lg font-semibold">{date(status.catalogUpdatedAt)}</p>
          <p className="mt-2 text-xs text-white/45">Час останнього updated_at у products</p>
        </section>
        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Обсяг даних</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {status.counts.map((count) => (
              <div key={count.label} className="rounded-xl bg-[#F5F4F8] p-4">
                <p className="text-2xl font-semibold">{count.value ?? '—'}</p>
                <p className="mt-1 text-xs text-black/45">{count.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
