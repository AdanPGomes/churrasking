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

async function getchEventWithGuests(
  supabase: SupabaseClient<Database>,
  slug: string,
  hostId: string
) {
  return supabase
    .from('events')
    .select(
      `
        id,
        title,
        description,
        date,
        location,
        cover_url,
        slug,
        guests (
          id,
          name,
          email,
          rsvp_status,
          created_at
        )
      `
    )
    .eq('slug', slug)
    .eq('host_id', hostId)
    .single()
}

async function getchEventSummary(supabase: SupabaseClient<Database>, slug: string, hostId: string) {
  return supabase
    .from('event_summary')
    .select('total_guests, confirmed_guests, declined_guests, pending_guests')
    .eq('slug', slug)
    .eq('host_id', hostId)
    .single()
}

export async function getEventBySlug(supabase: SupabaseClient<Database>, slug: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [eventResult, summaryResult] = await Promise.all([
    getchEventWithGuests(supabase, slug, user.id),
    getchEventSummary(supabase, slug, user.id),
  ])

  if (eventResult.error || summaryResult.error) {
    console.error(
      'getEventBySlug error:',
      eventResult.error?.message ?? summaryResult.error?.message
    )
    return null
  }

  return {
    ...eventResult.data,
    ...summaryResult.data,
  }
}
