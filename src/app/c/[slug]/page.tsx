import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getFormatter, getTranslations } from 'next-intl/server'

import { getEventItems } from '@/lib/queries/items'
import { createClient } from '@/lib/supabase/server'
import { getGuestSession } from '@/lib/guest-session'
import { getPublicEventBySlug } from '@/lib/queries/events'
import { HeroLayout } from '@/components/layout/hero-layout'
import { RsvpButtons } from '@/components/guest/rsvp-buttons'
import { EventMetaBadge } from '@/components/common/event-meta-badge'
import { GuestItemsBoard } from '@/components/items/guest-items-board'
import { PublicGuestList } from '@/components/guest/public-guest-list'
import { calculateCostSummary } from '@/lib/utils/cost'
import { RealtimeProvider } from '@/components/common/realtime-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GuestIdentificationForm } from '@/components/guest/guest-identification-form'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const event = await getPublicEventBySlug(supabase, slug)

  if (!event) {
    return { title: 'Evento não encontrado' }
  }

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(event.date))

  const hostName = Array.isArray(event.profiles)
    ? event.profiles[0]?.name
    : (event.profiles as { name: string } | null)?.name

  const description = [
    hostName ? `Organizado por ${hostName}` : null,
    formattedDate,
    event.location,
  ]
    .filter(Boolean)
    .join(' · ')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  return {
    title: event.title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title: event.title,
      description,
      type: 'website',
      url: `${appUrl}/c/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
    },
  }
}

export default async function PublicEventPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const [event, session] = await Promise.all([
    getPublicEventBySlug(supabase, slug),
    getGuestSession(),
  ])
  if (!event) notFound()

  const t = await getTranslations('Public')
  const format = await getFormatter()

  const items = await getEventItems(supabase, event.id)

  const formattedDate = format.dateTime(new Date(event.date), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const guests = event.guests ?? []
  const totalGuests = guests.length
  const confirmedGuests = guests.filter((g) => g.rsvp_status === 'confirmed').length
  const summary = calculateCostSummary(items, confirmedGuests)

  const currentGuest =
    session?.eventId === event.id ? guests.find((g) => g.id === session.guestId) : null

  const hostName = Array.isArray(event.profiles)
    ? event.profiles[0]?.name
    : (event.profiles as { name: string } | null)?.name

  return (
    <HeroLayout
      hero={
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-white text-2xl font-semibold">{event.title}</h1>
            {hostName && (
              <p className="text-white/50 text-sm mt-1">{t('organizedBy', { name: hostName })}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <EventMetaBadge variant="dark">{formattedDate}</EventMetaBadge>
            {event.location && <EventMetaBadge variant="dark">{event.location}</EventMetaBadge>}
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-0 border border-border rounded-2xl overflow-hidden bg-card -mt-4">
        <div className="flex flex-col items-center py-4 border-r border-border">
          <p className="text-2xl font-semibold text-foreground">{totalGuests}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t('guestList.totalGuests')}</p>
        </div>

        <div className="flex flex-col items-center py-4 border-r border-border">
          <p className="text-2xl font-semibold text-green-600">{confirmedGuests}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t('guestList.confirmed')}</p>
        </div>

        <div className="flex flex-col items-center py-4">
          <p className="text-2xl font-semibold text-primary">
            {format.number(summary.costPerPerson, { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{t('items.perPerson')}</p>
        </div>
      </div>

      {!currentGuest ? (
        <GuestIdentificationForm eventId={event.id} eventSlug={slug} />
      ) : (
        <RsvpButtons
          guestId={currentGuest.id}
          currentStatus={currentGuest.rsvp_status as 'confirmed' | 'declined' | 'pending'}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {t('guestList.title')}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <PublicGuestList guests={guests} currentGuestId={currentGuest?.id} />
        </CardContent>
      </Card>

      <GuestItemsBoard currentGuestId={currentGuest?.id} eventSlug={slug} items={items} />
      <RealtimeProvider eventId={event.id} />
    </HeroLayout>
  )
}
