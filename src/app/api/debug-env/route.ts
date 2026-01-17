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
  
  // Try to normalize the key and see what happens
  let normalizedKey = key
  let normalizeError = null
  try {
    // Replace literal \n with actual newlines
    normalizedKey = key.replace(/\\n/g, '\n')
    // Remove quotes
    if (normalizedKey.startsWith('"')) normalizedKey = normalizedKey.slice(1)
    if (normalizedKey.endsWith('"')) normalizedKey = normalizedKey.slice(0, -1)
    normalizedKey = normalizedKey.trim()
  } catch (e: any) {
    normalizeError = e.message
  }
  
  // Safe diagnostics (don't expose the actual key)
  const diagnostics = {
    email: email ? `${email.substring(0, 10)}...` : 'NOT SET',
    sheetId: sheetId ? `${sheetId.substring(0, 10)}...` : 'NOT SET',
    rawKey: {
      length: key.length,
      hasBeginMarker: key.includes('-----BEGIN'),
      hasEndMarker: key.includes('-----END'),
      hasLiteralBackslashN: key.includes('\\n'),
      hasActualNewline: key.includes('\n'),
      startsWithQuote: key.startsWith('"') || key.startsWith("'"),
      first80Chars: key.substring(0, 80).replace(/[A-Za-z0-9+/=]/g, 'X'),
      last50Chars: key.substring(key.length - 50).replace(/[A-Za-z0-9+/=]/g, 'X'),
      containsPrivateKey: key.includes('PRIVATE KEY'),
      containsRSA: key.includes('RSA'),
      lineCount: key.split('\n').length,
      literalBackslashNCount: (key.match(/\\n/g) || []).length,
    },
    normalizedKey: {
      length: normalizedKey.length,
      lineCount: normalizedKey.split('\n').length,
      first80Chars: normalizedKey.substring(0, 80).replace(/[A-Za-z0-9+/=]/g, 'X'),
      last50Chars: normalizedKey.substring(normalizedKey.length - 50).replace(/[A-Za-z0-9+/=]/g, 'X'),
      error: normalizeError,
    },
    // Show character codes of first few chars to debug encoding
    charCodes: {
      first10: Array.from(key.substring(0, 10)).map(c => c.charCodeAt(0)),
      around30: Array.from(key.substring(25, 40)).map(c => c.charCodeAt(0)),
    }
  }
  
  return NextResponse.json(diagnostics)
}

