import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import {
  getPlatonPaymentOutcome,
  validatePlatonCallbackPayment,
  verifyPlatonCallbackSignature,
} from '@/lib/platon'
import { markPlatonOrderPaid } from '@/lib/platonStore'
import { getOrderById, getOrderItems } from '@/lib/userStore'
import { sendPaymentReceiptEmail } from '@/lib/emailDelivery'
import { createOrderShipment } from '@/lib/shipmentAutomation'

export const dynamic = 'force-dynamic'

type LogLevel = 'info' | 'warn' | 'error'

function callbackLog(
  level: LogLevel,
  event: string,
  details: Record<string, unknown>
): void {
  const entry = {
    service: 'platon-callback',
    event,
    ...details,
  }
  if (level === 'error') {
    console.error(entry)
  } else if (level === 'warn') {
    console.warn(entry)
  } else {
    console.info(entry)
  }
}

function scalarRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: Record<string, string> = {}
  for (const [key, field] of Object.entries(value)) {
    if (typeof field === 'string' || typeof field === 'number') {
      result[key] = String(field)
    }
  }
  return result
}

async function parseCallbackBody(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? ''
  if (contentType.includes('application/json')) {
    return scalarRecord(await request.json())
  }
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData()
    const result: Record<string, string> = {}
    form.forEach((value, key) => {
      if (typeof value === 'string') result[key] = value
    })
    return result
  }

  const raw = await request.text()
  if (raw.length > 20_000) throw new Error('payload-too-large')
  const params = new URLSearchParams(raw)
  for (const key of ['order', 'sign', 'status', 'result', 'amount', 'currency']) {
    if (params.getAll(key).length > 1) throw new Error(`duplicate-${key}`)
  }
  return Object.fromEntries(params)
}

/**
 * POST /api/platon/callback
 *
 * Platon's asynchronous payment notification. This — NOT the browser redirect —
 * is the source of truth for marking an order paid. Platon only sends a callback
 * on success ('SALE'); failed payments produce no callback.
 *
 * We verify the `sign` with PLATON_PASSWORD before trusting anything, so a forged
 * "paid" POST can't unlock an order. Respond 200 so Platon stops retrying.
 *
 * Register this URL in the Platon merchant cabinet → API → CallbackUrl:
 *   https://eonni.com.ua/api/platon/callback
 */
export async function POST(request: Request) {
  const requestId = request.headers.get('x-vercel-id') || randomUUID()
  const password = process.env.PLATON_PASSWORD
  if (!password) {
    callbackLog('error', 'configuration_missing', { requestId })
    return NextResponse.json({ error: 'platon-password-missing' }, { status: 500 })
  }

  let body: Record<string, string> = {}
  try {
    body = await parseCallbackBody(request)
  } catch (error) {
    callbackLog('warn', 'payload_invalid', {
      requestId,
      error: error instanceof Error ? error.message : 'parse-failed',
    })
    return new NextResponse('Bad Request', { status: 400 })
  }

  const orderId = (body.order ?? '').trim()
  const callbackStatus = (body.status ?? '').trim().toUpperCase() || null
  const callbackResult = (body.result ?? '').trim().toUpperCase() || null
  callbackLog('info', 'received', {
    requestId,
    orderId: orderId || null,
    callbackStatus,
    callbackResult,
    amount: body.amount?.trim() || null,
    currency: body.currency?.trim().toUpperCase() || null,
    hasCardMask: Boolean(body.card),
    hasNumberMask: Boolean(body.number),
    hasSignature: Boolean(body.sign),
  })

  if (!orderId) {
    callbackLog('warn', 'order_id_missing', { requestId })
    return new NextResponse('Bad Request', { status: 400 })
  }

  try {
    const order = await getOrderById(orderId)
    if (!order) {
      // This cannot be applied safely and retries will not create the missing
      // merchant order. Acknowledge it, but leave an observable warning.
      callbackLog('warn', 'order_not_found', { requestId, orderId })
      return new NextResponse('OK', { status: 200 })
    }

    const signature = verifyPlatonCallbackSignature(
      body,
      password,
      order.email ?? ''
    )
    if (!signature.valid) {
      callbackLog('warn', 'signature_invalid', {
        requestId,
        orderId,
        callbackStatus,
        callbackResult,
      })
      return new NextResponse('Invalid sign', { status: 400 })
    }

    const outcome = getPlatonPaymentOutcome(body)
    if (outcome !== 'paid') {
      callbackLog('info', 'payment_not_settled', {
        requestId,
        orderId,
        callbackStatus,
        callbackResult,
        outcome,
        signatureVariant: signature.variant,
      })
      return new NextResponse('OK', { status: 200 })
    }

    const validation = validatePlatonCallbackPayment(body, {
      orderId: order.id,
      amount: Number(order.total_amount),
      currency: 'UAH',
    })
    if (!validation.valid) {
      callbackLog('warn', 'payment_validation_failed', {
        requestId,
        orderId,
        callbackStatus,
        callbackResult,
        reason: validation.reason,
        signatureVariant: signature.variant,
      })
      // Non-200 keeps Platon retries active while the mismatch is investigated.
      return new NextResponse('Payment mismatch', { status: 409 })
    }

    const transition = await markPlatonOrderPaid(orderId)
    if (transition === 'refunded' || transition === 'unsupported_method') {
      callbackLog('warn', 'payment_state_conflict', {
        requestId,
        orderId,
        transition,
        signatureVariant: signature.variant,
      })
      return new NextResponse('Payment state conflict', { status: 409 })
    }
    if (transition === 'not_found') {
      callbackLog('warn', 'order_disappeared', { requestId, orderId })
      return new NextResponse('OK', { status: 200 })
    }

    callbackLog('info', transition === 'updated' ? 'payment_marked_paid' : 'payment_already_paid', {
      requestId,
      orderId,
      transition,
      signatureVariant: signature.variant,
      callbackStatus,
      callbackResult,
      amountMinor: validation.amountMinor,
    })

    // A late payment for a cancelled order needs human reconciliation before
    // promising fulfillment. Payment truth is stored, but no receipt is sent.
    if (order.status === 'cancelled') {
      callbackLog('warn', 'paid_order_is_cancelled', { requestId, orderId })
      return new NextResponse('OK', { status: 200 })
    }

    // Callback retries are expected. Email delivery has its own deterministic
    // idempotency key, so this also safely retries an earlier email failure.
    const emailResult = await sendPaymentReceiptEmail(
      { ...order, payment_status: 'paid' },
      await getOrderItems(order.id)
    )
    if (!emailResult.ok) {
      callbackLog('warn', 'receipt_email_failed', {
        requestId,
        orderId,
        deliveryRecorded: Boolean(emailResult.delivery),
      })
    }
    if (order.shipping_method === 'nova_poshta') {
      try {
        const shipment = await createOrderShipment({ orderId })
        callbackLog('info', 'nova_poshta_shipment_ready', {
          requestId,
          orderId,
          created: shipment.created,
          trackingNumber: shipment.shipment.trackingNumber,
          notificationSent: shipment.notification.ok,
        })
      } catch (error) {
        callbackLog('warn', 'nova_poshta_shipment_deferred', {
          requestId,
          orderId,
          error: error instanceof Error ? error.message : 'unknown-error',
        })
      }
    }
    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    callbackLog('error', 'handler_failed', {
      requestId,
      orderId,
      errorType: error instanceof Error ? error.name : 'UnknownError',
    })
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
