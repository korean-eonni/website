import { NextRequest, NextResponse } from 'next/server'
import { syncSheetToDatabase } from '@/lib/sheetSync'
import { isAuthedRequest } from '@/lib/adminAuth'

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

/**
 * The database is now the source of truth for products — they are created and
 * edited in the admin panel, and photos live in our own Blob storage.
 *
 * A sheet sync does DELETE-ALL + re-insert, so running it would destroy every
 * admin edit and point photos back at Google. It is therefore disabled unless
 * the caller explicitly opts in with `?allowReplaceAll=1`, which nothing does
 * automatically. The legacy Apps Script and any stray cron get a harmless 409.
 */
function replaceAllAllowed(request: NextRequest): boolean {
  return new URL(request.url).searchParams.get('allowReplaceAll') === '1'
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (!replaceAllAllowed(request)) {
    console.warn('[sync-sheet] Refused: DB is the source of truth; sheet sync would wipe admin edits.')
    return NextResponse.json(
      {
        ok: false,
        disabled: true,
        error:
          'Синхронізація з Google Sheet вимкнена: база даних тепер є джерелом правди. ' +
          'Товари редагуються в адмінці, фото зберігаються у власному сховищі. ' +
          'Цей запит нічого не змінив.',
        hint: 'Якщо ви справді хочете ПЕРЕЗАПИСАТИ всі товари з таблиці, додайте ?allowReplaceAll=1',
        timestamp: new Date().toISOString(),
      },
      { status: 409 }
    )
  }

  const startTime = Date.now()

  try {
    const result = await syncSheetToDatabase()
    const duration = Date.now() - startTime
    
    console.log(`[sync-sheet] Success - imported: ${result.imported}, skipped: ${result.skipped}, errors: ${result.errors}, duration: ${duration}ms`)
    
    return NextResponse.json({
      ok: true,
      ...result,
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
