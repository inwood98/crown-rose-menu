import { fromUrlSafeB64, toUrlSafeB64 } from './b64'
import type { Order } from './types'

export interface SharePayload {
  name: string
  order: Order
}

/** Encode a guest's order into a compact, URL-safe code. */
export function encodeOrder(name: string, order: Order): string {
  // Short keys keep the code small: n = name, o = order map.
  return toUrlSafeB64(JSON.stringify({ n: name, o: order }))
}

/** Decode a code back into a payload, or null if it is malformed. */
export function decodeOrder(code: string): SharePayload | null {
  try {
    const raw = JSON.parse(fromUrlSafeB64(code.trim())) as { n?: unknown; o?: unknown }
    if (typeof raw.n !== 'string' || !raw.o || typeof raw.o !== 'object') return null
    const order: Order = {}
    for (const [k, v] of Object.entries(raw.o as Record<string, unknown>)) {
      if (typeof v === 'number' && v > 0) order[k] = v
    }
    return { name: raw.n, order }
  } catch {
    return null
  }
}

/** Build the full shareable link for a guest's order. */
export function buildShareLink(name: string, order: Order): string {
  const base = `${location.origin}${location.pathname}`
  return `${base}#g=${encodeOrder(name, order)}`
}

/**
 * Accept either a full share link or a bare code (what a guest pasted) and
 * return the payload. Tolerates `#g=…` anywhere in the string.
 */
export function parseShared(input: string): SharePayload | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const match = trimmed.match(/#g=([A-Za-z0-9_-]+)/)
  const code = match ? match[1] : trimmed
  return decodeOrder(code)
}
