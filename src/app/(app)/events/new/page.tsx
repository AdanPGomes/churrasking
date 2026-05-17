import { PageHeader } from '@/components/layout/page-header'
import { PageContainer } from '@/components/layout/page-container'
import { CreateEventForm } from '@/components/events/create-event-form'

export default async function NewEventPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Criar evento"
        description="Preencha os detalhes e compartilhe o link com seus convidados."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Novo churrasco' }]}
      />

      <CreateEventForm />
    </PageContainer>
  )
}
