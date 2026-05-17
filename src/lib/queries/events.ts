import { SupabaseClient } from '@supabase/supabase-js'

import { Database } from '@/types/supabase'

export async function getHostEvents(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('event_summary')
    .select('*')
    .eq('host_id', user.id)
    .order('date', { ascending: false })

  if (error) {
    console.error('getHostEvents error:', error.message)
    return []
  }

  return data
}

export async function getHostStats(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('host_stats')
    .select('*')
    .eq('host_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('getHostStats error:', error.message)
    return null
  }

  return data
}
