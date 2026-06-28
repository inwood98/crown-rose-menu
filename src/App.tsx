import { useEffect, useMemo, useState } from 'react'
import { loadAdmin, newGuestId, saveAdmin, type AdminState } from './adminStorage'
import { MenuProvider } from './MenuContext'
import {
  decodeConfig,
  loadMenuConfig,
  saveMenuConfig,
  type MenuConfig,
} from './menuConfig'
import { loadTheme, saveTheme, type Theme } from './storage'
import { parseShared, type SharePayload } from './share'
import type { GuestEntry, Order } from './types'
import { AdminView } from './components/AdminView'
import { GuestView } from './components/GuestView'
import { ImportPrompt } from './components/ImportPrompt'
import { MenuSetup } from './components/MenuSetup'
import { ThemeToggle } from './components/ThemeToggle'

type Route =
  | { kind: 'guest' }
  | { kind: 'admin' }
  | { kind: 'menu' }
  | { kind: 'import'; payload: SharePayload | null }

function routeFromHash(): Route {
  const hash = location.hash
  if (hash.startsWith('#g=')) {
    return { kind: 'import', payload: parseShared(hash) }
  }
  if (hash.startsWith('#admin')) return { kind: 'admin' }
  if (hash.startsWith('#menu')) return { kind: 'menu' }
  return { kind: 'guest' }
}

/** Config from a guest link (#m=…) takes priority, then the saved config. */
function initialConfig(): MenuConfig {
  const m = location.hash.match(/#m=([A-Za-z0-9_-]+)/)
  if (m) {
    const cfg = decodeConfig(m[1])
    if (cfg) {
      saveMenuConfig(cfg)
      return cfg
    }
  }
  return loadMenuConfig()
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const [route, setRoute] = useState<Route>(routeFromHash)
  const [admin, setAdmin] = useState<AdminState>(loadAdmin)
  const [menuConfig, setMenuConfig] = useState<MenuConfig>(initialConfig)

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    saveMenuConfig(menuConfig)
  }, [menuConfig])

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

  const isAdminSide = route.kind !== 'guest'

  const headerSub = useMemo(
    () =>
      isAdminSide
        ? "Organiser · Nicola & Jennifer's 50th"
        : "Pre-book your meal · Nicola & Jennifer's 50th Birthday 🎉",
    [isAdminSide],
  )

  return (
    <MenuProvider config={menuConfig}>
    <div className="app">
      <header className="app-header">
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
        <div className="brand-lockup">
          <h1 className="sr-only">Rose &amp; Crown — pre-book your meal</h1>
          <img
            className="brand-logo-full"
            src={`${import.meta.env.BASE_URL}logo-rose-crown-icon.svg`}
            alt="Rose &amp; Crown crest"
          />
          <p className="brand-tagline">a Barons Pub</p>
          <p className="brand-sub">{headerSub}</p>
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

        {route.kind === 'menu' && (
          <MenuSetup config={menuConfig} onChange={setMenuConfig} />
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
    </MenuProvider>
  )
}
