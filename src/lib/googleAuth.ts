/**
 * Shared Google service-account helpers.
 *
 * Kept in its own module (no `googleapis` / `@vercel/blob` imports) so that a
 * lightweight caller like the order API can reuse it without pulling in the whole
 * sheet-sync pipeline.
 */

/**
 * Normalize PEM private key from environment variable
 * Handles various formats: JSON escaped, base64, literal newlines, etc.
 *
 * The key should look like:
 * -----BEGIN PRIVATE KEY-----
 * MIIEvgIBADANBgkqhkiG9w0BAQE...
 * -----END PRIVATE KEY-----
 */
export function normalizePrivateKey(key: string): string {
  let normalized = key

  // Step 1: Remove surrounding whitespace and quotes
  normalized = normalized.trim()
  if ((normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'"))) {
    normalized = normalized.slice(1, -1)
  }

  // Step 2: Replace ALL literal \n with actual newlines
  // Use a loop to handle multiple passes if needed
  let prevLength = 0
  while (normalized.length !== prevLength) {
    prevLength = normalized.length
    normalized = normalized.replace(/\\n/g, '\n')
  }

  // Step 3: Remove \r characters
  normalized = normalized.replace(/\\r/g, '').replace(/\r/g, '')

  // Step 4: Handle URL-encoded newlines
  if (normalized.includes('%0A')) {
    normalized = decodeURIComponent(normalized)
  }

  // Step 5: Clean up any double newlines or trailing newlines in the middle
  normalized = normalized.replace(/\n+/g, '\n').trim()

  // Step 6: Reconstruct the key if it's malformed
  // Extract the base64 content and rebuild with proper formatting
  const beginMatch = normalized.match(/-----BEGIN ([A-Z ]+)-----/)
  const endMatch = normalized.match(/-----END ([A-Z ]+)-----/)

  if (beginMatch && endMatch) {
    const keyType = beginMatch[1]
    const header = `-----BEGIN ${keyType}-----`
    const footer = `-----END ${keyType}-----`

    // Extract everything between header and footer
    const startIdx = normalized.indexOf(header) + header.length
    const endIdx = normalized.indexOf(footer)
    let body = normalized.substring(startIdx, endIdx)

    // Remove all whitespace from body
    body = body.replace(/\s+/g, '')

    // Validate body is base64
    if (!/^[A-Za-z0-9+/=]+$/.test(body)) {
      throw new Error('Invalid private key: body contains non-base64 characters')
    }

    // Rebuild with proper 64-char line breaks
    const lines: string[] = []
    for (let i = 0; i < body.length; i += 64) {
      lines.push(body.substring(i, i + 64))
    }

    normalized = [header, ...lines, footer].join('\n')
  }

  // Step 7: Final validation
  if (!normalized.includes('-----BEGIN')) {
    throw new Error(`Invalid private key format: missing BEGIN marker`)
  }
  if (!normalized.includes('-----END')) {
    throw new Error(`Invalid private key format: missing END marker`)
  }

  // Count lines - a valid RSA/PKCS8 private key should have 25+ lines
  const lineCount = normalized.split('\n').length
  if (lineCount < 10) {
    throw new Error(`Invalid private key: only ${lineCount} lines (expected 25+)`)
  }

  return normalized
}
