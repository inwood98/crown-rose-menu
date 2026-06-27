export type Dietary = 'veg' | 'vegan' | 'ngci'

export type Category =
  | 'Starters & Sharing'
  | 'Mains'
  | 'Lunchtime'
  | 'Sides'
  | 'Desserts'
  | 'Drinks'

export interface Variant {
  /** Size/option label, e.g. "10pc" or "Full Rack". Omitted for single-price items. */
  label?: string
  price: number
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  category: Category
  dietary: Dietary[]
  variants: Variant[]
}

/** A single selectable line: one item + one of its variants. */
export interface Sku {
  key: string
  item: MenuItem
  variant: Variant
}

/** Map of sku key -> quantity ordered. */
export type Order = Record<string, number>

/** One diner in the organiser's roster. */
export interface GuestEntry {
  id: string
  name: string
  order: Order
  addedAt: string
}
