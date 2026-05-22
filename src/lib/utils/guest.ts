import { ItemWithGuest } from '@/types'

export function resolveGuest(guests: ItemWithGuest['guests']): { id: string; name: string } | null {
  if (!guests) return null
  const guest = Array.isArray(guests) ? guests[0] : guests
  return guest ?? null
}
