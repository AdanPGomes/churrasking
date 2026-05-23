import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { updateEvent } from '@/actions/events'
import { createClient } from '@/lib/supabase/server'
import { getEventBySlug } from '@/lib/queries/events'
import { EventForm } from '@/components/events/event-form'
import { PageHeader } from '@/components/layout/page-header'
import { PageContainer } from '@/components/layout/page-container'

function toDateInput(isoDate: string): string {
  return new Date(isoDate).toISOString().split('T')[0]
}

function toTimeInput(isoDate: string): string {
  return new Date(isoDate).toTimeString().slice(0, 5)
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EditEventPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const event = await getEventBySlug(supabase, slug)
  if (!event) notFound()

  const t = await getTranslations('Events')

  const defaultValues = {
    title: event.title,
    description: event.description ?? '',
    date: toDateInput(event.date),
    time: toTimeInput(event.date),
    location: event.location ?? '',
    items: [],
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('editTitle')}
        breadcrumbs={[
          { label: t('breadcrumbDashboard'), href: '/dashboard' },
          { label: event.title, href: `/events/${slug}` },
          { label: t('actions.edit') },
        ]}
      />

      <EventForm
        mode="edit"
        defaultValues={defaultValues}
        onSubmit={updateEvent.bind(null, event.id, slug)}
        submitLabel={t('actions.save')}
        submittingLabel={t('actions.saving')}
      />
    </PageContainer>
  )
}
