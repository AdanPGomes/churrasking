import { CheckCircle2, Clock, XCircle } from 'lucide-react'

export const rsvpConfig = {
  confirmed: {
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  declined: {
    icon: XCircle,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 darl:text-red-400',
  },
  pending: {
    icon: Clock,
    className: 'bg-muted text-muted-foreground',
  },
} as const

export type RsvpStatus = keyof typeof rsvpConfig
