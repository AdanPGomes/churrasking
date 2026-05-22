import { Tables } from '@/types/supabase'

export type RsvpStatus = 'confirmed' | 'declined' | 'pending'

export type Guest = Omit<Tables<'guests'>, 'rsvp_status'> & {
  rsvp_status: RsvpStatus
}

export type Event = Tables<'events'>

export type Item = Tables<'items'>

type GuestSummary = Pick<Tables<'guests'>, 'id' | 'name'>

export type ItemWithGuest = Pick<Item, 'id' | 'name' | 'estimated_cost' | 'assigned_guest_id'> & {
  guests: GuestSummary | GuestSummary[] | null
}
