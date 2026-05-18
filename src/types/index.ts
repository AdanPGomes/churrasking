import { Database } from '@/types/supabase'

export type RsvpStatus = 'confirmed' | 'declined' | 'pending'

export type Guest = Omit<Database['public']['Tables']['guests']['Row'], 'rsvp_status'> & {
  rsvp_status: RsvpStatus
}

export type Event = Database['public']['Tables']['events']['Row']
