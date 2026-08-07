import Link from 'next/link'
import { isAuthed } from '@/lib/adminAuth'
import { getRestockRequests } from '@/lib/userStore'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('uk-UA', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default async function AdminRestockPage() {
  if (!isAuthed()) {
    return (
      <main className="min-h-screen bg-[#F8F7FB] flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="font-bebas text-[40px] text-black mb-4">Потрібен вхід</h1>
          <Link href="/admin" className="inline-block px-6 py-3 bg-[#4348AE] text-white rounded-lg font-semibold">
            Перейти до входу
          </Link>
        </div>
      </main>
    )
  }

  const requests = await getRestockRequests(500)

  // Group by product so it's easy to see demand per item.
  const byProduct = new Map<string, { name: string; contacts: { contact: string; created_at: string }[] }>()
  for (const r of requests) {
    const key = r.product_name || r.product_id || '—'
    if (!byProduct.has(key)) byProduct.set(key, { name: r.product_name || r.product_id || '—', contacts: [] })
    byProduct.get(key)!.contacts.push({ contact: r.contact, created_at: r.created_at })
  }
  const groups = Array.from(byProduct.values()).sort((a, b) => b.contacts.length - a.contacts.length)

  return (
    <main className="min-h-screen bg-[#F8F7FB] py-10">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="font-bebas text-[26px] sm:text-[40px] leading-tight sm:leading-none text-black break-words">Запити «Повідомити, коли з&apos;явиться»</h1>
            <p className="text-[14px] text-[#666] mt-1">Усього запитів: {requests.length} · Товарів: {groups.length}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link href="/admin/orders" className="h-10 px-4 inline-flex items-center rounded-lg border border-black text-black uppercase text-[14px] hover:bg-black hover:text-white transition-colors">
              Замовлення
            </Link>
            <Link href="/admin" className="h-10 px-4 inline-flex items-center rounded-lg border border-black text-black uppercase text-[14px] hover:bg-black hover:text-white transition-colors">
              Товари
            </Link>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-10 text-center text-[#666]">
            Поки немає запитів.
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((g) => (
              <div key={g.name} className="bg-white rounded-2xl border border-[#E5E5E5] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="font-semibold text-[15px] text-black break-words min-w-0">{g.name}</p>
                  <span className="text-[12px] px-2 py-[2px] rounded-full bg-[#F5F3FF] text-[#4348AE] font-medium whitespace-nowrap">
                    {g.contacts.length} {g.contacts.length === 1 ? 'запит' : 'запитів'}
                  </span>
                </div>
                <ul className="space-y-1">
                  {g.contacts.map((c, i) => (
                    <li key={i} className="flex flex-wrap items-center justify-between gap-2 text-[14px] border-t border-[#EEE] pt-2 first:border-0 first:pt-0">
                      <a href={c.contact.includes('@') ? `mailto:${c.contact}` : `tel:${c.contact}`} className="text-[#4348AE] hover:underline">
                        {c.contact}
                      </a>
                      <span className="text-[12px] text-[#999]">{formatDate(c.created_at)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
