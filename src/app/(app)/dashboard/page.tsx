import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getProfile } from '@/lib/queries/profile'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/common/stat-card'
import { EventCard } from '@/components/events/event-card'
import { PageHeader } from '@/components/layout/page-header'
import { PageContainer } from '@/components/layout/page-container'
import { SectionHeader } from '@/components/layout/section-header'
import { getHostEvents, getHostStats } from '@/lib/queries/events'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

async function DashboardContent() {
  const supabase = await createClient()

  const [events, stats] = await Promise.all([getHostEvents(supabase), getHostStats(supabase)])

  return (
    <>
      <div className="flex justify-between gap-4">
        <StatCard
          label="eventos"
          value={stats?.total_events ?? 0}
          sub={`${stats?.past_events ?? 0} passados`}
          className="flex-1"
        />
        <StatCard
          label="convidados"
          value={stats?.total_guests ?? 0}
          sub="total histórico"
          className="flex-1"
        />
        <StatCard
          label="confirmações"
          value={`${stats?.confirmation_rate ?? 0}%`}
          sub="taxa média"
          className="flex-1"
        />
      </div>

      <SectionHeader
        title="Meus churrascos"
        action={
          <Button asChild className="rounded-lg">
            <Link href="/events/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo<span className="hidden md:inline"> churrasco</span>
            </Link>
          </Button>
        }
      />

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="relative w-32 h-32">
            <Image
              src="/mascot.png"
              alt="ChurrasKing mascote"
              fill
              sizes="128px"
              className="object-contain opacity-80"
            />
          </div>
          <div>
            <p className="text-lg font-medium">Cadê o churrasco, rei?</p>
            <p className="text-muted-foreground text-sm">
              Crie seu primeiro evento e compartilhe o link com os amigos.
            </p>
          </div>
          <Button asChild>
            <Link href="/events/new">
              <Plus className="h-4 w-4" />
              Criar primeiro churrasco
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              slug={event.slug}
              date={new Date(event.date)}
              location={event.location}
              coverUrl={event.cover_url}
              totalGuests={Number(event.total_guests)}
              confirmedGuests={Number(event.confirmed_guests)}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const [profile, events, stats] = await Promise.all([
    getProfile(supabase),
    getHostEvents(supabase),
    getHostStats(supabase),
  ])

  const firstName = profile?.name.split(' ')[0] || 'Rei'

  return (
    <PageContainer>
      <PageHeader
        title={`${getGreeting()}, ${firstName} 👋`}
        description="Você tem 1 evento próximo esta semana."
      />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </PageContainer>
  )
}
