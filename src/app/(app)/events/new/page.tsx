import { getTranslations } from 'next-intl/server'

import { PageHeader } from '@/components/layout/page-header'
import { PageContainer } from '@/components/layout/page-container'
import { CreateEventForm } from '@/components/events/create-event-form'

export default async function NewEventPage() {
  const t = await getTranslations('Events')

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

      <CreateEventForm />
    </PageContainer>
  )
}
