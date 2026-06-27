import { useEffect, useState } from 'react'
import { buildOrderLines, gbp, orderItemCount, orderTotal } from '../orderUtils'
import { buildShareLink, encodeOrder } from '../share'
import type { Order } from '../types'

interface Props {
  name: string
  order: Order
  onName: (v: string) => void
  onSetQty: (key: string, qty: number) => void
  onClear: () => void
}

export function MyOrderPanel({ name, order, onName, onSetQty, onClear }: Props) {
  const [created, setCreated] = useState(false)
  const [copied, setCopied] = useState<'link' | 'code' | null>(null)

  const lines = buildOrderLines(order)
  const total = orderTotal(order)
  const count = orderItemCount(order)
  const nameOk = name.trim().length > 0
  const hasItems = lines.length > 0
  const canCreate = nameOk && hasItems

  // If the order changes after creating, drop the stale share output.
  useEffect(() => {
    setCreated(false)
  }, [name, order])

  const link = created ? buildShareLink(name.trim(), order) : ''
  const code = created ? encodeOrder(name.trim(), order) : ''

  async function copy(value: string, which: 'link' | 'code') {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(which)
    window.setTimeout(() => setCopied(null), 2000)
  }

  return (
    <aside className="order-summary" aria-label="My order">
      <h2>My order</h2>

      <div className="field">
        <label htmlFor="guest-name">
          Your name <span className="req">*</span>
        </label>
        <input
          id="guest-name"
          type="text"
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="e.g. Gary"
          aria-invalid={!nameOk}
        />
      </div>

      <div className="summary-lines">
        {!hasItems && <p className="empty">Pick anything from the menu — starters, mains, dessert, drinks.</p>}
        {lines.map((l) => (
          <div className="summary-line" key={l.key}>
            <div className="summary-line-info">
              <span className="summary-line-name">
                {l.name}
                {l.variantLabel ? ` (${l.variantLabel})` : ''}
              </span>
              <span className="summary-line-sub">
                {l.qty} × {gbp(l.unitPrice)}
              </span>
            </div>
            <span className="summary-line-total">{gbp(l.lineTotal)}</span>
            <button
              type="button"
              className="summary-line-remove"
              aria-label={`Remove ${l.name}`}
              onClick={() => onSetQty(l.key, 0)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="summary-totals">
        <div className="total-row">
          <span>Items</span>
          <span>{count}</span>
        </div>
        <div className="total-row grand">
          <span>My total</span>
          <span>{gbp(total)}</span>
        </div>
      </div>

      {!created && (
        <div className="summary-actions">
          <button
            type="button"
            className="btn primary"
            disabled={!canCreate}
            onClick={() => setCreated(true)}
          >
            Create my order
          </button>
          <button type="button" className="btn ghost" disabled={!hasItems} onClick={onClear}>
            Clear
          </button>
          {!canCreate && hasItems && <p className="hint">Add your name first.</p>}
        </div>
      )}

      {created && (
        <div className="share-box">
          <p className="share-intro">
            Send this to the organiser. They’ll add it to the table’s order for the pub.
          </p>
          <div className="share-row">
            <input className="share-field" type="text" readOnly value={link} aria-label="Order link" />
            <button type="button" className="btn primary" onClick={() => copy(link, 'link')}>
              {copied === 'link' ? 'Copied!' : 'Copy link'}
            </button>
          </div>
          <button type="button" className="btn" onClick={() => copy(code, 'code')}>
            {copied === 'code' ? 'Copied!' : 'Copy code instead'}
          </button>
          <button type="button" className="btn ghost" onClick={() => setCreated(false)}>
            Edit my order
          </button>
        </div>
      )}
    </aside>
  )
}
