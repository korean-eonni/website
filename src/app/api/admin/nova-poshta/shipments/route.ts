import { NextRequest, NextResponse } from 'next/server'
import { isAuthedRequest } from '@/lib/adminAuth'
import {
  getNovaPoshtaShipment,
  NovaPoshtaError,
} from '@/lib/novaPoshta'
import { createOrderShipment } from '@/lib/shipmentAutomation'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function errorStatus(error: NovaPoshtaError): number {
  if (error.code === 'VALIDATION' || error.code === 'ORDER_NOT_ELIGIBLE') return 400
  if (error.code === 'ORDER_NOT_FOUND') return 404
  if (error.code === 'IDEMPOTENCY_UNCERTAIN') return 409
  if (error.code === 'CONFIGURATION') return 503
  return 502
}

export async function GET(request: NextRequest) {
  if (!isAuthedRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const orderId = request.nextUrl.searchParams.get('orderId')?.trim() ?? ''
    if (!orderId) {
      return NextResponse.json(
        { ok: false, error: 'orderId is required' },
        { status: 400 }
      )
    }
    return NextResponse.json({
      ok: true,
      shipment: await getNovaPoshtaShipment(orderId),
    })
  } catch (error) {
    if (error instanceof NovaPoshtaError) {
      return NextResponse.json(
        { ok: false, code: error.code, error: error.message },
        { status: errorStatus(error) }
      )
    }
    console.error('[nova-poshta] Failed to read shipment')
    return NextResponse.json(
      { ok: false, error: 'Failed to read Nova Poshta shipment' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthedRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawBody: unknown = await request.json()
    if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
      return NextResponse.json(
        { ok: false, error: 'JSON object is required' },
        { status: 400 }
      )
    }
    const body = rawBody as Record<string, unknown>
    const result = await createOrderShipment({
      orderId: String(body.orderId ?? ''),
      recipientCityRef:
        typeof body.recipientCityRef === 'string' ? body.recipientCityRef : undefined,
      recipientWarehouseRef:
        typeof body.recipientWarehouseRef === 'string'
          ? body.recipientWarehouseRef
          : undefined,
      weightKg: body.weightKg === undefined ? undefined : Number(body.weightKg),
      seatsAmount:
        body.seatsAmount === undefined ? undefined : Number(body.seatsAmount),
      description:
        typeof body.description === 'string' ? body.description : undefined,
      serviceType:
        body.serviceType === 'WarehousePostomat' ||
        body.serviceType === 'WarehouseWarehouse' ||
        body.serviceType === 'DoorsPostomat' ||
        body.serviceType === 'DoorsWarehouse'
          ? body.serviceType
          : undefined,
      payerType:
        body.payerType === 'Recipient'
          ? 'Recipient'
          : body.payerType === 'Sender'
            ? 'Sender'
            : undefined,
      paymentMethod:
        body.paymentMethod === 'Cash' || body.paymentMethod === 'NonCash'
          ? body.paymentMethod
          : undefined,
      afterpaymentAmount:
        body.afterpaymentAmount === undefined
          ? undefined
          : Number(body.afterpaymentAmount),
    })
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    if (error instanceof NovaPoshtaError) {
      return NextResponse.json(
        {
          ok: false,
          code: error.code,
          error: error.message,
          retryable: error.retryable,
          ambiguous: error.ambiguous,
          apiErrors: error.apiErrors,
          apiErrorCodes: error.apiErrorCodes,
        },
        { status: errorStatus(error) }
      )
    }
    console.error('[nova-poshta] Failed to create shipment')
    return NextResponse.json(
      { ok: false, error: 'Failed to create Nova Poshta shipment' },
      { status: 500 }
    )
  }
}
