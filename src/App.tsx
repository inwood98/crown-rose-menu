import { useEffect, useMemo, useState } from 'react'
import { loadAdmin, newGuestId, saveAdmin, type AdminState } from './adminStorage'
import { loadTheme, saveTheme, type Theme } from './storage'
import { parseShared, type SharePayload } from './share'
import type { GuestEntry, Order } from './types'
import { AdminView } from './components/AdminView'
import { GuestView } from './components/GuestView'
import { ImportPrompt } from './components/ImportPrompt'
import { ThemeToggle } from './components/ThemeToggle'

type Route =
  | { kind: 'guest' }
  | { kind: 'admin' }
  | { kind: 'import'; payload: SharePayload | null }

function routeFromHash(): Route {
  const hash = location.hash
  if (hash.startsWith('#g=')) {
    return { kind: 'import', payload: parseShared(hash) }
  }
  if (hash.startsWith('#admin')) return { kind: 'admin' }
  return { kind: 'guest' }
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const [route, setRoute] = useState<Route>(routeFromHash)
  const [admin, setAdmin] = useState<AdminState>(loadAdmin)

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    saveTheme(theme)
  }, [theme])

  useEffect(() => {
    saveAdmin(admin)
  }, [admin])

  function addGuest(payload: SharePayload) {
    const entry: GuestEntry = {
      id: newGuestId(),
      name: payload.name,
      order: payload.order,
      addedAt: new Date().toISOString(),
    }
    setAdmin((prev) => ({ ...prev, guests: [...prev.guests, entry] }))
  }

  function removeGuest(id: string) {
    setAdmin((prev) => ({ ...prev, guests: prev.guests.filter((g) => g.id !== id) }))
  }

  function updateGuestName(id: string, name: string) {
    setAdmin((prev) => ({
      ...prev,
      guests: prev.guests.map((g) => (g.id === id ? { ...g, name } : g)),
    }))
  }

  function updateGuestOrder(id: string, key: string, qty: number) {
    setAdmin((prev) => ({
      ...prev,
      guests: prev.guests.map((g) => {
        if (g.id !== id) return g
        const order: Order = { ...g.order }
        if (qty <= 0) delete order[key]
        else order[key] = qty
        return { ...g, order }
      }),
    }))
  }

  const isAdminSide = route.kind === 'admin' || route.kind === 'import'

  const headerSub = useMemo(
    () => (isAdminSide ? 'Organiser · table order' : 'Pre-book your meal · June 2026'),
    [isAdminSide],
  )

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">🌹</span>
          <div>
            <h1>BA Crown Rose</h1>
            <p>{headerSub}</p>
          </div>
        </div>
        <div className="header-actions">
          <a
            className="role-link"
            href={isAdminSide ? '#' : '#admin'}
            aria-label={isAdminSide ? 'Switch to guest entry' : 'Switch to organiser view'}
          >
            {isAdminSide ? 'Guest entry' : 'Organiser'}
          </a>
          <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
        </div>
      </header>

      <a
        className="pdf-banner"
        href={`${import.meta.env.BASE_URL}crown-rose-menu-june-2026.pdf`}
        target="_blank"
        rel="noopener noreferrer"
      >
        📄 View the original menu PDF
      </a>

      <main>
        {route.kind === 'guest' && <GuestView />}

        {route.kind === 'admin' && (
          <AdminView
            guests={admin.guests}
            pubEmail={admin.pubEmail}
            onAddPasted={(input) => {
              const payload = parseShared(input)
              if (!payload) return false
              addGuest(payload)
              return true
            }}
            onRemoveGuest={removeGuest}
            onUpdateGuestName={updateGuestName}
            onUpdateGuestOrder={updateGuestOrder}
            onSetPubEmail={(email) => setAdmin((prev) => ({ ...prev, pubEmail: email }))}
          />
        )}

        {route.kind === 'import' && (
          <ImportPrompt
            payload={route.payload}
            onAdd={(p) => {
              addGuest(p)
              location.hash = '#admin'
            }}
            onCancel={() => {
              location.hash = '#admin'
            }}
          />
        )}
      </main>
    </div>
  )
}
