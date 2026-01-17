import { NextRequest, NextResponse } from 'next/server'
import { syncSheetToDatabase } from '@/lib/sheetSync'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for sync (Vercel Pro/Enterprise)

/**
 * GET /api/sync-sheet
 * 
 * Syncs products from Google Sheet to database.
 * Called by:
 * - Vercel Cron (every 5 minutes)
 * - Manual trigger from admin panel
 * 
 * Security:
 * - Vercel Cron requests include CRON_SECRET header
 * - Admin requests should be authenticated via session
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  // Log request source
  const cronSecret = request.headers.get('x-vercel-cron-secret')
  const isCronRequest = !!cronSecret
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  console.log(`[sync-sheet] Request received - cron: ${isCronRequest}, ua: ${userAgent}`)

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
