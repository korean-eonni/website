import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { isAuthedRequest } from '@/lib/adminAuth'
import {
  checkPlatonStatus,
  validatePlatonStatusPayment,
} from '@/lib/platon'
import { markPlatonOrderPaid } from '@/lib/platonStore'
import { getOrderById, getOrderItems } from '@/lib/userStore'
import { sendPaymentReceiptEmail } from '@/lib/emailDelivery'
import { createOrderShipment } from '@/lib/shipmentAutomation'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

function reconciliationLog(
  level: 'info' | 'warn' | 'error',
  event: string,
  details: Record<string, unknown>
): void {
  const entry = { service: 'platon-reconciliation', event, ...details }
  if (level === 'error') {
    console.error(entry)
  } else if (level === 'warn') {
    console.warn(entry)
  } else {
    console.info(entry)
  }
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).host === new URL(request.url).host
  } catch {
    return false
  }
}

/**
 * POST /api/platon/reconcile
 * Body: { "orderId": "ORD-..." }
 *
 * Admin-only, read-through reconciliation for a missed Callback. It asks
 * Platon for the merchant order, requires SUCCESS + SETTLED, exact order ID,
 * and exact amount before atomically changing payment_status to paid.
 */
export async function POST(request: Request) {
  const requestId = request.headers.get('x-vercel-id') || randomUUID()
  if (!isAuthedRequest(request)) {
    reconciliationLog('warn', 'unauthorized', { requestId })
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  if (!isSameOrigin(request)) {
    reconciliationLog('warn', 'origin_rejected', { requestId })
    return NextResponse.json({ ok: false, error: 'origin-rejected' }, { status: 403 })
  }

  const payload = await request.json().catch(() => ({}))
  const orderId =
    typeof payload?.orderId === 'string'
      ? payload.orderId.trim().slice(0, 255)
      : ''
  if (!orderId) {
    return NextResponse.json(
      { ok: false, error: 'order-id-required' },
      { status: 400 }
    )
  }

  const key = process.env.PLATON_KEY?.trim()
  const password = process.env.PLATON_PASSWORD
  if (!key || !password) {
    reconciliationLog('error', 'configuration_missing', { requestId, orderId })
    return NextResponse.json(
      { ok: false, error: 'platon-configuration-missing' },
      { status: 500 }
    )
  }

  try {
    const order = await getOrderById(orderId)
    if (!order) {
      reconciliationLog('warn', 'order_not_found', { requestId, orderId })
      return NextResponse.json(
        { ok: false, error: 'order-not-found' },
        { status: 404 }
      )
    }
    if (order.payment_method !== 'platon') {
      reconciliationLog('warn', 'unsupported_payment_method', {
        requestId,
        orderId,
        paymentMethod: order.payment_method,
      })
      return NextResponse.json(
        { ok: false, error: 'not-a-platon-order' },
        { status: 409 }
      )
    }

    const providerStatus = await checkPlatonStatus(orderId, key, password)
    const validation = validatePlatonStatusPayment(providerStatus, {
      orderId,
      amount: Number(order.total_amount),
    })
    if (!validation.valid) {
      reconciliationLog('warn', 'provider_status_rejected', {
        requestId,
        orderId,
        providerResult: providerStatus.result,
        providerStatus: providerStatus.status,
        reason: validation.reason,
      })
      return NextResponse.json(
        {
          ok: false,
          reconciled: false,
          error: 'provider-status-not-settled',
          reason: validation.reason,
          provider: {
            result: providerStatus.result,
            status: providerStatus.status,
            orderId: providerStatus.orderId,
            amount: providerStatus.amount,
            transactionId: providerStatus.transactionId,
            error: providerStatus.error,
          },
        },
        { status: 409 }
      )
    }

    const transition = await markPlatonOrderPaid(orderId)
    if (
      transition === 'refunded' ||
      transition === 'unsupported_method' ||
      transition === 'not_found'
    ) {
      reconciliationLog('warn', 'payment_state_conflict', {
        requestId,
        orderId,
        transition,
      })
      return NextResponse.json(
        { ok: false, reconciled: false, error: 'payment-state-conflict', transition },
        { status: 409 }
      )
    }

    const emailResult = await sendPaymentReceiptEmail(
      { ...order, payment_status: 'paid' },
      await getOrderItems(orderId)
    )
    if (!emailResult.ok) {
      reconciliationLog('warn', 'receipt_email_failed', {
        requestId,
        orderId,
        deliveryRecorded: Boolean(emailResult.delivery),
      })
    }
    let shipmentResult: Awaited<ReturnType<typeof createOrderShipment>> | null = null
    if (order.shipping_method === 'nova_poshta') {
      try {
        shipmentResult = await createOrderShipment({ orderId })
      } catch (error) {
        reconciliationLog('warn', 'nova_poshta_shipment_deferred', {
          requestId,
          orderId,
          error: error instanceof Error ? error.message : 'unknown-error',
        })
      }
    }

    reconciliationLog('info', 'payment_reconciled', {
      requestId,
      orderId,
      transition,
      providerStatus: providerStatus.status,
      transactionId: providerStatus.transactionId,
      amountMinor: validation.amountMinor,
      receiptSent: emailResult.ok,
    })
    return NextResponse.json({
      ok: true,
      reconciled: true,
      orderId,
      transition,
      paymentStatus: 'paid',
      provider: {
        result: providerStatus.result,
        status: providerStatus.status,
        transactionId: providerStatus.transactionId,
        amount: providerStatus.amount,
      },
      receipt: {
        ok: emailResult.ok,
        duplicate: emailResult.ok ? emailResult.duplicate : false,
      },
      shipment: shipmentResult
        ? {
            ok: true,
            created: shipmentResult.created,
            trackingNumber: shipmentResult.shipment.trackingNumber,
            notificationSent: shipmentResult.notification.ok,
          }
        : { ok: false },
    })
  } catch (error) {
    reconciliationLog('error', 'handler_failed', {
      requestId,
      orderId,
      errorType: error instanceof Error ? error.name : 'UnknownError',
    })
    return NextResponse.json(
      { ok: false, reconciled: false, error: 'reconciliation-failed' },
      { status: 500 }
    )
  }
}
