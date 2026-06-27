import type { GuestEntry } from './types'

const ADMIN_KEY = 'crown-rose-admin-v1'

export interface AdminState {
  guests: GuestEntry[]
  pubEmail: string
}

const EMPTY: AdminState = { guests: [], pubEmail: '' }

export function loadAdmin(): AdminState {
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw) as Partial<AdminState>
    return {
      guests: Array.isArray(parsed.guests) ? parsed.guests : [],
      pubEmail: typeof parsed.pubEmail === 'string' ? parsed.pubEmail : '',
    }
  } catch {
    return { ...EMPTY }
  }
}

export function saveAdmin(state: AdminState): void {
  try {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

export function newGuestId(): string {
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}
