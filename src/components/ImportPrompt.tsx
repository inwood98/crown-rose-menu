import { buildOrderLines, gbp, orderTotal } from '../orderUtils'
import type { SharePayload } from '../share'

interface Props {
  payload: SharePayload | null
  onAdd: (payload: SharePayload) => void
  onCancel: () => void
}

export function ImportPrompt({ payload, onAdd, onCancel }: Props) {
  if (!payload) {
    return (
      <div className="import-prompt">
        <div className="import-card">
          <h2>Couldn’t read that order</h2>
          <p>The link or code looks incomplete. Ask the guest to send it again.</p>
          <button type="button" className="btn primary" onClick={onCancel}>
            Go to organiser view
          </button>
        </div>
      </div>
    )
  }

  const lines = buildOrderLines(payload.order)
  const total = orderTotal(payload.order)

  return (
    <div className="import-prompt">
      <div className="import-card">
        <h2>Add this order?</h2>
        <p className="import-name">
          <strong>{payload.name || 'Guest'}</strong>
        </p>
        <div className="summary-lines">
          {lines.length === 0 && <p className="empty">No items in this order.</p>}
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
            </div>
          ))}
        </div>
        <div className="total-row grand">
          <span>Total</span>
          <span>{gbp(total)}</span>
        </div>
        <div className="summary-actions">
          <button type="button" className="btn primary" onClick={() => onAdd(payload)}>
            Add to guest list
          </button>
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
