import { NextRequest, NextResponse } from 'next/server'
import { isAuthedRequest } from '@/lib/adminAuth'
import { NovaPoshtaError, syncNovaPoshtaTracking } from '@/lib/novaPoshta'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function isAuthorized(request: NextRequest): boolean {
  if (isAuthedRequest(request)) return true
  const cronSecret = process.env.CRON_SECRET
  return Boolean(
    cronSecret &&
      request.headers.get('authorization') === `Bearer ${cronSecret}`
  )
}

async function handle(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? 100)
    return NextResponse.json({
      ok: true,
      ...(await syncNovaPoshtaTracking({ limit })),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof NovaPoshtaError) {
      return NextResponse.json(
        { ok: false, code: error.code, error: error.message },
        { status: error.code === 'CONFIGURATION' ? 503 : 502 }
      )
    }
    console.error('[nova-poshta] Tracking sync failed')
    return NextResponse.json(
      { ok: false, error: 'Nova Poshta tracking sync failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return handle(request)
}

export async function POST(request: NextRequest) {
  return handle(request)
}
