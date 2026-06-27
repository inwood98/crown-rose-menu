import type { Order } from './types'

export type Theme = 'light' | 'dark'

const GUEST_KEY = 'crown-rose-guest-v1'
const THEME_KEY = 'crown-rose-theme'

export interface GuestDraft {
  name: string
  order: Order
}

const EMPTY_DRAFT: GuestDraft = { name: '', order: {} }

export function loadGuestDraft(): GuestDraft {
  try {
    const raw = localStorage.getItem(GUEST_KEY)
    if (!raw) return { ...EMPTY_DRAFT }
    const parsed = JSON.parse(raw) as Partial<GuestDraft>
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      order: parsed.order && typeof parsed.order === 'object' ? parsed.order : {},
    }
  } catch {
    return { ...EMPTY_DRAFT }
  }
}

export function saveGuestDraft(draft: GuestDraft): void {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(draft))
  } catch {
    // ignore
  }
}

export function loadTheme(): Theme {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // ignore
  }
}
