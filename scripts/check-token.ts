import { sql } from '@vercel/postgres'
async function main() {
  const r = await sql`SELECT provider, account_email, scope, 
    LENGTH(refresh_token) as rt_len,
    access_token_expires_at, updated_at
    FROM app_oauth_tokens`
  for (const row of r.rows) {
    console.log('Provider:', row.provider)
    console.log('Account:', row.account_email)
    console.log('Scope:', row.scope)
    console.log('Refresh token length:', row.rt_len)
    console.log('Access token expires:', row.access_token_expires_at)
    console.log('Updated:', row.updated_at)
  }
}
main().catch(e => { console.error(e.message); process.exit(1) })
