import crypto from 'crypto'

// PSP Platon — hosted payment form ("Платіжна форма / Еквайринг", Client-Server).
// One integration covers card / Apple Pay / Google Pay / Privat24 / "Оплата частинами":
// the payer picks the method on Platon's secure page, so we need no PCI cert,
// no Apple/Google certificates on our side.
//
// Docs: https://platon.atlassian.net/wiki/spaces/docs/pages/1315733632/Client+-+Server
//
// Flow:
//   1. POST {key, payment:'CC', data, url, sign} (form-urlencoded) to PLATON_ENDPOINT
//      → browser lands on Platon's hosted form.
//   2. After payment Platon sends an async Callback to the URL you registered with
//      Platon support — that Callback (NOT the browser redirect) is the source of
//      truth for marking an order paid. See src/app/api/platon/callback (TODO: needs
//      the documented callback signature format + the URL registered with Platon).

export const PLATON_ENDPOINT = 'https://secure.platononline.com/payment/auth'

function strrev(s: string): string {
  return s.split('').reverse().join('')
}

export type PlatonAuthInput = {
  orderId: string
  /** Authoritative amount — always taken from the server-side order row. */
  amount: number
  description: string
  /** Success redirect; Platon appends ?order=<id>. */
  successUrl: string
  errorUrl?: string
  email?: string | null
  phone?: string | null
}

export type PlatonAuthForm = {
  endpoint: string
  fields: { key: string; payment: 'CC'; data: string; url: string; sign: string }
}

/**
 * Build the signed form fields for Platon's hosted payment form.
 *
 * sign = md5(strtoupper(
 *   strrev(key) . strrev(payment) . strrev(data) . strrev(url) . strrev(PASSWORD)
 * ))
 *
 * `data` is base64(JSON) of the order details. Amounts MUST be "1000.00" format.
 */
export function buildPlatonAuthForm(
  input: PlatonAuthInput,
  key: string,
  password: string
): PlatonAuthForm {
  const payment = 'CC' as const

  const dataObj: Record<string, string> = {
    amount: input.amount.toFixed(2), // e.g. "100.00" — Platon rejects "100" / "100.0"
    currency: 'UAH',
    description: input.description.slice(0, 2500),
    order: input.orderId.slice(0, 255),
    lang: 'UK',
  }
  if (input.errorUrl) dataObj.error_url = input.errorUrl
  if (input.email) dataObj.email = input.email
  if (input.phone) dataObj.phone = input.phone

  const data = Buffer.from(JSON.stringify(dataObj), 'utf8').toString('base64')
  const url = input.successUrl

  const signBase = (
    strrev(key) + strrev(payment) + strrev(data) + strrev(url) + strrev(password)
  ).toUpperCase()
  const sign = crypto.createHash('md5').update(signBase, 'utf8').digest('hex')

  return { endpoint: PLATON_ENDPOINT, fields: { key, payment, data, url, sign } }
}

function md5Upper(input: string): string {
  return crypto.createHash('md5').update(input.toUpperCase(), 'utf8').digest('hex')
}

/**
 * Verify a Platon Callback signature. The Callback is the ONLY trustworthy
 * confirmation of payment (the browser redirect is not). On a failed payment
 * Platon sends no callback, so a valid callback with status 'SALE' = paid.
 *
 * Card / Apple Pay / Google Pay:
 *   sign = md5(strtoupper( strrev(email) . pass . order . strrev(card6 . card4) ))
 * "Оплата частинами" (callback carries `number` instead of `card`):
 *   sign = md5(strtoupper( pass . order ))
 *
 * `expectedEmail` MUST be the email we sent in the create-payment request (Platon
 * signs with that exact value), i.e. the order's email — '' if none was sent.
 * `card` comes from the callback itself (we can't know the real PAN in advance).
 */
export function verifyPlatonCallback(
  body: Record<string, string>,
  password: string,
  expectedEmail: string
): boolean {
  const order = body.order ?? ''
  const provided = (body.sign ?? '').toLowerCase()
  if (!provided) return false

  // "Оплата частинами" callbacks carry a masked `number` (phone) instead of `card`.
  const isInstallment = typeof body.number === 'string' && body.number.length > 0

  let local: string
  if (isInstallment) {
    local = md5Upper(password + order)
  } else {
    const card = body.card ?? ''
    const cardPart = card ? card.slice(0, 6) + card.slice(-4) : ''
    local = md5Upper(strrev(expectedEmail) + password + order + strrev(cardPart))
  }

  // Constant-time-ish compare (both are fixed-length lowercase md5 hex).
  if (local.length !== provided.length) return false
  let diff = 0
  for (let i = 0; i < local.length; i++) diff |= local.charCodeAt(i) ^ provided.charCodeAt(i)
  return diff === 0
}

export const PLATON_STATUS_ENDPOINT = 'https://secure.platononline.com/post-unq/'

/**
 * Server-to-server transaction status check (reconciliation fallback when a
 * callback was missed). Requires Platon to whitelist our server IPs first.
 *   hash = md5(strtoupper( client_pass . order_id ))
 * Returns the parsed JSON response, or null on network error.
 */
export async function checkPlatonStatus(
  orderId: string,
  key: string,
  password: string
): Promise<unknown | null> {
  const hash = md5Upper(password + orderId)
  const params = new URLSearchParams({
    action: 'GET_TRANS_STATUS_BY_ORDER',
    client_key: key,
    order_id: orderId,
    hash,
  })
  try {
    const res = await fetch(PLATON_STATUS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
    return await res.json().catch(() => null)
  } catch {
    return null
  }
}
