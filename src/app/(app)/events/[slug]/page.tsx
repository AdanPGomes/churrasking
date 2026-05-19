import { notFound } from 'next/navigation'

import { Guest } from '@/types'
import { Progress } from '@/components/ui/progress'
import { getEventItems } from '@/lib/queries/items'
import { createClient } from '@/lib/supabase/server'
import { getEventBySlug } from '@/lib/queries/events'
import { StatCard } from '@/components/common/stat-card'
import { GuestList } from '@/components/events/guest-list'
import { ItemsBoard } from '@/components/items/items-board'
import { HeroLayout } from '@/components/layout/hero-layout'
import { PageHeader } from '@/components/layout/page-header'
import { EventMetaBadge } from '@/components/common/event-meta-badge'
import { EventHeroActions } from '@/components/events/event-hero-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const event = await getEventBySlug(supabase, slug)

  if (!event) notFound()

  const items = await getEventItems(supabase, event.id)

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(event.date))

  const totalGuests = Number(event.total_guests)
  const confirmedGuests = Number(event.confirmed_guests)
  const declinedGuests = Number(event.declined_guests)
  const pendingGuests = Number(event.pending_guests)

  const progressValue =
    Number(event.total_guests) > 0
      ? (Number(event.confirmed_guests) / Number(event.total_guests)) * 100
      : 0

  return (
    <HeroLayout
      hero={
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex flex-col gap-4 flex-1">
              <PageHeader
                variant="dark"
                title={event.title}
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: event.title }]}
                className="mb-0"
              />

              <div className="flex flex-wrap gap-2">
                <EventMetaBadge variant="dark">{formattedDate}</EventMetaBadge>
                {event.location && <EventMetaBadge variant="dark">{event.location}</EventMetaBadge>}
              </div>

              <div className="grid grid-cols-3 gap-3 lg:hidden">
                <StatCard
                  variant="dark"
                  label="convidados"
                  value={totalGuests}
                  sub={`${pendingGuests} pendentes`}
                />
                <StatCard
                  variant="dark"
                  label="confirmados"
                  value={confirmedGuests}
                  sub={`${declinedGuests} recusaram`}
                  valueClassName="text-green-400"
                />
                <StatCard
                  variant="dark"
                  label="por pessoa"
                  value="R$0"
                  sub="estimado"
                  valueClassName="text-primary"
                />
              </div>
            </div>

            <div className="hidden lg:flex gap-3 shrink-0">
              <StatCard
                variant="dark"
                label="convidados"
                value={totalGuests}
                sub={`${pendingGuests} pendentes`}
              />
              <StatCard
                variant="dark"
                label="confirmados"
                value={confirmedGuests}
                sub={`${declinedGuests} recusaram`}
                valueClassName="text-green-400"
              />
              <StatCard
                variant="dark"
                label="por pessoa"
                value="R$0"
                sub="estimado"
                valueClassName="text-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-white/50">
              <span>Taxa de confirmação</span>
              <span>{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="h-1.5" />
          </div>

          <EventHeroActions eventId={event.id} slug={event.slug} />
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Convidados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GuestList guests={(event.guests ?? []) as Guest[]} />
          </CardContent>
        </Card>

        <ItemsBoard eventId={event.id} eventSlug={event.slug} items={items} />
      </div>
    </HeroLayout>
  )
}
