import type { Dietary } from '../types'
import { DIETARY_META, DIETARY_ORDER } from './dietary'

interface Props {
  search: string
  onSearch: (value: string) => void
  filters: Set<Dietary>
  onToggleFilter: (d: Dietary) => void
}

export function FilterBar({ search, onSearch, filters, onToggleFilter }: Props) {
  return (
    <div className="filter-bar">
      <input
        type="search"
        className="search-input"
        placeholder="Search the menu…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        aria-label="Search the menu"
      />
      <div className="diet-filters" role="group" aria-label="Dietary filters">
        {DIETARY_ORDER.map((d) => {
          const active = filters.has(d)
          return (
            <button
              key={d}
              type="button"
              className="diet-filter"
              data-active={active}
              aria-pressed={active}
              onClick={() => onToggleFilter(d)}
            >
              {DIETARY_META[d].symbol !== DIETARY_META[d].label && (
                <span aria-hidden="true">{DIETARY_META[d].symbol} </span>
              )}
              {DIETARY_META[d].label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
