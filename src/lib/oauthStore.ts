/**
 * Persistent storage for the Google OAuth refresh token used to upload product
 * photos to Drive as a real user (service accounts can't own files in personal
 * Google accounts — no storage quota).
 *
 * The admin signs in once at `/api/admin/oauth/start`; we exchange the code on
 * the callback, save the refresh token to `app_oauth_tokens`, and reuse it for
 * every upload until it's revoked.
 */
import { sql } from '@vercel/postgres'

const PROVIDER = 'google_drive'

async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS app_oauth_tokens (
      provider TEXT PRIMARY KEY,
      refresh_token TEXT NOT NULL,
      access_token TEXT,
      access_token_expires_at TIMESTAMPTZ,
      account_email TEXT,
      scope TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
}

export type OAuthTokenRow = {
  refresh_token: string
  access_token: string | null
  access_token_expires_at: Date | null
  account_email: string | null
  scope: string | null
}

export async function saveGoogleRefreshToken(input: {
  refresh_token: string
  access_token?: string | null
  access_token_expires_at?: Date | null
  account_email?: string | null
  scope?: string | null
}): Promise<void> {
  await ensureSchema()
  const expires = input.access_token_expires_at
    ? input.access_token_expires_at.toISOString()
    : null
  await sql`
    INSERT INTO app_oauth_tokens (
      provider, refresh_token, access_token, access_token_expires_at,
      account_email, scope, updated_at
    )
    VALUES (
      ${PROVIDER}, ${input.refresh_token}, ${input.access_token ?? null},
      ${expires}, ${input.account_email ?? null}, ${input.scope ?? null}, NOW()
    )
    ON CONFLICT (provider) DO UPDATE SET
      refresh_token = EXCLUDED.refresh_token,
      access_token = EXCLUDED.access_token,
      access_token_expires_at = EXCLUDED.access_token_expires_at,
      account_email = EXCLUDED.account_email,
      scope = EXCLUDED.scope,
      updated_at = NOW()
  `
}

export async function updateGoogleAccessToken(
  access_token: string,
  expires_at: Date
): Promise<void> {
  await ensureSchema()
  await sql`
    UPDATE app_oauth_tokens
    SET access_token = ${access_token},
        access_token_expires_at = ${expires_at.toISOString()},
        updated_at = NOW()
    WHERE provider = ${PROVIDER}
  `
}

export async function getGoogleTokens(): Promise<OAuthTokenRow | null> {
  await ensureSchema()
  const result = await sql`
    SELECT refresh_token, access_token, access_token_expires_at,
           account_email, scope
    FROM app_oauth_tokens
    WHERE provider = ${PROVIDER}
  `
  if (result.rows.length === 0) return null
  const row = result.rows[0]
  return {
    refresh_token: row.refresh_token as string,
    access_token: (row.access_token as string | null) ?? null,
    access_token_expires_at: row.access_token_expires_at
      ? new Date(row.access_token_expires_at as string)
      : null,
    account_email: (row.account_email as string | null) ?? null,
    scope: (row.scope as string | null) ?? null,
  }
}

export async function clearGoogleTokens(): Promise<void> {
  await ensureSchema()
  await sql`DELETE FROM app_oauth_tokens WHERE provider = ${PROVIDER}`
}
