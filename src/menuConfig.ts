import { fromUrlSafeB64, toUrlSafeB64 } from './b64'
import { CATEGORIES, MENU, skuKey } from './menu'
import type { Category, MenuItem, Sku } from './types'

/**
 * Organiser overrides applied on top of the hard-coded menu. Only the changes
 * are stored, so the original menu is always the fallback. The config travels
 * to guests inside the share link (`#m=…`).
 */
export interface MenuConfig {
  /** Categories the organiser has hidden. */
  hidden: Category[]
  /** itemId -> overridden name. */
  names: Record<string, string>
  /** skuKey (itemId::variantIndex) -> overridden price. */
  prices: Record<string, number>
}

export const EMPTY_CONFIG: MenuConfig = { hidden: [], names: {}, prices: {} }

const CONFIG_KEY = 'crown-rose-menu-config'

export interface MenuData {
  config: MenuConfig
  /** Effective items (name/price overrides applied), all categories. */
  items: MenuItem[]
  /** Categories shown to guests, in menu order, minus hidden ones. */
  visibleCategories: Category[]
  /** Resolves a sku key to its effective item + variant. */
  skuMap: Map<string, Sku>
}

/** Apply a config to the base menu and derive the lookup map. */
export function computeMenuData(config: MenuConfig): MenuData {
  const items: MenuItem[] = MENU.map((item) => {
    const name = config.names[item.id] ?? item.name
    const variants = item.variants.map((v, i) => {
      const price = config.prices[skuKey(item.id, i)]
      return typeof price === 'number' ? { ...v, price } : v
    })
    return { ...item, name, variants }
  })

  const skuMap = new Map<string, Sku>()
  for (const item of items) {
    item.variants.forEach((variant, i) => {
      const key = skuKey(item.id, i)
      skuMap.set(key, { key, item, variant })
    })
  }

  const visibleCategories = CATEGORIES.filter((c) => !config.hidden.includes(c))
  return { config, items, visibleCategories, skuMap }
}

function sanitize(raw: Partial<MenuConfig> | null | undefined): MenuConfig {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_CONFIG }
  return {
    hidden: Array.isArray(raw.hidden)
      ? raw.hidden.filter((c): c is Category => CATEGORIES.includes(c as Category))
      : [],
    names: raw.names && typeof raw.names === 'object' ? { ...raw.names } : {},
    prices:
      raw.prices && typeof raw.prices === 'object'
        ? Object.fromEntries(
            Object.entries(raw.prices).filter(([, v]) => typeof v === 'number' && v >= 0),
          )
        : {},
  }
}

export function encodeConfig(config: MenuConfig): string {
  return toUrlSafeB64(JSON.stringify(config))
}

export function decodeConfig(code: string): MenuConfig | null {
  try {
    return sanitize(JSON.parse(fromUrlSafeB64(code.trim())))
  } catch {
    return null
  }
}

export function loadMenuConfig(): MenuConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    return raw ? sanitize(JSON.parse(raw)) : { ...EMPTY_CONFIG }
  } catch {
    return { ...EMPTY_CONFIG }
  }
}

export function saveMenuConfig(config: MenuConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  } catch {
    // ignore
  }
}

/** True when the config has no overrides at all. */
export function isDefaultConfig(c: MenuConfig): boolean {
  return c.hidden.length === 0 && Object.keys(c.names).length === 0 && Object.keys(c.prices).length === 0
}
