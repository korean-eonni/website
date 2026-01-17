import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Debug endpoint to check environment variable format
 * REMOVE THIS IN PRODUCTION after debugging!
 */
export async function GET() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || ''
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || ''
  const sheetId = process.env.GOOGLE_SHEETS_ID || ''
  
  // Safe diagnostics (don't expose the actual key)
  const diagnostics = {
    email: email ? `${email.substring(0, 10)}...` : 'NOT SET',
    sheetId: sheetId ? `${sheetId.substring(0, 10)}...` : 'NOT SET',
    key: {
      length: key.length,
      hasBeginMarker: key.includes('-----BEGIN'),
      hasEndMarker: key.includes('-----END'),
      hasLiteralBackslashN: key.includes('\\n'),
      hasActualNewline: key.includes('\n'),
      startsWithQuote: key.startsWith('"') || key.startsWith("'"),
      first50Chars: key.substring(0, 50).replace(/[A-Za-z0-9+/=]/g, 'X'),
      last30Chars: key.substring(key.length - 30).replace(/[A-Za-z0-9+/=]/g, 'X'),
      containsPrivateKey: key.includes('PRIVATE KEY'),
      containsRSA: key.includes('RSA'),
      lineCount: key.split('\n').length,
      literalBackslashNCount: (key.match(/\\n/g) || []).length,
    }
  }
  
  return NextResponse.json(diagnostics)
}

