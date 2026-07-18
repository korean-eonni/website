import { NextRequest, NextResponse } from 'next/server'
import { syncSheetToDatabase } from '@/lib/sheetSync'
import { isAuthedRequest } from '@/lib/adminAuth'
import {
  processStockSyncQueue,
  queueFullStockReconciliation,
} from '@/lib/stockSync'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for sync (Vercel Pro/Enterprise)

/**
 * Authorize callers. Accept either:
 *   1. Vercel Cron — `Authorization: Bearer ${CRON_SECRET}` (set in vercel.json).
 *   2. Admin session — signed `eonni_admin` cookie.
 * Without one of these, refuse the request. The old behaviour (open endpoint)
 * let anyone trigger a full DB wipe + re-sync.
 */
function isAuthorized(request: NextRequest): boolean {
  if (isAuthedRequest(request)) return true
  const auth = request.headers.get('authorization') || ''
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true
  return false
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const startTime = Date.now()

  try {
    const result = await syncSheetToDatabase()
    const queued = await queueFullStockReconciliation()
    const stockSync = await processStockSyncQueue({ limit: 500 })
    const duration = Date.now() - startTime
    
    console.log(`[sync-sheet] Success - imported: ${result.imported}, skipped: ${result.skipped}, errors: ${result.errors}, stock queued: ${queued}, stock failed: ${stockSync.failed}, duration: ${duration}ms`)
    
    return NextResponse.json({
      ok: true,
      ...result,
      stockSync: {
        ok: stockSync.acquired && stockSync.failed === 0,
        queued,
        ...stockSync,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    const duration = Date.now() - startTime
    const errorMessage = error?.message || 'Unknown error'
    const errorStack = error?.stack || ''
    
    console.error(`[sync-sheet] Failed after ${duration}ms:`, errorMessage)
    console.error(`[sync-sheet] Stack:`, errorStack)
    
    // Return detailed error for debugging
    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        duration,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sync-sheet
 * 
 * Alternative endpoint for manual sync with optional parameters
 */
export async function POST(request: NextRequest) {
  // Forward to GET handler
  return GET(request)
}
