'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getGuestSession } from '@/lib/guest-session'
import { addItemSchema, type AddItemInput } from '@/lib/validations/items'

type ActionResult = { error?: string }

export async function addItem(
  eventId: string,
  eventSlug: string,
  data: AddItemInput
): Promise<ActionResult> {
  const parsed = addItemSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('items').insert({
    event_id: eventId,
    name: parsed.data.name,
    estimated_cost: parsed.data.estimated_cost ?? null,
    created_by_host: true,
  })

  if (error) return { error: 'Failed to add item' }

  revalidatePath(`/events/${eventSlug}`)
  return {}
}

export async function deleteItem(itemId: string, eventSlug: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)
    .is('assigned_guest_id', null)

  if (error) return { error: 'Failed to delete item' }

  revalidatePath(`/events/${eventSlug}`)
  return {}
}

export async function claimItem(itemId: string, eventSlug: string): Promise<ActionResult> {
  const session = await getGuestSession()
  if (!session) return { error: 'Session expired. Please identify yourself again.' }

  const supabase = await createClient()

  const { error } = await supabase.rpc('claim_item', {
    p_item_id: itemId,
    p_guest_id: session.guestId,
  })

  if (error) {
    if (error.code === 'P0001') return { error: 'This item was just claimed by someone else.' }
    return { error: 'Failed to claim item' }
  }

  revalidatePath(`/c/${eventSlug}`)
  return {}
}

export async function unclaimItem(itemId: string, eventSlug: string): Promise<ActionResult> {
  const session = await getGuestSession()
  if (!session) return { error: 'Session expired. Please identify yourself again.' }

  const supabase = await createClient()

  const { error } = await supabase.rpc('unclaim_item', {
    p_item_id: itemId,
    p_guest_id: session.guestId,
  })

  if (error) {
    if (error.code === 'P0002') return { error: 'You have not claimed this item.' }
    return { error: 'Failed to unclaim item' }
  }

  revalidatePath(`/c/${eventSlug}`)
  return {}
}
