import type { Dietary } from '../types'

export const DIETARY_META: Record<Dietary, { label: string; symbol: string; title: string }> = {
  veg: { label: 'Veg', symbol: '🌱', title: 'Vegetarian' },
  vegan: { label: 'Vegan', symbol: '♻️', title: 'Vegan or vegan option available' },
  ngci: { label: 'GF', symbol: 'GF', title: 'Non-gluten-containing ingredients' },
}

export const DIETARY_ORDER: Dietary[] = ['veg', 'vegan', 'ngci']
