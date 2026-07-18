import { NextRequest, NextResponse } from 'next/server'
import { isAuthedRequest } from '@/lib/adminAuth'
import {
  getStockSyncStatus,
  processStockSyncQueue,
  queueFullStockReconciliation,
} from '@/lib/stockSync'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function isAuthorized(request: NextRequest): boolean {
  if (isAuthedRequest(request)) return true
  const cronSecret = process.env.CRON_SECRET
  return Boolean(
    cronSecret && request.headers.get('authorization') === `Bearer ${cronSecret}`
  )
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const full = request.nextUrl.searchParams.get('full') === '1'
    const queued = full ? await queueFullStockReconciliation() : 0
    const result = await processStockSyncQueue({ limit: full ? 500 : undefined })
    const status = await getStockSyncStatus()

    return NextResponse.json({
      ok: result.acquired && result.failed === 0,
      full,
      queued,
      ...result,
      status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[sync-stock] Failed:', error)
    return NextResponse.json(
      { ok: false, error: message, timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
