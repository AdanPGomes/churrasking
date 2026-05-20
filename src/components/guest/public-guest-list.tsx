import { getTranslations } from 'next-intl/server'

import { rsvpConfig, type RsvpStatus } from '@/lib/utils/rsvp'

type PublicGuest = {
  id: string
  name: string
  rsvp_status: string
}

type PublicGuestListProps = {
  guests: PublicGuest[]
  currentGuestId?: string
}

export async function PublicGuestList({ guests, currentGuestId }: PublicGuestListProps) {
  const t = await getTranslations('Public')
  const confirmed = guests.filter((g) => g.rsvp_status === 'confirmed')
  const others = guests.filter((g) => g.rsvp_status !== 'confirmed')
  const sorted = [...confirmed, ...others]

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">{t('guestList.noGuests')}</p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {sorted.map((guest) => {
        const status = (guest.rsvp_status as RsvpStatus) ?? 'pending'
        const config = rsvpConfig[status] ?? rsvpConfig.pending
        const Icon = config.icon
        const isCurrentGuest = guest.id === currentGuestId
        const initials = guest.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        return (
          <div key={guest.id} className="flex items-center gap-3 py-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
              {initials}
            </div>
            <span className="flex-1 text-sm text-foreground">
              {guest.name}
              {isCurrentGuest && (
                <span className="text-xs text-muted-foreground ml-1">{t('guestList.you')}</span>
              )}
            </span>
            <Icon className={`h-4 w-4 shrink-0 ${config.className}`} />
          </div>
        )
      })}
    </div>
  )
}
