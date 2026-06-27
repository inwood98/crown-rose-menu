import { SKU_BY_KEY } from './menu'
import type { GuestEntry, Order } from './types'

export interface OrderLine {
  key: string
  name: string
  variantLabel?: string
  qty: number
  unitPrice: number
  lineTotal: number
}

/** Resolve the order map into display lines, in menu order, skipping zero quantities. */
export function buildOrderLines(order: Order): OrderLine[] {
  const lines: OrderLine[] = []
  for (const [key, sku] of SKU_BY_KEY) {
    const qty = order[key] ?? 0
    if (qty <= 0) continue
    lines.push({
      key,
      name: sku.item.name,
      variantLabel: sku.variant.label,
      qty,
      unitPrice: sku.variant.price,
      lineTotal: qty * sku.variant.price,
    })
  }
  return lines
}

export function orderTotal(order: Order): number {
  return buildOrderLines(order).reduce((sum, l) => sum + l.lineTotal, 0)
}

export function orderItemCount(order: Order): number {
  return Object.values(order).reduce((sum, q) => sum + (q > 0 ? q : 0), 0)
}

export const gbp = (n: number): string =>
  n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })

/** A single guest's items as indented text lines. */
function guestLines(g: GuestEntry): string[] {
  return buildOrderLines(g.order).map((l) => {
    const label = l.variantLabel ? `${l.name} (${l.variantLabel})` : l.name
    return `  ${l.qty} × ${label} — ${gbp(l.lineTotal)}`
  })
}

export function rosterTotal(guests: GuestEntry[]): number {
  return guests.reduce((sum, g) => sum + orderTotal(g.order), 0)
}

export interface RosterExport {
  pub: string
  guests: {
    name: string
    items: { name: string; size?: string; qty: number; unitPrice: number; lineTotal: number }[]
    total: number
  }[]
  grandTotal: number
  guestCount: number
  timestamp: string
}

export function buildRosterExport(guests: GuestEntry[]): RosterExport {
  return {
    pub: 'Rose & Crown',
    guests: guests.map((g) => ({
      name: g.name,
      items: buildOrderLines(g.order).map((l) => ({
        name: l.name,
        size: l.variantLabel,
        qty: l.qty,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
      })),
      total: orderTotal(g.order),
    })),
    grandTotal: rosterTotal(guests),
    guestCount: guests.length,
    timestamp: new Date().toISOString(),
  }
}

/** Full roster as plain text for emailing the pub. */
export function buildRosterText(guests: GuestEntry[]): string {
  const out: string[] = []
  out.push("Rose & Crown — Pre-Order · Nicola & Jennifer's 50th Birthday")
  out.push(`Guests: ${guests.length}`)
  out.push('')
  guests.forEach((g, i) => {
    out.push(`${i + 1}. ${g.name || 'Guest'} — ${gbp(orderTotal(g.order))}`)
    const lines = guestLines(g)
    if (lines.length === 0) out.push('  (no items)')
    else out.push(...lines)
    out.push('')
  })
  out.push(`TABLE TOTAL: ${gbp(rosterTotal(guests))}`)
  out.push(`Submitted: ${new Date().toLocaleString('en-GB')}`)
  return out.join('\n')
}
