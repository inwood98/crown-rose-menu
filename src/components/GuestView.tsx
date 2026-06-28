import { useEffect, useMemo, useState } from 'react'
import { useMenu } from '../MenuContext'
import { gbp, orderItemCount, orderTotal } from '../orderUtils'
import { loadGuestDraft, saveGuestDraft } from '../storage'
import type { Order } from '../types'
import { MenuBrowser } from './MenuBrowser'
import { MyOrderPanel } from './MyOrderPanel'

export function GuestView() {
  const { skuMap } = useMenu()
  const initial = useMemo(loadGuestDraft, [])
  const [name, setName] = useState(initial.name)
  const [order, setOrder] = useState<Order>(initial.order)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    saveGuestDraft({ name, order })
  }, [name, order])

  function setQty(key: string, qty: number) {
    setOrder((prev) => {
      const next = { ...prev }
      if (qty <= 0) delete next[key]
      else next[key] = qty
      return next
    })
  }

  const total = orderTotal(order, skuMap)
  const count = orderItemCount(order)

  return (
    <>
      <p className="role-intro">
        Choose what <strong>you</strong> want, add your name, then send your order to the organiser.
      </p>

      <div className="layout">
        <section className="menu-col" aria-label="Menu">
          <MenuBrowser order={order} onSetQty={setQty} />
        </section>

        <div className={`summary-col${panelOpen ? ' open' : ''}`}>
          <MyOrderPanel
            name={name}
            order={order}
            onName={setName}
            onSetQty={setQty}
            onClear={() => setOrder({})}
          />
        </div>
      </div>

      <button
        type="button"
        className="mobile-cart-bar"
        onClick={() => setPanelOpen((o) => !o)}
        aria-expanded={panelOpen}
      >
        <span>
          {count} item{count === 1 ? '' : 's'} · {gbp(total)}
        </span>
        <span className="mobile-cart-cta">{panelOpen ? 'Hide my order ▾' : 'My order ▴'}</span>
      </button>
    </>
  )
}
