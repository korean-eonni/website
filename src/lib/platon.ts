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

function constantTimeHexEqual(local: string, provided: string): boolean {
  if (!/^[a-f0-9]{32}$/i.test(local) || !/^[a-f0-9]{32}$/i.test(provided)) {
    return false
  }
  return crypto.timingSafeEqual(
    Buffer.from(local.toLowerCase(), 'hex'),
    Buffer.from(provided.toLowerCase(), 'hex')
  )
}

function cardCallbackSign(
  email: string,
  password: string,
  order: string,
  cardMask: string
): string {
  const cardPart = cardMask.slice(0, 6) + cardMask.slice(-4)
  return md5Upper(strrev(email) + password + order + strrev(cardPart))
}

export type PlatonCallbackSignatureVariant =
  | 'card'
  | 'number'
  | 'installment'

export type PlatonCallbackSignatureResult = {
  valid: boolean
  variant: PlatonCallbackSignatureVariant | null
}

/**
 * Verify a Platon Callback signature. The Callback is the ONLY trustworthy
 * confirmation of payment (the browser redirect is not). On a failed payment
 * Platon sends no callback, so a valid callback with status 'SALE' = paid.
 *
 * Card / Apple Pay / Google Pay:
 *   sign = md5(strtoupper( strrev(email) . pass . order . strrev(card6 . card4) ))
 * Privat24 may carry the mask in `number` instead of `card`, with the same
 * card-style formula.
 * "Оплата частинами":
 *   sign = md5(strtoupper( pass . order ))
 *
 * `expectedEmail` MUST be the email we sent in the create-payment request (Platon
 * signs with that exact value), i.e. the order's email — '' if none was sent.
 * The mask comes from the callback itself (we never receive or store the PAN).
 *
 * Platon's current public docs use `number` for both Privat24 and some installment
 * flows. Because both documented formulas require the merchant password, safely
 * try each applicable formula instead of guessing the payment method from the
 * field name.
 */
export function verifyPlatonCallbackSignature(
  body: Record<string, string>,
  password: string,
  expectedEmail: string
): PlatonCallbackSignatureResult {
  const order = (body.order ?? '').trim()
  const provided = (body.sign ?? '').trim()
  if (!order || !password || !provided) {
    return { valid: false, variant: null }
  }

  const candidates: Array<{
    variant: PlatonCallbackSignatureVariant
    sign: string
  }> = []
  const card = (body.card ?? '').trim()
  const number = (body.number ?? '').trim()

  if (card) {
    candidates.push({
      variant: 'card',
      sign: cardCallbackSign(expectedEmail, password, order, card),
    })
  }
  if (number) {
    candidates.push({
      variant: 'number',
      sign: cardCallbackSign(expectedEmail, password, order, number),
    })
  }
  if (card || number) {
    candidates.push({
      variant: 'installment',
      sign: md5Upper(password + order),
    })
  }

  for (const candidate of candidates) {
    if (constantTimeHexEqual(candidate.sign, provided)) {
      return { valid: true, variant: candidate.variant }
    }
  }
  return { valid: false, variant: null }
}

export function verifyPlatonCallback(
  body: Record<string, string>,
  password: string,
  expectedEmail: string
): boolean {
  return verifyPlatonCallbackSignature(body, password, expectedEmail).valid
}

export type PlatonPaymentOutcome = 'paid' | 'not_paid' | 'unknown'

const PAID_TRANSACTION_STATUSES = new Set(['SALE', 'SETTLED'])
const NOT_PAID_TRANSACTION_STATUSES = new Set([
  'DECLINED',
  'FAILED',
  'FAIL',
  'ERROR',
  'CANCELLED',
  'CANCELED',
  'REFUND',
  'REFUNDED',
  'REVERSED',
  'REVERSAL',
])

/**
 * Interpret both official Platon success representations:
 * - asynchronous Callback: status=SALE
 * - GET_TRANS_STATUS_BY_ORDER: result=SUCCESS + status=SETTLED
 *
 * `result=SUCCESS` alone only says that an API request succeeded; it must never
 * be treated as proof that money was settled.
 */
export function getPlatonPaymentOutcome(
  value: { status?: string; result?: string }
): PlatonPaymentOutcome {
  const status = (value.status ?? '').trim().toUpperCase()
  const result = (value.result ?? '').trim().toUpperCase()

  if (result && result !== 'SUCCESS') return 'not_paid'
  if (PAID_TRANSACTION_STATUSES.has(status)) return 'paid'
  if (NOT_PAID_TRANSACTION_STATUSES.has(status)) return 'not_paid'
  return 'unknown'
}

function moneyToMinorUnits(value: string | number): number | null {
  const normalized = String(value).trim()
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null
  const [whole, fraction = ''] = normalized.split('.')
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return Number.isSafeInteger(minor) ? minor : null
}

export type PlatonPaymentValidation =
  | { valid: true; amountMinor: number }
  | {
      valid: false
      reason:
        | 'not-paid'
        | 'order-mismatch'
        | 'amount-missing'
        | 'amount-invalid'
        | 'amount-mismatch'
        | 'currency-mismatch'
    }

/**
 * Validate the business fields not covered by Platon's legacy callback sign.
 * The documented signature does not include amount, currency, or status.
 */
export function validatePlatonCallbackPayment(
  body: Record<string, string>,
  expected: { orderId: string; amount: number; currency?: string }
): PlatonPaymentValidation {
  if (getPlatonPaymentOutcome(body) !== 'paid') {
    return { valid: false, reason: 'not-paid' }
  }
  if ((body.order ?? '').trim() !== expected.orderId) {
    return { valid: false, reason: 'order-mismatch' }
  }
  if (!body.amount?.trim()) {
    return { valid: false, reason: 'amount-missing' }
  }

  const callbackAmount = moneyToMinorUnits(body.amount)
  const expectedAmount = moneyToMinorUnits(expected.amount.toFixed(2))
  if (callbackAmount === null || expectedAmount === null) {
    return { valid: false, reason: 'amount-invalid' }
  }
  if (callbackAmount !== expectedAmount) {
    return { valid: false, reason: 'amount-mismatch' }
  }

  const currency = (body.currency ?? '').trim().toUpperCase()
  if (currency !== (expected.currency ?? 'UAH').trim().toUpperCase()) {
    return { valid: false, reason: 'currency-mismatch' }
  }
  return { valid: true, amountMinor: callbackAmount }
}

export const PLATON_STATUS_ENDPOINT = 'https://secure.platononline.com/post-unq/'

export type PlatonStatusCheck = {
  result: 'success' | 'error' | 'unknown'
  outcome: PlatonPaymentOutcome
  status: string | null
  orderId: string | null
  amount: string | null
  transactionId: string | null
  error: string | null
}

function stringField(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function parsePlatonStatusResponse(value: unknown): PlatonStatusCheck {
  if (!value || typeof value !== 'object') {
    return {
      result: 'unknown',
      outcome: 'unknown',
      status: null,
      orderId: null,
      amount: null,
      transactionId: null,
      error: 'invalid-response',
    }
  }

  const body = value as Record<string, unknown>
  const resultValue = stringField(body.result)?.toUpperCase() ?? ''
  const firstOrder =
    Array.isArray(body.orders) && body.orders[0] && typeof body.orders[0] === 'object'
      ? body.orders[0] as Record<string, unknown>
      : null
  const transaction = firstOrder ?? body
  const status = stringField(transaction.status)?.toUpperCase() ?? null
  const result =
    resultValue === 'SUCCESS'
      ? 'success'
      : resultValue === 'ERROR'
        ? 'error'
        : 'unknown'

  return {
    result,
    outcome: getPlatonPaymentOutcome({
      result: resultValue || undefined,
      status: status || undefined,
    }),
    status,
    orderId:
      stringField(transaction.order_id) ??
      stringField(transaction.order) ??
      null,
    amount: stringField(transaction.amount),
    transactionId:
      stringField(transaction.trans_id) ??
      stringField(transaction.id) ??
      null,
    error: stringField(body.error_message),
  }
}

export function validatePlatonStatusPayment(
  status: PlatonStatusCheck,
  expected: { orderId: string; amount: number }
): PlatonPaymentValidation {
  if (status.result !== 'success' || status.outcome !== 'paid') {
    return { valid: false, reason: 'not-paid' }
  }
  if (status.orderId !== expected.orderId) {
    return { valid: false, reason: 'order-mismatch' }
  }
  if (!status.amount) {
    return { valid: false, reason: 'amount-missing' }
  }

  const statusAmount = moneyToMinorUnits(status.amount)
  const expectedAmount = moneyToMinorUnits(expected.amount.toFixed(2))
  if (statusAmount === null || expectedAmount === null) {
    return { valid: false, reason: 'amount-invalid' }
  }
  if (statusAmount !== expectedAmount) {
    return { valid: false, reason: 'amount-mismatch' }
  }
  return { valid: true, amountMinor: statusAmount }
}

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
): Promise<PlatonStatusCheck> {
  if (!orderId.trim() || !key.trim() || !password) {
    return {
      result: 'error',
      outcome: 'unknown',
      status: null,
      orderId: null,
      amount: null,
      transactionId: null,
      error: 'missing-configuration',
    }
  }

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
      signal: AbortSignal.timeout(15_000),
    })
    const response = await res.json().catch(() => null)
    if (!res.ok) {
      return {
        result: 'error',
        outcome: 'unknown',
        status: null,
        orderId: null,
        amount: null,
        transactionId: null,
        error: `http-${res.status}`,
      }
    }
    return parsePlatonStatusResponse(response)
  } catch (error) {
    return {
      result: 'error',
      outcome: 'unknown',
      status: null,
      orderId: null,
      amount: null,
      transactionId: null,
      error: error instanceof Error ? error.name : 'network-error',
    }
  }
}
