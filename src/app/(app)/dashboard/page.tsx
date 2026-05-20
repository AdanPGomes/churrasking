import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

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

async function DashboardContent() {
  const supabase = await createClient()
  const t = await getTranslations('Dashboard')

  const [events, stats] = await Promise.all([getHostEvents(supabase), getHostStats(supabase)])

  return (
    <>
      <div className="flex justify-between gap-4">
        <StatCard
          label={t('stats.events')}
          value={stats?.total_events ?? 0}
          sub={t('stats.pastEvents', { count: stats?.past_events ?? 0 })}
          className="flex-1"
        />
        <StatCard
          label={t('stats.guests')}
          value={stats?.total_guests ?? 0}
          sub={t('stats.totalHistoric')}
          className="flex-1"
        />
        <StatCard
          label={t('stats.confirmations')}
          value={`${stats?.confirmation_rate ?? 0}%`}
          sub={t('stats.averageRate')}
          className="flex-1"
        />
      </div>

      <SectionHeader
        title={t('myEvents')}
        action={
          <Button asChild className="rounded-lg">
            <Link href="/events/new">
              <Plus className="h-4 w-4 mr-2" />
              {t('newEvent')}
            </Link>
          </Button>
        }
      />

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="relative w-32 h-32">
            <Image
              src="/mascot.png"
              alt={t('mascotAlt')}
              fill
              sizes="128px"
              className="object-contain opacity-80"
            />
          </div>
          <div>
            <p className="text-lg font-medium">{t('emptyTitle')}</p>
            <p className="text-muted-foreground text-sm">{t('emptyDescription')}</p>
          </div>
          <Button asChild>
            <Link href="/events/new">
              <Plus className="h-4 w-4" />
              {t('emptyAction')}
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
  const t = await getTranslations('Dashboard')

  const profile = await getProfile(supabase)

  const firstName = profile?.name.split(' ')[0] || 'Rei'

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? t('greetingMorning') : hour < 18 ? t('greetingAfternoon') : t('greetingEvening')

  return (
    <PageContainer>
      <PageHeader title={`${greeting}, ${firstName} 👋`} description={t('noEvents')} />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </PageContainer>
  )
}
