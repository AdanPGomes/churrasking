import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export async function getEventItems(supabase: SupabaseClient<Database>, eventId: string) {
  const { data, error } = await supabase
    .from('items')
    .select(
      `
        id,
        name,
        estimated_cost,
        created_by_host,
        assigned_guest_id,
        guests (
            id,
            name
        )
    `
    )
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getEventItems error:', error.message)
    return []
  }

  return data
}
