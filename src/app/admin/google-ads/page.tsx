import Link from 'next/link'
import { isAuthed } from '@/lib/adminAuth'
import { getGoogleAdsOrders, getOrderItems, type OrderItem } from '@/lib/userStore'
import { parseAdAttribution } from '@/lib/adAttribution'

export const dynamic = 'force-dynamic'

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('uk-UA', {
      timeZone: 'Europe/Kyiv',
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function timeBetween(fromIso: string, toIso: string) {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime()
  if (!Number.isFinite(ms) || ms < 0) return '—'
  const min = Math.round(ms / 60000)
  if (min < 60) return `${min} хв`
  const h = Math.round(min / 60)
  if (h < 48) return `${h} год`
  return `${Math.round(h / 24)} дн`
}

const MATCH_TYPES: Record<string, string> = { e: 'точна', p: 'фразова', b: 'широка' }
const NETWORKS: Record<string, string> = {
  g: 'Пошук Google', s: 'Пошукові партнери', d: 'Медійна мережа', ytv: 'YouTube', x: 'Performance Max',
}
const DEVICES: Record<string, string> = { m: 'телефон', t: 'планшет', c: 'комп’ютер' }
const STATUS: Record<string, string> = {
  pending: 'Нове', confirmed: 'Підтверджено', processing: 'В роботі', shipped: 'Відправлено',
  delivered: 'Доставлено', cancelled: 'Скасовано',
}
const PAY: Record<string, string> = { pending: 'очікує', paid: 'оплачено', failed: 'не пройшла', refunded: 'повернено' }
const PAY_METHOD: Record<string, string> = {
  cash_on_delivery: 'Накладений платіж', platon: 'Картка онлайн', card: 'На картку', bank_transfer: 'Рахунок ФОП',
}

function landingPath(url: string) {
  try {
    const u = new URL(url)
    return u.pathname || '/'
  } catch {
    return url || '—'
  }
}

export default async function AdminGoogleAdsPage() {
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

  const orders = await getGoogleAdsOrders(500)
  const itemsByOrder = new Map<string, OrderItem[]>()
  await Promise.all(
    orders.map(async (o) => {
      itemsByOrder.set(o.id, await getOrderItems(o.id))
    }),
  )

  const active = orders.filter((o) => o.status !== 'cancelled' && o.payment_status !== 'failed')
  const revenue = active.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)

  return (
    <main className="min-h-screen bg-[#F8F7FB] py-10">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="font-bebas text-[28px] sm:text-[40px] leading-none text-black">Замовлення з Google Ads</h1>
            <p className="text-[14px] text-[#666] mt-1">
              Замовлень: {orders.length} · Без скасованих: {active.length} · Сума: ₴{revenue.toFixed(0)}
            </p>
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

        <div className="bg-white rounded-2xl p-4 sm:p-5 mb-6 text-[13px] text-[#555] leading-relaxed">
          Тут збираються замовлення людей, які прийшли на сайт після кліку по рекламі Google (до 30 днів від кліку).
          «Ключове слово» — слово з кампанії, на яке спрацювала реклама. Точні пошукові запити видно в Google Ads:
          Кампанії → Аналітика → «Пошукові запити».
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-[#666]">
            Поки що жодного замовлення з реклами Google.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const attr = parseAdAttribution(o.ad_attribution)
              const p = attr?.params ?? {}
              const keyword = p.keyword || p.utm_term || ''
              const items = itemsByOrder.get(o.id) ?? []
              return (
                <div key={o.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold text-[#4348AE] hover:underline">
                        #{o.id}
                      </Link>
                      <div className="text-[13px] text-[#666] mt-0.5">Замовлено: {formatDate(o.created_at)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bebas text-[28px] leading-none">₴{Number(o.total_amount).toFixed(0)}</div>
                      <div className="text-[12px] text-[#666] mt-1">
                        {STATUS[o.status] || o.status} · оплата: {PAY[o.payment_status] || o.payment_status}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[14px] mb-4">
                    <div><span className="text-[#999]">Ключове слово:</span> <b>{keyword || '—'}</b>{p.matchtype ? ` (${MATCH_TYPES[p.matchtype] || p.matchtype})` : ''}</div>
                    <div><span className="text-[#999]">Кампанія:</span> {p.utm_campaign || p.campaignid || '—'}</div>
                    <div><span className="text-[#999]">Де показано:</span> {p.network ? NETWORKS[p.network] || p.network : '—'}</div>
                    <div><span className="text-[#999]">Пристрій:</span> {p.device ? DEVICES[p.device] || p.device : '—'}</div>
                    <div><span className="text-[#999]">Клік по рекламі:</span> {formatDate(attr?.clicked_at)}</div>
                    <div><span className="text-[#999]">Від кліку до замовлення:</span> {attr ? timeBetween(attr.clicked_at, o.created_at) : '—'}</div>
                    <div className="sm:col-span-2 break-all"><span className="text-[#999]">Сторінка входу:</span> {attr ? landingPath(attr.landing_url) : '—'}</div>
                    <div><span className="text-[#999]">Оплата:</span> {PAY_METHOD[o.payment_method] || o.payment_method}</div>
                    <div><span className="text-[#999]">Місто:</span> {o.shipping_city || '—'}</div>
                  </div>

                  {items.length > 0 && (
                    <div className="border-t border-[#EEE] pt-3 space-y-1.5">
                      {items.map((it) => (
                        <div key={it.id} className="flex justify-between gap-4 text-[14px]">
                          <span>{it.product_name} <span className="text-[#999]">× {it.quantity}</span></span>
                          <span className="whitespace-nowrap">₴{(it.price * it.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
