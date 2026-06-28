/** URL-safe base64 helpers shared by order-sharing and menu-config encoding. */

export function toUrlSafeB64(s: string): string {
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(s)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fromUrlSafeB64(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}
