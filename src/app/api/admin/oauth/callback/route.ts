import { NextResponse } from 'next/server'
import { isAuthedRequest } from '@/lib/adminAuth'
import { saveGoogleRefreshToken } from '@/lib/oauthStore'

export const dynamic = 'force-dynamic'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eonni.com.ua')
  .trim()
  .replace(/\/$/, '')

/**
 * GET /api/admin/oauth/callback?code=...
 *
 * Google sends the admin here after they approve our Drive scope. We swap the
 * one-time `code` for a refresh token + access token and persist them. After
 * this, server-side product uploads use the refresh token to mint short-lived
 * access tokens.
 */
export async function GET(request: Request) {
  if (!isAuthedRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${SITE_URL}/admin?oauth=error&reason=${encodeURIComponent(error)}`)
  }
  if (!code) {
    return NextResponse.redirect(`${SITE_URL}/admin?oauth=error&reason=missing-code`)
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${SITE_URL}/admin?oauth=error&reason=missing-config`)
  }

  try {
    // Exchange code → tokens.
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${SITE_URL}/api/admin/oauth/callback`,
        grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokenRes.ok) {
      console.error('[oauth/callback] token exchange failed:', tokens)
      return NextResponse.redirect(
        `${SITE_URL}/admin?oauth=error&reason=token-exchange`
      )
    }

    const {
      access_token,
      refresh_token,
      expires_in,
      scope,
    }: {
      access_token: string
      refresh_token?: string
      expires_in: number
      scope: string
    } = tokens

    if (!refresh_token) {
      // Google only returns a refresh_token the FIRST time the user consents,
      // unless `prompt=consent` was set (which we did). If we still don't see
      // one, the user has previously connected — ask them to revoke and retry.
      return NextResponse.redirect(
        `${SITE_URL}/admin?oauth=error&reason=no-refresh-token`
      )
    }

    // Fetch the user's email so the admin UI can show which account is linked.
    let accountEmail: string | null = null
    try {
      const userInfoRes = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      if (userInfoRes.ok) {
        const data = (await userInfoRes.json()) as { email?: string }
        accountEmail = data.email ?? null
      }
    } catch {
      /* email is optional — fine if it fails */
    }

    await saveGoogleRefreshToken({
      refresh_token,
      access_token,
      access_token_expires_at: new Date(Date.now() + (expires_in - 60) * 1000),
      account_email: accountEmail,
      scope,
    })

    return NextResponse.redirect(`${SITE_URL}/admin?oauth=ok`)
  } catch (err) {
    console.error('[oauth/callback] unexpected:', err)
    return NextResponse.redirect(`${SITE_URL}/admin?oauth=error&reason=unexpected`)
  }
}
