import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

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

  const t = await getTranslations('Events')

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

      <EditEventForm event={event} />
    </PageContainer>
  )
}
