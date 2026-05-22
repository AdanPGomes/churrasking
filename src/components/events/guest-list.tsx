import { getTranslations } from 'next-intl/server'

import { Guest } from '@/types'
import { Badge } from '@/components/ui/badge'
import { rsvpConfig } from '@/lib/utils/rsvp'
import { getInitials } from '@/lib/utils/presentation'

type GuestRowProps = {
  guest: Guest
  t: Awaited<ReturnType<typeof getTranslations>>
}

type GuestListProps = {
  guests: Guest[]
  t: Awaited<ReturnType<typeof getTranslations>>
}

function GuestRow({ guest, t }: GuestRowProps) {
  const config = rsvpConfig[guest.rsvp_status]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-none">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
        {getInitials(guest.name)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{guest.name}</p>
        <p className="text-xs text-muted-foreground truncate">{guest.email}</p>
      </div>

      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {t(`guests.${guest.rsvp_status}`)}
      </Badge>
    </div>
  )
}

export async function GuestList({ guests }: GuestListProps) {
  const t = await getTranslations('Events')

  if (guests.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">{t('guests.noGuests')}</p>
  }

  return (
    <div>
      {guests.map((guest) => (
        <GuestRow key={guest.id} guest={guest} t={t} />
      ))}
    </div>
  )
}
