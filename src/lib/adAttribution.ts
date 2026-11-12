/**
 * Google Ads click attribution.
 *
 * When a visitor lands from an ad, Google adds `gclid` (auto-tagging) and our
 * account-level Final URL suffix adds `utm_*` + `keyword`/`matchtype`/… .
 * We keep the last ad click in localStorage for 30 days and attach it to the
 * order, so the admin "Google Ads" tab can show which keyword brought a sale.
 */

export const AD_ATTR_STORAGE_KEY = 'eonni_ad_attr'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

export const AD_ATTR_PARAMS = [
  'gclid',
  'gbraid',
  'wbraid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'keyword',
  'matchtype',
  'campaignid',
  'adgroupid',
  'network',
  'device',
] as const

export type AdAttribution = {
  /** ISO time of the ad click (landing) */
  clicked_at: string
  landing_url: string
  referrer: string | null
  params: Partial<Record<(typeof AD_ATTR_PARAMS)[number], string>>
}

export function isGoogleAdsClick(params: AdAttribution['params']): boolean {
  if (params.gclid || params.gbraid || params.wbraid) return true
  const src = (params.utm_source || '').toLowerCase()
  const med = (params.utm_medium || '').toLowerCase()
  return src === 'google' && (med === 'cpc' || med === 'ppc' || med === 'paid')
}

/** Browser only: remember the ad click from the current URL, if any. */
export function captureAdAttributionFromUrl(): void {
  try {
    const url = new URL(window.location.href)
    const params: AdAttribution['params'] = {}
    for (const key of AD_ATTR_PARAMS) {
      const v = url.searchParams.get(key)
      if (v) params[key] = v.slice(0, 300)
    }
    if (!isGoogleAdsClick(params)) return
    const data: AdAttribution = {
      clicked_at: new Date().toISOString(),
      landing_url: url.toString().slice(0, 1000),
      referrer: document.referrer ? document.referrer.slice(0, 500) : null,
      params,
    }
    localStorage.setItem(AD_ATTR_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // storage blocked — nothing to do
  }
}

/** Browser only: the stored ad click if it is younger than 30 days. */
export function readAdAttribution(): AdAttribution | null {
  try {
    const raw = localStorage.getItem(AD_ATTR_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as AdAttribution
    const age = Date.now() - new Date(data.clicked_at).getTime()
    if (!(age >= 0 && age <= MAX_AGE_MS)) return null
    return data
  } catch {
    return null
  }
}

/** Server: validate/trim client-supplied attribution before storing it. */
export function sanitizeAdAttribution(input: unknown): string | null {
  if (!input || typeof input !== 'object') return null
  const obj = input as Record<string, unknown>
  const rawParams = (obj.params && typeof obj.params === 'object' ? obj.params : {}) as Record<string, unknown>
  const params: AdAttribution['params'] = {}
  for (const key of AD_ATTR_PARAMS) {
    const v = rawParams[key]
    if (typeof v === 'string' && v) params[key] = v.slice(0, 300)
  }
  if (!isGoogleAdsClick(params)) return null
  const clicked = typeof obj.clicked_at === 'string' ? obj.clicked_at.slice(0, 40) : ''
  const data: AdAttribution = {
    clicked_at: Number.isNaN(new Date(clicked).getTime()) ? new Date().toISOString() : clicked,
    landing_url: typeof obj.landing_url === 'string' ? obj.landing_url.slice(0, 1000) : '',
    referrer: typeof obj.referrer === 'string' ? obj.referrer.slice(0, 500) : null,
    params,
  }
  return JSON.stringify(data)
}

export function parseAdAttribution(raw: string | null | undefined): AdAttribution | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdAttribution
  } catch {
    return null
  }
}
