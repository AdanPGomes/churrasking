import { CheckCircle2, Clock, XCircle } from 'lucide-react'

import { Guest } from '@/types'
import { Badge } from '@/components/ui/badge'

type GuestListProps = {
  guests: Guest[]
}

const rsvpConfig = {
  confirmed: {
    label: 'Confirmado',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  declined: {
    label: 'Recusou',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 darl:text-red-400',
  },
  pending: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-muted text-muted-foreground',
  },
}

function GuestRow({ guest }: { guest: Guest }) {
  const config = rsvpConfig[guest.rsvp_status]
  const Icon = config.icon

  const initials = guest.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-none">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{guest.name}</p>
        <p className="text-xs text-muted-foreground truncate">{guest.email}</p>
      </div>

      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    </div>
  )
}

export function GuestList({ guests }: GuestListProps) {
  if (guests.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">Nenhum convidado ainda.</p>
  }

  return (
    <div>
      {guests.map((guest) => (
        <GuestRow key={guest.id} guest={guest} />
      ))}
    </div>
  )
}
