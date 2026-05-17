'use server'

import { redirect } from 'next/navigation'

import { generateSlug } from '@/lib/utils/slug'
import { createClient } from '@/lib/supabase/server'
import { createEventSchema } from '@/lib/validations/events'

type ActionResult = {
  error?: string
}

export async function createEvent(formData: FormData): Promise<ActionResult> {
  const raw = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,
    date: formData.get('date') as string,
    time: formData.get('time') as string,
    location: (formData.get('location') as string) || undefined,
    items: JSON.parse((formData.get('items') as string) ?? '[]'),
  }

  const parsed = createEventSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const coverFile = formData.get('cover') as File | null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { title, description, date, time, location, items } = parsed.data
  const eventDate = new Date(`${date}T${time}`)
  const slug = generateSlug(title)

  let coverUrl: string | null = null

  if (coverFile && coverFile.size > 0) {
    if (coverFile.size > 5 * 1024 * 1024) {
      return { error: 'Cover image must be less than 5MB' }
    }

    const ext = coverFile.name.split('.').pop()
    const path = `${user.id}/${slug}/cover.${ext}`

    const { data: upload, error: uploadError } = await supabase.storage
      .from('event-covers')
      .upload(path, coverFile, { upsert: true })

    if (uploadError) return { error: 'Failed to upload cover image' }

    coverUrl = supabase.storage.from('event-covers').getPublicUrl(upload.path).data.publicUrl
  }

  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      host_id: user.id,
      title,
      description: description ?? null,
      date: eventDate.toISOString(),
      location: location ?? null,
      slug,
      cover_url: coverUrl,
    })
    .select('id, slug')
    .single()

  if (eventError) return { error: 'Failed to create event' }

  if (items && items.length > 0) {
    const { error: itemsError } = await supabase.from('items').insert(
      items.map((item) => ({
        event_id: event.id,
        name: item.name,
        estimated_cost: item.estimated_cost ?? null,
        created_by_host: true,
      }))
    )

    if (itemsError) return { error: 'Event created but failed to save items' }
  }

  redirect(`/events/${event.slug}`)
}
