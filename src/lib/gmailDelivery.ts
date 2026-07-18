import {
  getGoogleOAuthTokens,
  updateGoogleOAuthAccessToken,
} from '@/lib/oauthStore'

type GmailSendInput = {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

type GoogleTokenResponse = {
  access_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

type GmailSendResponse = {
  id?: string
  error?: { message?: string }
}

function base64Url(value: string): string {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/g, '')
}

function encodeHeader(value: string): string {
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`
}

function mimeMessage(input: GmailSendInput, from: string): string {
  const boundary = `eonni-${Date.now()}-${Math.random().toString(16).slice(2)}`
  return [
    `From: Eonni <${from}>`,
    `To: ${input.to}`,
    `Reply-To: ${input.replyTo || from}`,
    `Subject: ${encodeHeader(input.subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(input.text, 'utf8').toString('base64'),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(input.html, 'utf8').toString('base64'),
    `--${boundary}--`,
  ].join('\r\n')
}

async function accessToken(): Promise<{ token: string; accountEmail: string }> {
  const tokens = await getGoogleOAuthTokens('gmail')
  if (!tokens?.refresh_token || !tokens.account_email) {
    throw new Error('Gmail OAuth is not connected')
  }
  if (
    tokens.access_token &&
    tokens.access_token_expires_at &&
    tokens.access_token_expires_at.getTime() > Date.now() + 60_000
  ) {
    return { token: tokens.access_token, accountEmail: tokens.account_email }
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth client is not configured')
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
    }),
    signal: AbortSignal.timeout(10_000),
  })
  const payload = (await response.json().catch(() => ({}))) as GoogleTokenResponse
  if (!response.ok || !payload.access_token) {
    throw new Error(
      payload.error_description || payload.error || `Google OAuth HTTP ${response.status}`
    )
  }

  const expiresAt = new Date(Date.now() + Math.max(60, payload.expires_in || 3600) * 1000)
  await updateGoogleOAuthAccessToken('gmail', payload.access_token, expiresAt)
  return { token: payload.access_token, accountEmail: tokens.account_email }
}

export async function sendGmailMessage(
  input: GmailSendInput
): Promise<{ id: string }> {
  const auth = await accessToken()
  const response = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: base64Url(mimeMessage(input, auth.accountEmail)),
      }),
      signal: AbortSignal.timeout(10_000),
    }
  )
  const payload = (await response.json().catch(() => ({}))) as GmailSendResponse
  if (!response.ok || !payload.id) {
    throw new Error(payload.error?.message || `Gmail API HTTP ${response.status}`)
  }
  return { id: payload.id }
}
