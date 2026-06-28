import { CATEGORIES, MENU, skuKey } from '../menu'
import { encodeConfig, isDefaultConfig, type MenuConfig } from '../menuConfig'
import { gbp } from '../orderUtils'
import type { Category } from '../types'
import { GuestLinkBox } from './GuestLinkBox'

interface Props {
  config: MenuConfig
  onChange: (config: MenuConfig) => void
}

export function MenuSetup({ config, onChange }: Props) {
  const guestLink = `${location.origin}${location.pathname}#m=${encodeConfig(config)}`

  function toggleCategory(cat: Category) {
    const hidden = config.hidden.includes(cat)
      ? config.hidden.filter((c) => c !== cat)
      : [...config.hidden, cat]
    onChange({ ...config, hidden })
  }

  function setEvent(field: 'when' | 'venue' | 'deadline', value: string) {
    const event = { ...(config.event ?? {}), [field]: value }
    const any = (event.when ?? '').trim() || (event.venue ?? '').trim() || (event.deadline ?? '').trim()
    onChange({ ...config, event: any ? event : undefined })
  }

  function setName(itemId: string, value: string, fallback: string) {
    const names = { ...config.names }
    const trimmed = value.trim()
    if (!trimmed || trimmed === fallback) delete names[itemId]
    else names[itemId] = value
    onChange({ ...config, names })
  }

  function setPrice(key: string, value: string, fallback: number) {
    const prices = { ...config.prices }
    const num = parseFloat(value)
    if (!Number.isFinite(num) || num < 0 || num === fallback) delete prices[key]
    else prices[key] = num
    onChange({ ...config, prices })
  }

  return (
    <div className="admin">
      <p className="role-intro">
        Turn sections on or off, and tweak any names or prices. Changes are carried in the guest
        link below — share that with the family.
      </p>

      <section className="admin-card">
        <div className="admin-roster-head">
          <h2>Guest link</h2>
          <a className="roster-edit" href="#admin">
            Back to organiser
          </a>
        </div>
        <GuestLinkBox link={guestLink} />
        {!isDefaultConfig(config) && (
          <button
            type="button"
            className="btn ghost reset-all"
            onClick={() => {
              if (window.confirm('Reset the whole menu back to default? This clears all changes.'))
                onChange({ hidden: [], names: {}, prices: {} })
            }}
          >
            Reset everything to default
          </button>
        )}
      </section>

      <section className="admin-card">
        <h2>Event details</h2>
        <p className="admin-hint">Shown to guests at the top of the menu. Leave blank to hide.</p>
        <div className="field">
          <label htmlFor="ev-when">When</label>
          <input
            id="ev-when"
            type="text"
            placeholder="e.g. Saturday 4 July 2026, 7pm"
            value={config.event?.when ?? ''}
            onChange={(e) => setEvent('when', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="ev-venue">Venue</label>
          <input
            id="ev-venue"
            type="text"
            placeholder="e.g. Rose & Crown"
            value={config.event?.venue ?? ''}
            onChange={(e) => setEvent('venue', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="ev-deadline">Order by (deadline)</label>
          <input
            id="ev-deadline"
            type="text"
            placeholder="e.g. Friday 27 June"
            value={config.event?.deadline ?? ''}
            onChange={(e) => setEvent('deadline', e.target.value)}
          />
        </div>
      </section>

      {CATEGORIES.map((cat) => {
        const hidden = config.hidden.includes(cat)
        const items = MENU.filter((m) => m.category === cat)
        return (
          <section className="admin-card" key={cat}>
            <div className="admin-roster-head">
              <h2>{cat}</h2>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={!hidden}
                  onChange={() => toggleCategory(cat)}
                  aria-label={`Show ${cat}`}
                />
                <span className="switch-label">{hidden ? 'Hidden' : 'Shown'}</span>
              </label>
            </div>

            {!hidden && (
              <ul className="setup-items">
                {items.map((item) => (
                  <li className="setup-item" key={item.id}>
                    <input
                      key={`name-${item.id}-${config.names[item.id] ?? 'def'}`}
                      className="setup-name"
                      type="text"
                      defaultValue={config.names[item.id] ?? item.name}
                      onBlur={(e) => setName(item.id, e.target.value, item.name)}
                      aria-label={`Name for ${item.name}`}
                    />
                    <div className="setup-prices">
                      {item.variants.map((variant, i) => {
                        const key = skuKey(item.id, i)
                        const current = config.prices[key] ?? variant.price
                        return (
                          <label className="setup-price" key={key}>
                            {variant.label && <span className="setup-price-label">{variant.label}</span>}
                            <span className="setup-price-input">
                              <span aria-hidden="true">£</span>
                              <input
                                key={`price-${key}-${config.prices[key] ?? 'def'}`}
                                type="number"
                                step="0.05"
                                min="0"
                                defaultValue={current.toFixed(2)}
                                onBlur={(e) => setPrice(key, e.target.value, variant.price)}
                                aria-label={`Price for ${item.name}${variant.label ? ' ' + variant.label : ''}`}
                              />
                            </span>
                            {config.prices[key] !== undefined && (
                              <button
                                type="button"
                                className="setup-reset"
                                title={`Reset to ${gbp(variant.price)}`}
                                onClick={() => setPrice(key, String(variant.price), variant.price)}
                              >
                                ↺
                              </button>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
