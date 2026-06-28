import { useMemo, useState } from 'react'
import { useMenu } from '../MenuContext'
import type { Category, Dietary, MenuItem, Order } from '../types'
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
  const { items: menuItems, visibleCategories } = useMenu()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Set<Dietary>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<Category>>(new Set())

  function toggleFilter(d: Dietary) {
    setFilters((prev) => {
      const next = new Set(prev)
      if (next.has(d)) next.delete(d)
      else next.add(d)
      return next
    })
  }

  function toggleCategory(cat: Category) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  // While searching, force every section open so matches are never hidden.
  const searchActive = search.trim().length > 0

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
    for (const cat of visibleCategories) {
      map.set(cat, menuItems.filter((item) => item.category === cat && match(item)))
    }
    return map
  }, [search, filters, menuItems, visibleCategories])

  const shownCategories = visibleCategories.filter(
    (cat) => (visibleByCategory.get(cat) ?? []).length > 0,
  )
  const totalVisible = shownCategories.reduce((n, cat) => n + (visibleByCategory.get(cat)?.length ?? 0), 0)
  const allCollapsed = !searchActive && shownCategories.every((cat) => collapsed.has(cat))

  function toggleAll() {
    setCollapsed(allCollapsed ? new Set() : new Set(shownCategories))
  }

  return (
    <>
      <FilterBar search={search} onSearch={setSearch} filters={filters} onToggleFilter={toggleFilter} />

      {totalVisible === 0 && (
        <p className="empty no-results">No dishes match your search or filters.</p>
      )}

      {shownCategories.length > 0 && !searchActive && (
        <div className="collapse-all-row">
          <button type="button" className="collapse-all" onClick={toggleAll}>
            {allCollapsed ? 'Expand all' : 'Collapse all'}
          </button>
        </div>
      )}

      {shownCategories.map((cat) => {
        const items = visibleByCategory.get(cat) ?? []
        const isOpen = searchActive || !collapsed.has(cat)
        // How many of this guest's selected items fall in this category (for the badge).
        const inOrder = menuItems.filter((m) => m.category === cat).reduce(
          (n, item) => n + item.variants.reduce((s, _v, i) => s + (order[`${item.id}::${i}`] ?? 0), 0),
          0,
        )
        return (
          <section className="menu-section" key={cat}>
            <h2 className="section-heading">
              <button
                type="button"
                className="section-toggle"
                aria-expanded={isOpen}
                disabled={searchActive}
                onClick={() => toggleCategory(cat)}
              >
                <span className="section-name">{cat}</span>
                {inOrder > 0 && <span className="section-badge">{inOrder}</span>}
                <span className="section-chevron" aria-hidden="true" data-open={isOpen}>
                  ⌄
                </span>
              </button>
            </h2>
            {isOpen && (
              <div className="menu-items">
                {items.map((item) => (
                  <MenuItemRow key={item.id} item={item} order={order} onSetQty={onSetQty} />
                ))}
              </div>
            )}
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
