import { useMemo, useState } from 'react'
import { CATEGORIES, MENU } from '../menu'
import type { Dietary, MenuItem, Order } from '../types'
import { FilterBar } from './FilterBar'
import { MenuItemRow } from './MenuItemRow'

interface Props {
  order: Order
  onSetQty: (key: string, qty: number) => void
  /** Show the allergen disclaimer under the menu (default true). */
  showAllergenNote?: boolean
}

/** The full menu with search + dietary filters, bound to an order. */
export function MenuBrowser({ order, onSetQty, showAllergenNote = true }: Props) {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Set<Dietary>>(new Set())

  function toggleFilter(d: Dietary) {
    setFilters((prev) => {
      const next = new Set(prev)
      if (next.has(d)) next.delete(d)
      else next.add(d)
      return next
    })
  }

  const visibleByCategory = useMemo(() => {
    const q = search.trim().toLowerCase()
    const active = [...filters]
    const match = (item: MenuItem) => {
      if (active.some((d) => !item.dietary.includes(d))) return false
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) || (item.description?.toLowerCase().includes(q) ?? false)
      )
    }
    const map = new Map<string, MenuItem[]>()
    for (const cat of CATEGORIES) {
      map.set(cat, MENU.filter((item) => item.category === cat && match(item)))
    }
    return map
  }, [search, filters])

  const totalVisible = [...visibleByCategory.values()].reduce((n, items) => n + items.length, 0)

  return (
    <>
      <FilterBar search={search} onSearch={setSearch} filters={filters} onToggleFilter={toggleFilter} />

      {totalVisible === 0 && (
        <p className="empty no-results">No dishes match your search or filters.</p>
      )}

      {CATEGORIES.map((cat) => {
        const items = visibleByCategory.get(cat) ?? []
        if (items.length === 0) return null
        return (
          <section className="menu-section" key={cat}>
            <h2 className="section-heading">{cat}</h2>
            <div className="menu-items">
              {items.map((item) => (
                <MenuItemRow key={item.id} item={item} order={order} onSetQty={onSetQty} />
              ))}
            </div>
          </section>
        )
      })}

      {showAllergenNote && (
        <p className="allergen-note">
          Dietary tags are a best-effort guide. Our food is prepared in kitchens where all allergens
          may be present — full allergen information is available from the pub on request. NGCI dishes
          are not guaranteed entirely gluten-free.
        </p>
      )}
    </>
  )
}
