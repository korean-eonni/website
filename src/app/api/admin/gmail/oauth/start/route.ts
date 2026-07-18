import { NextResponse } from 'next/server'
import { isAuthedRequest } from '@/lib/adminAuth'
import {
  createGoogleOAuthState,
  googleOAuthCookieName,
} from '@/lib/googleOAuthState'

export const dynamic = 'force-dynamic'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eonni.com.ua')
  .trim()
  .replace(/\/$/, '')

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

  const oauthState = createGoogleOAuthState('gmail')
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', `${SITE_URL}/api/admin/oauth/callback`)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set(
    'scope',
    [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' ')
  )
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent select_account')
  url.searchParams.set('include_granted_scopes', 'false')
  url.searchParams.set('state', oauthState.state)

  const response = NextResponse.redirect(url.toString())
  response.cookies.set(googleOAuthCookieName(), oauthState.cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: oauthState.maxAge,
  })
  return response
}
