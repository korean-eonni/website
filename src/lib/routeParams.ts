/**
 * Decode an id taken from a dynamic route segment.
 *
 * Product ids are slugs built from the product name, and most of ours contain
 * Cyrillic (e.g. `unove-water-essence-mist-двофазний-міст--127`). In a URL those
 * letters are percent-encoded, and Next.js hands the raw, still-encoded segment
 * to server components and route handlers — so looking the id up as-is silently
 * finds nothing and the page reports the product as missing.
 *
 * Client components are unaffected: `useParams()` already decodes.
 */
export function decodeRouteId(id: string): string {
  try {
    return decodeURIComponent(id)
  } catch {
    // Malformed escape (a literal % in the id) — use it as it came.
    return id
  }
}
