import { isAuthed } from '@/lib/adminAuth'
import { getAdminSubscribers } from '@/lib/adminData'

export const dynamic = 'force-dynamic'

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams?: { q?: string }
}) {
  if (!isAuthed()) return null
  const subscribers = await getAdminSubscribers()
  const query = (searchParams?.q || '').trim().toLowerCase()
  const filtered = subscribers.filter((subscriber) =>
    !query ||
    (subscriber.email || '').toLowerCase().includes(query) ||
    (subscriber.phone || '').includes(query)
  )

  return (
    <main className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6046A3]">Audience</p>
        <h1 className="mt-2 text-3xl font-semibold">Підписники</h1>
        <p className="mt-1 text-sm text-black/50">{subscribers.length} контактів із форми підписки.</p>
      </div>
      <form className="mb-5 flex gap-3 rounded-2xl border border-black/10 bg-white p-4">
        <input name="q" defaultValue={searchParams?.q} placeholder="Email або телефон" className="h-11 min-w-0 flex-1 rounded-xl border border-black/15 px-4 text-sm outline-none focus:border-[#6046A3]" />
        <button className="h-11 rounded-xl bg-[#17131F] px-5 text-sm font-semibold text-white">Знайти</button>
      </form>
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-black/[0.025] text-[11px] uppercase tracking-wider text-black/45">
              <tr>
                <th className="px-5 py-3 font-medium">Контакт</th>
                <th className="px-5 py-3 font-medium">Канал</th>
                <th className="px-5 py-3 font-medium">Джерело</th>
                <th className="px-5 py-3 text-right font-medium">Дата</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((subscriber) => (
                <tr key={subscriber.id} className="border-t border-black/[0.06]">
                  <td className="px-5 py-4 font-medium">
                    {subscriber.email ? <a href={`mailto:${subscriber.email}`} className="hover:text-[#6046A3]">{subscriber.email}</a> : <a href={`tel:${subscriber.phone}`} className="hover:text-[#6046A3]">{subscriber.phone}</a>}
                  </td>
                  <td className="px-5 py-4">{subscriber.email ? 'Email' : 'Телефон'}</td>
                  <td className="px-5 py-4 text-black/50">{subscriber.source || 'newsletter'}</td>
                  <td className="px-5 py-4 text-right text-black/50">{new Date(subscriber.created_at).toLocaleString('uk-UA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <p className="p-10 text-center text-sm text-black/45">Контактів не знайдено.</p>}
      </div>
    </main>
  )
}
