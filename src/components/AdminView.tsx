import { useState } from 'react'
import { useMenu } from '../MenuContext'
import { encodeConfig, isDefaultConfig } from '../menuConfig'
import { buildOrderLines, buildRosterExport, buildRosterText, gbp, orderTotal, rosterTotal } from '../orderUtils'
import type { GuestEntry } from '../types'
import { GuestEditor } from './GuestEditor'
import { GuestLinkBox } from './GuestLinkBox'

interface Props {
  guests: GuestEntry[]
  pubEmail: string
  onAddPasted: (input: string) => boolean
  onRemoveGuest: (id: string) => void
  onUpdateGuestName: (id: string, name: string) => void
  onUpdateGuestOrder: (id: string, key: string, qty: number) => void
  onSetPubEmail: (email: string) => void
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function AdminView({
  guests,
  pubEmail,
  onAddPasted,
  onRemoveGuest,
  onUpdateGuestName,
  onUpdateGuestOrder,
  onSetPubEmail,
}: Props) {
  const { skuMap, config } = useMenu()
  const [paste, setPaste] = useState('')
  const [pasteError, setPasteError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editingGuest = guests.find((g) => g.id === editingId) ?? null
  const grand = rosterTotal(guests, skuMap)

  const guestLink = `${location.origin}${location.pathname}#m=${encodeConfig(config)}`
  const emailOk = EMAIL_RE.test(pubEmail.trim())
  const hasGuests = guests.length > 0

  function handleAdd() {
    const ok = onAddPasted(paste)
    if (ok) {
      setPaste('')
      setPasteError(false)
    } else {
      setPasteError(true)
    }
  }

  function downloadJson() {
    const data = buildRosterExport(guests, skuMap)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crown-rose-table-order-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function copyAll() {
    const text = buildRosterText(guests, skuMap)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  function emailPub() {
    const subject = `Pre-order for ${guests.length} — Rose & Crown · Nicola & Jennifer's 50th`
    const body = buildRosterText(guests, skuMap)
    window.location.href = `mailto:${encodeURIComponent(pubEmail.trim())}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="admin">
      <p className="role-intro">
        Add each guest’s order as it comes in, then send the whole table to the pub.
      </p>

      <section className="admin-card">
        <div className="admin-roster-head">
          <h2>Invite guests</h2>
          <a className="roster-edit" href="#menu">
            Menu setup
          </a>
        </div>
        <p className="admin-hint">
          Share this link with the family — it includes your menu{' '}
          {isDefaultConfig(config) ? '(currently the full menu).' : 'changes.'}
        </p>
        <GuestLinkBox link={guestLink} />
      </section>

      <section className="admin-card">
        <h2>Add a guest’s order</h2>
        <p className="admin-hint">Paste the link or code a guest sent you.</p>
        <div className="paste-row">
          <input
            type="text"
            className="share-field"
            placeholder="Paste link or code…"
            value={paste}
            onChange={(e) => {
              setPaste(e.target.value)
              setPasteError(false)
            }}
            aria-label="Paste a guest order link or code"
          />
          <button type="button" className="btn primary" disabled={!paste.trim()} onClick={handleAdd}>
            Add
          </button>
        </div>
        {pasteError && <p className="hint">That link or code couldn’t be read — check it and try again.</p>}
      </section>

      <section className="admin-card">
        <div className="admin-roster-head">
          <h2>Guest list ({guests.length})</h2>
          <span className="grand-pill">{gbp(grand)}</span>
        </div>

        {!hasGuests && (
          <p className="empty">No guests yet. Share the guest link, then add the orders here.</p>
        )}

        <ol className="roster">
          {guests.map((g) => {
            const lines = buildOrderLines(g.order, skuMap)
            return (
              <li className="roster-guest" key={g.id}>
                <div className="roster-guest-head">
                  <input
                    className="roster-name"
                    type="text"
                    value={g.name}
                    placeholder="Guest name"
                    onChange={(e) => onUpdateGuestName(g.id, e.target.value)}
                    aria-label="Guest name"
                  />
                  <span className="roster-subtotal">{gbp(orderTotal(g.order, skuMap))}</span>
                  <button
                    type="button"
                    className="roster-edit"
                    onClick={() => setEditingId(g.id)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="summary-line-remove"
                    aria-label={`Remove ${g.name || 'guest'}`}
                    onClick={() => {
                      if (window.confirm(`Remove ${g.name || 'this guest'} from the list?`))
                        onRemoveGuest(g.id)
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="roster-items">
                  {lines.length === 0 && <p className="empty">No items.</p>}
                  {lines.map((l) => (
                    <div className="roster-item" key={l.key}>
                      <span>
                        {l.qty} × {l.name}
                        {l.variantLabel ? ` (${l.variantLabel})` : ''}
                      </span>
                      <span className="roster-item-end">
                        {gbp(l.lineTotal)}
                        <button
                          type="button"
                          className="summary-line-remove"
                          aria-label={`Remove ${l.name}`}
                          onClick={() => onUpdateGuestOrder(g.id, l.key, 0)}
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </li>
            )
          })}
        </ol>

        {hasGuests && (
          <div className="total-row grand">
            <span>Table total</span>
            <span>{gbp(grand)}</span>
          </div>
        )}
      </section>

      <section className="admin-card">
        <h2>Send to the pub</h2>
        <div className="field">
          <label htmlFor="pub-email">Pub email</label>
          <input
            id="pub-email"
            type="email"
            value={pubEmail}
            placeholder="bookings@crownrose.example"
            onChange={(e) => onSetPubEmail(e.target.value)}
            aria-invalid={pubEmail.length > 0 && !emailOk}
          />
        </div>
        <div className="summary-actions">
          <button
            type="button"
            className="btn primary"
            disabled={!hasGuests || !emailOk}
            onClick={emailPub}
          >
            Email the pub
          </button>
          <button type="button" className="btn" disabled={!hasGuests} onClick={copyAll}>
            {copied ? 'Copied!' : 'Copy all'}
          </button>
          <button type="button" className="btn ghost" disabled={!hasGuests} onClick={downloadJson}>
            Download JSON
          </button>
        </div>
        {hasGuests && !emailOk && (
          <p className="hint">Enter the pub’s email to enable the email button.</p>
        )}
        <p className="service-note">A discretionary 10% service charge applies in the pub.</p>
      </section>

      {editingGuest && (
        <GuestEditor
          guest={editingGuest}
          onName={(name) => onUpdateGuestName(editingGuest.id, name)}
          onSetQty={(key, qty) => onUpdateGuestOrder(editingGuest.id, key, qty)}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  )
}
