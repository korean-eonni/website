import { NextResponse } from 'next/server'
import { isAuthedRequest } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eonni.com.ua')
  .trim()
  .replace(/\/$/, '')

/**
 * GET /api/admin/oauth/start
 *
 * Redirects the admin to Google's OAuth consent screen. We ask only for
 * `drive.file` (per-file access — minimum scope that still lets us upload to
 * the shared folder and set anyone-with-link permissions). `prompt=consent` +
 * `access_type=offline` guarantee a refresh token even on re-auth.
 */
export async function GET(request: Request) {
  if (!isAuthedRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      { error: 'GOOGLE_OAUTH_CLIENT_ID not configured' },
      { status: 500 }
    )
  }

  const redirectUri = `${SITE_URL}/api/admin/oauth/callback`
  const scope = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
  ].join(' ')

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', scope)
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('include_granted_scopes', 'true')

  return NextResponse.redirect(url.toString())
}
