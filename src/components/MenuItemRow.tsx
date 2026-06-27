import { skuKey } from '../menu'
import { gbp } from '../orderUtils'
import type { MenuItem, Order } from '../types'
import { DIETARY_META, DIETARY_ORDER } from './dietary'
import { QuantityStepper } from './QuantityStepper'

interface Props {
  item: MenuItem
  order: Order
  onSetQty: (key: string, qty: number) => void
}

export function MenuItemRow({ item, order, onSetQty }: Props) {
  const hasVariants = item.variants.length > 1

  return (
    <article className="menu-item">
      <div className="menu-item-head">
        <div className="menu-item-title">
          <h3>{item.name}</h3>
          <ul className="diet-badges" aria-label="dietary information">
            {DIETARY_ORDER.filter((d) => item.dietary.includes(d)).map((d) => (
              <li key={d} className={`diet-badge diet-${d}`} title={DIETARY_META[d].title}>
                <span aria-hidden="true">{DIETARY_META[d].symbol}</span>
                <span className="sr-only">{DIETARY_META[d].title}</span>
              </li>
            ))}
          </ul>
        </div>
        {item.description && <p className="menu-item-desc">{item.description}</p>}
      </div>

      <div className="menu-item-variants">
        {item.variants.map((variant, i) => {
          const key = skuKey(item.id, i)
          const label = variant.label ? `${item.name} ${variant.label}` : item.name
          return (
            <div className="variant-row" key={key}>
              <span className="variant-label">
                {variant.label && <span className="variant-size">{variant.label}</span>}
                <span className="variant-price">{gbp(variant.price)}</span>
              </span>
              <QuantityStepper
                qty={order[key] ?? 0}
                label={label}
                onChange={(qty) => onSetQty(key, qty)}
              />
            </div>
          )
        })}
        {!hasVariants && null}
      </div>
    </article>
  )
}
