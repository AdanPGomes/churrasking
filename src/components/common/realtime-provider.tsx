'use client'

import { useEventRealtime } from '@/hooks/use-event-realtime'

type RealtimeProviderProps = {
  eventId: string
}

export function RealtimeProvider({ eventId }: RealtimeProviderProps) {
  useEventRealtime(eventId)
  return null
}
