import { getTranslations } from 'next-intl/server'

import { createEvent } from '@/actions/events'
import { EventForm } from '@/components/events/event-form'
import { PageHeader } from '@/components/layout/page-header'
import { PageContainer } from '@/components/layout/page-container'

function getDefaultDate(): string {
  return new Date().toISOString().split('T')[0]
}

function getDefaultTime(): string {
  const date = new Date()
  date.setHours(date.getHours() + 1, 0, 0, 0)
  return date.toTimeString().slice(0, 5)
}

export default async function NewEventPage() {
  const t = await getTranslations('Events')

  const defaultValues = {
    title: '',
    description: '',
    date: getDefaultDate(),
    time: getDefaultTime(),
    location: '',
    items: [],
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('createTitle')}
        description={t('createDescription')}
        breadcrumbs={[
          { label: t('breadcrumbDashboard'), href: '/dashboard' },
          { label: t('breadcrumbNew') },
        ]}
      />

      <EventForm
        mode="create"
        defaultValues={defaultValues}
        onSubmit={createEvent}
        submitLabel={t('actions.create')}
        submittingLabel={t('actions.creating')}
        showItems
      />
    </PageContainer>
  )
}
