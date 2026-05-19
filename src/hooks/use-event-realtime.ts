'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

export function useEventRealtime(eventId: string) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`event-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guests',
          filter: `event_id=eq.${eventId}`,
        },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `event_id=eq.${eventId}`,
        },
        () => router.refresh()
      )

    try {
      channel.subscribe((status, err) => {
        if (err) console.warn('Realtime error:', err)
      })
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Realtime not available locally — will work in production')
      }
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, router, supabase])
}
