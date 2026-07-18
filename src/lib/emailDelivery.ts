import { createHash } from 'crypto'
import { sql } from '@vercel/postgres'
import type { Order, OrderItem } from './userStore'

export type EmailDeliveryKind = 'order_created' | 'payment_receipt'
export type EmailDeliveryStatus = 'queued' | 'sent' | 'failed'

export type EmailDelivery = {
  id: string
  idempotency_key: string
  order_id: string
  kind: EmailDeliveryKind
  recipient: string
  status: EmailDeliveryStatus
  provider: 'resend'
  provider_message_id: string | null
  error_message: string | null
  attempts: number
  last_attempt_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
}

export type EmailDeliveryAnalytics = {
  total: number
  queued: number
  sent: number
  failed: number
  order_created: number
  payment_receipt: number
}

export type EmailSendResult =
  | { ok: true; delivery: EmailDelivery; duplicate: boolean }
  | { ok: false; delivery: EmailDelivery | null; error: string }

type EmailContent = {
  subject: string
  html: string
  text: string
}

type ResendResponse = {
  id?: string
  message?: string
  name?: string
}

const usePostgres = !!process.env.POSTGRES_URL
const DEFAULT_SITE_URL = 'https://eonni.com.ua'
const SUPPORT_EMAIL = 'eonnisupport@gmail.com'
const SUPPORT_PHONE = '+380732737330'
const RETRY_LEASE_MS = 2 * 60 * 1000

let schemaPromise: Promise<void> | null = null

export function ensureEmailDeliverySchema(): Promise<void> {
  if (!usePostgres) return Promise.resolve()
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS email_deliveries (
          id TEXT PRIMARY KEY,
          idempotency_key TEXT UNIQUE NOT NULL,
          order_id TEXT NOT NULL,
          kind TEXT NOT NULL,
          recipient TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'queued',
          provider TEXT NOT NULL DEFAULT 'resend',
          provider_message_id TEXT,
          error_message TEXT,
          attempts INTEGER NOT NULL DEFAULT 0,
          last_attempt_at TEXT,
          sent_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `
      await sql`
        CREATE INDEX IF NOT EXISTS idx_email_deliveries_order_id
        ON email_deliveries(order_id)
      `
      await sql`
        CREATE INDEX IF NOT EXISTS idx_email_deliveries_status_created
        ON email_deliveries(status, created_at DESC)
      `
    })().catch((error) => {
      schemaPromise = null
      throw error
    })
  }
  return schemaPromise
}

function parseCount(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function getEmailDeliveries(limit = 100): Promise<EmailDelivery[]> {
  if (!usePostgres) return []
  await ensureEmailDeliverySchema()
  const safeLimit = Math.max(1, Math.min(Math.trunc(limit), 500))
  const { rows } = await sql<EmailDelivery>`
    SELECT *
    FROM email_deliveries
    ORDER BY created_at DESC
    LIMIT ${safeLimit}
  `
  return rows
}

export async function getEmailDeliveriesForOrder(orderId: string): Promise<EmailDelivery[]> {
  if (!usePostgres) return []
  await ensureEmailDeliverySchema()
  const { rows } = await sql<EmailDelivery>`
    SELECT *
    FROM email_deliveries
    WHERE order_id = ${orderId}
    ORDER BY created_at ASC
  `
  return rows
}

export async function getEmailDeliveryAnalytics(): Promise<EmailDeliveryAnalytics> {
  const empty: EmailDeliveryAnalytics = {
    total: 0,
    queued: 0,
    sent: 0,
    failed: 0,
    order_created: 0,
    payment_receipt: 0,
  }
  if (!usePostgres) return empty

  await ensureEmailDeliverySchema()
  const { rows } = await sql<{
    total: string | number
    queued: string | number
    sent: string | number
    failed: string | number
    order_created: string | number
    payment_receipt: string | number
  }>`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'queued') AS queued,
      COUNT(*) FILTER (WHERE status = 'sent') AS sent,
      COUNT(*) FILTER (WHERE status = 'failed') AS failed,
      COUNT(*) FILTER (WHERE kind = 'order_created') AS order_created,
      COUNT(*) FILTER (WHERE kind = 'payment_receipt') AS payment_receipt
    FROM email_deliveries
  `
  const row = rows[0]
  if (!row) return empty

  return {
    total: parseCount(row.total),
    queued: parseCount(row.queued),
    sent: parseCount(row.sent),
    failed: parseCount(row.failed),
    order_created: parseCount(row.order_created),
    payment_receipt: parseCount(row.payment_receipt),
  }
}

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 2,
  }).format(Number(value) || 0)
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Kyiv',
  }).format(new Date(value))
}

function shippingLabel(method: Order['shipping_method']): string {
  const labels: Record<Order['shipping_method'], string> = {
    nova_poshta: 'Нова пошта',
    ukrposhta: 'Укрпошта',
  }
  return labels[method] ?? method
}

function paymentLabel(method: Order['payment_method']): string {
  const labels: Record<Order['payment_method'], string> = {
    platon: 'Онлайн-оплата через Platon',
    card: 'Онлайн-оплата карткою',
    cash_on_delivery: 'Накладений платіж',
  }
  return labels[method] ?? method
}

function paymentStatusLabel(status: Order['payment_status']): string {
  const labels: Record<Order['payment_status'], string> = {
    pending: 'Очікує оплати',
    paid: 'Оплачено',
    failed: 'Помилка оплати',
    refunded: 'Кошти повернено',
  }
  return labels[status] ?? status
}

function deliveryAddress(order: Order): string {
  return [
    order.shipping_city,
    order.shipping_warehouse,
    order.shipping_address,
  ].filter(Boolean).join(', ')
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).trim().replace(/\/+$/, '')
}

function orderUrl(order: Order): string {
  const token = order.user_id ? '' : `?token=${encodeURIComponent(order.id)}`
  return `${siteUrl()}/orders/${encodeURIComponent(order.id)}${token}`
}

function buildOrderEmail(
  kind: EmailDeliveryKind,
  order: Order,
  items: OrderItem[]
): EmailContent {
  const isPaymentReceipt = kind === 'payment_receipt'
  const title = isPaymentReceipt
    ? `Оплату замовлення ${order.id} підтверджено`
    : `Замовлення ${order.id} прийнято`
  const lead = isPaymentReceipt
    ? 'Дякуємо! Ми успішно отримали вашу оплату та готуємо замовлення.'
    : 'Дякуємо за замовлення! Ми отримали його та зв’яжемося з вами, якщо знадобиться уточнення.'
  const subject = isPaymentReceipt
    ? `Eonni — квитанція про оплату ${order.id}`
    : `Eonni — підтвердження замовлення ${order.id}`
  const itemSubtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  )
  const adjustment = Number(order.total_amount) - itemSubtotal
  const rowsHtml = items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #ece8f8;color:#1f1f1f;">
        ${escapeHtml(item.product_name)}
        <div style="font-size:13px;color:#727272;margin-top:4px;">
          ${escapeHtml(item.quantity)} × ${escapeHtml(formatMoney(Number(item.price)))}
        </div>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #ece8f8;text-align:right;white-space:nowrap;color:#1f1f1f;">
        ${escapeHtml(formatMoney(Number(item.price) * Number(item.quantity)))}
      </td>
    </tr>
  `).join('')
  const rowsText = items.map(
    (item) =>
      `• ${item.product_name} — ${item.quantity} × ${formatMoney(Number(item.price))} = ${formatMoney(Number(item.price) * Number(item.quantity))}`
  ).join('\n')
  const adjustmentHtml = Math.abs(adjustment) >= 0.01
    ? `
      <tr>
        <td style="padding:10px 0;color:#666;">Знижка / коригування</td>
        <td style="padding:10px 0;text-align:right;color:#6046a3;">${escapeHtml(formatMoney(adjustment))}</td>
      </tr>
    `
    : ''
  const adjustmentText = Math.abs(adjustment) >= 0.01
    ? `\nЗнижка / коригування: ${formatMoney(adjustment)}`
    : ''
  const address = deliveryAddress(order) || 'Буде уточнено менеджером'
  const customerName = `${order.first_name} ${order.last_name}`.trim()
  const viewUrl = orderUrl(order)

  const html = `<!doctype html>
<html lang="uk">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#f7f5fb;font-family:Arial,Helvetica,sans-serif;color:#1f1f1f;">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(lead)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f5fb;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:#6046a3;padding:28px 32px;color:#ffffff;">
                <div style="font-size:30px;font-weight:700;letter-spacing:.08em;">EONNI</div>
                <div style="font-size:13px;margin-top:6px;opacity:.85;">Корейська косметика</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 8px;color:#727272;font-size:14px;">Вітаємо, ${escapeHtml(customerName)}!</p>
                <h1 style="font-size:25px;line-height:1.25;margin:0 0 14px;color:#1f1f1f;">${escapeHtml(title)}</h1>
                <p style="font-size:16px;line-height:1.6;margin:0 0 26px;color:#484848;">${escapeHtml(lead)}</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f5fb;border-radius:12px;margin-bottom:26px;">
                  <tr>
                    <td style="padding:18px 20px;line-height:1.7;">
                      <strong>Номер:</strong> ${escapeHtml(order.id)}<br>
                      <strong>Дата:</strong> ${escapeHtml(formatDate(order.created_at))}<br>
                      <strong>Оплата:</strong> ${escapeHtml(paymentLabel(order.payment_method))} — ${escapeHtml(isPaymentReceipt ? 'Оплачено' : paymentStatusLabel(order.payment_status))}
                    </td>
                  </tr>
                </table>

                <h2 style="font-size:18px;margin:0 0 8px;">Ваші товари</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${rowsHtml}
                  <tr>
                    <td style="padding:10px 0;color:#666;">Сума товарів</td>
                    <td style="padding:10px 0;text-align:right;">${escapeHtml(formatMoney(itemSubtotal))}</td>
                  </tr>
                  ${adjustmentHtml}
                  <tr>
                    <td style="padding:14px 0 4px;font-size:18px;font-weight:700;">Разом</td>
                    <td style="padding:14px 0 4px;text-align:right;font-size:18px;font-weight:700;color:#6046a3;">${escapeHtml(formatMoney(Number(order.total_amount)))}</td>
                  </tr>
                </table>

                <h2 style="font-size:18px;margin:28px 0 10px;">Доставка</h2>
                <p style="font-size:15px;line-height:1.65;margin:0 0 4px;">
                  <strong>${escapeHtml(shippingLabel(order.shipping_method))}</strong><br>
                  ${escapeHtml(address)}
                </p>
                <p style="font-size:15px;line-height:1.65;margin:12px 0 26px;color:#555;">
                  Отримувач: ${escapeHtml(customerName)}, ${escapeHtml(order.phone)}
                </p>

                <a href="${escapeHtml(viewUrl)}" style="display:inline-block;background:#6046a3;color:#ffffff;text-decoration:none;border-radius:999px;padding:13px 24px;font-weight:700;">
                  Переглянути замовлення
                </a>

                <p style="font-size:13px;line-height:1.55;margin:28px 0 0;color:#777;">
                  ${isPaymentReceipt ? 'Цей лист підтверджує отримання оплати за замовлення. ' : ''}
                  Потрібна допомога? Напишіть на
                  <a href="mailto:${SUPPORT_EMAIL}" style="color:#6046a3;">${SUPPORT_EMAIL}</a>
                  або зателефонуйте
                  <a href="tel:${SUPPORT_PHONE}" style="color:#6046a3;">${SUPPORT_PHONE}</a>.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const text = `${title}

Вітаємо, ${customerName}!
${lead}

Номер: ${order.id}
Дата: ${formatDate(order.created_at)}
Оплата: ${paymentLabel(order.payment_method)} — ${isPaymentReceipt ? 'Оплачено' : paymentStatusLabel(order.payment_status)}

ВАШІ ТОВАРИ
${rowsText}

Сума товарів: ${formatMoney(itemSubtotal)}${adjustmentText}
Разом: ${formatMoney(Number(order.total_amount))}

ДОСТАВКА
${shippingLabel(order.shipping_method)}
${address}
Отримувач: ${customerName}, ${order.phone}

Переглянути замовлення: ${viewUrl}

Підтримка: ${SUPPORT_EMAIL}, ${SUPPORT_PHONE}`

  return { subject, html, text }
}

function idempotencyKey(kind: EmailDeliveryKind, orderId: string): string {
  return `eonni-${kind}-${orderId}`.toLowerCase()
}

function deliveryId(key: string): string {
  return `EML-${createHash('sha256').update(key).digest('hex').slice(0, 24)}`
}

function cleanEmail(value: string): string {
  return value.trim().toLowerCase()
}

function errorMessage(value: unknown): string {
  if (value instanceof Error) return value.message.slice(0, 1000)
  return String(value).slice(0, 1000)
}

async function getDeliveryByKey(key: string): Promise<EmailDelivery | null> {
  const { rows } = await sql<EmailDelivery>`
    SELECT *
    FROM email_deliveries
    WHERE idempotency_key = ${key}
  `
  return rows[0] ?? null
}

async function recordFailure(
  id: string,
  message: string,
  attemptedAt: string
): Promise<EmailDelivery | null> {
  const { rows } = await sql<EmailDelivery>`
    UPDATE email_deliveries
    SET
      status = 'failed',
      error_message = ${message.slice(0, 1000)},
      updated_at = ${attemptedAt}
    WHERE id = ${id}
    RETURNING *
  `
  return rows[0] ?? null
}

async function sendTransactionalEmail(
  kind: EmailDeliveryKind,
  order: Order,
  items: OrderItem[]
): Promise<EmailSendResult> {
  if (!usePostgres) {
    return { ok: false, delivery: null, error: 'POSTGRES_URL is missing' }
  }

  const recipient = cleanEmail(order.email || order.guest_email || '')
  if (!recipient) {
    return { ok: false, delivery: null, error: 'Order has no recipient email' }
  }

  let claimedId: string | null = null
  let claimedAt: string | null = null
  try {
    await ensureEmailDeliverySchema()
    const key = idempotencyKey(kind, order.id)
    const id = deliveryId(key)
    const now = new Date().toISOString()
    await sql`
      INSERT INTO email_deliveries (
        id, idempotency_key, order_id, kind, recipient, status, provider,
        provider_message_id, error_message, attempts, last_attempt_at,
        sent_at, created_at, updated_at
      ) VALUES (
        ${id}, ${key}, ${order.id}, ${kind}, ${recipient}, 'queued', 'resend',
        NULL, NULL, 0, NULL, NULL, ${now}, ${now}
      )
      ON CONFLICT (idempotency_key) DO NOTHING
    `

    const existing = await getDeliveryByKey(key)
    if (!existing) {
      return { ok: false, delivery: null, error: 'Could not create email delivery log' }
    }
    if (existing.status === 'sent') {
      return { ok: true, delivery: existing, duplicate: true }
    }

    const leaseCutoff = new Date(Date.now() - RETRY_LEASE_MS).toISOString()
    const attemptedAt = new Date().toISOString()
    const { rows: claimedRows } = await sql<EmailDelivery>`
      UPDATE email_deliveries
      SET
        status = 'queued',
        attempts = attempts + 1,
        last_attempt_at = ${attemptedAt},
        error_message = NULL,
        updated_at = ${attemptedAt}
      WHERE id = ${existing.id}
        AND status <> 'sent'
        AND (last_attempt_at IS NULL OR last_attempt_at < ${leaseCutoff})
      RETURNING *
    `
    const claimed = claimedRows[0]
    if (!claimed) {
      const current = await getDeliveryByKey(key)
      if (current?.status === 'sent') {
        return { ok: true, delivery: current, duplicate: true }
      }
      return {
        ok: false,
        delivery: current,
        error: 'Email delivery is already being processed',
      }
    }
    claimedId = claimed.id
    claimedAt = attemptedAt

    const apiKey = process.env.RESEND_API_KEY?.trim()
    const from = process.env.EMAIL_FROM?.trim()
    if (!apiKey || !from) {
      const message = [
        !apiKey ? 'RESEND_API_KEY is missing' : '',
        !from ? 'EMAIL_FROM is missing' : '',
      ].filter(Boolean).join('; ')
      const failed = await recordFailure(claimed.id, message, attemptedAt)
      return { ok: false, delivery: failed, error: message }
    }

    const content = buildOrderEmail(kind, order, items)
    const notificationEmail = cleanEmail(process.env.ORDER_NOTIFICATION_EMAIL || '')
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        ...(notificationEmail && notificationEmail !== recipient
          ? { bcc: [notificationEmail] }
          : {}),
        reply_to: SUPPORT_EMAIL,
        subject: content.subject,
        html: content.html,
        text: content.text,
        tags: [
          { name: 'kind', value: kind },
          { name: 'order_id', value: order.id.replace(/[^a-zA-Z0-9_-]/g, '_') },
        ],
      }),
      signal: AbortSignal.timeout(10_000),
    })
    const payload = await response.json().catch(() => ({})) as ResendResponse
    if (!response.ok || !payload.id) {
      const message = payload.message || payload.name || `Resend HTTP ${response.status}`
      const failed = await recordFailure(claimed.id, message, attemptedAt)
      return { ok: false, delivery: failed, error: message }
    }

    const sentAt = new Date().toISOString()
    const { rows } = await sql<EmailDelivery>`
      UPDATE email_deliveries
      SET
        status = 'sent',
        provider_message_id = ${payload.id},
        error_message = NULL,
        sent_at = ${sentAt},
        updated_at = ${sentAt}
      WHERE id = ${claimed.id}
      RETURNING *
    `
    const delivery = rows[0] ?? claimed
    return { ok: true, delivery, duplicate: false }
  } catch (error) {
    console.error(`[email] ${kind} failed for order ${order.id}:`, error)
    const message = errorMessage(error)
    let failed: EmailDelivery | null = null
    if (claimedId && claimedAt) {
      failed = await recordFailure(claimedId, message, claimedAt).catch(() => null)
    }
    return { ok: false, delivery: failed, error: message }
  }
}

/**
 * Best-effort order confirmation. This function always resolves and must not be
 * awaited as a condition for a successful checkout response.
 */
export async function sendOrderCreatedEmail(
  order: Order,
  items: OrderItem[]
): Promise<EmailSendResult> {
  return sendTransactionalEmail('order_created', order, items)
}

/**
 * Best-effort payment receipt. Call only after a valid Platon SALE callback has
 * changed the order to paid. The deterministic key makes callback retries safe.
 */
export async function sendPaymentReceiptEmail(
  order: Order,
  items: OrderItem[]
): Promise<EmailSendResult> {
  return sendTransactionalEmail(
    'payment_receipt',
    { ...order, payment_status: 'paid' },
    items
  )
}
