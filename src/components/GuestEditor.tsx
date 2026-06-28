import { useMenu } from '../MenuContext'
import { gbp, orderItemCount, orderTotal } from '../orderUtils'
import type { GuestEntry } from '../types'
import { MenuBrowser } from './MenuBrowser'

interface Props {
  guest: GuestEntry
  onName: (name: string) => void
  onSetQty: (key: string, qty: number) => void
  onClose: () => void
}

/** Full-screen editor letting the organiser change a guest's order. */
export function GuestEditor({ guest, onName, onSetQty, onClose }: Props) {
  const { skuMap } = useMenu()
  const total = orderTotal(guest.order, skuMap)
  const count = orderItemCount(guest.order)

  return (
    <div className="editor-overlay" role="dialog" aria-modal="true" aria-label="Edit guest order">
      <div className="editor-top">
        <input
          className="editor-name"
          type="text"
          value={guest.name}
          placeholder="Guest name"
          onChange={(e) => onName(e.target.value)}
          aria-label="Guest name"
        />
        <button type="button" className="btn primary editor-done" onClick={onClose}>
          Done
        </button>
      </div>

      <div className="editor-body">
        <MenuBrowser order={guest.order} onSetQty={onSetQty} showAllergenNote={false} />
      </div>

      <div className="editor-footer">
        <span>
          {count} item{count === 1 ? '' : 's'} · {gbp(total)}
        </span>
        <button type="button" className="btn primary" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  )
}
