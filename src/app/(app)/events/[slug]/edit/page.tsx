import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getEventBySlug } from '@/lib/queries/events'
import { PageHeader } from '@/components/layout/page-header'
import { PageContainer } from '@/components/layout/page-container'
import { EditEventForm } from '@/components/events/edit-event-form'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EditEventPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const event = await getEventBySlug(supabase, slug)

  if (!event) notFound()

  return (
    <PageContainer>
      <PageHeader
        title="Editar evento"
        breadcrumbs={[
          { label: 'Dashboard', href: 'dashboard' },
          { label: event.title, href: `/events/${slug}` },
          { label: 'Editar' },
        ]}
      />

      <EditEventForm event={event} />
    </PageContainer>
  )
}
