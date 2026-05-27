'use client'

import { toast } from 'sonner'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'

import { ItemWithGuest } from '@/types'
import { Button } from '@/components/ui/button'
import { claimItem, unclaimItem } from '@/actions/items'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type GuestItemsBoardProps = {
  items: ItemWithGuest[]
  eventSlug: string
  currentGuestId?: string
}

function getGuestName(guests: ItemWithGuest['guests']): string | null {
  if (!guests) return null
  const guest = Array.isArray(guests) ? guests[0] : guests
  return guest?.name ?? null
}

type GuestItemRowProps = {
  item: ItemWithGuest
  eventSlug: string
  currentGuestId?: string
  t: ReturnType<typeof useTranslations>
  format: ReturnType<typeof useFormatter>
}

function GuestItemRow({ item, eventSlug, currentGuestId, t, format }: GuestItemRowProps) {
  const tToast = useTranslations('Toast')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const guestName = getGuestName(item.guests)
  const isClaimed = !!item.assigned_guest_id
  const isClaimedByMe = item.assigned_guest_id === currentGuestId

  async function handleClaim() {
    setIsLoading(true)
    setError(null)
    const result = await claimItem(item.id, eventSlug)
    if (result?.error) {
      toast.error(tToast('item.claimError'))
      setError(result.error)
    } else {
      toast.success(tToast('item.claimSuccess'))
    }
    setIsLoading(false)
  }

  async function handleUnclaim() {
    setIsLoading(true)
    setError(null)
    const result = await unclaimItem(item.id, eventSlug)
    if (result?.error) {
      toast.error(tToast('item.unclaimError'))
      setError(result.error)
    } else {
      toast.success(tToast('item.unclaimSuccess'))
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-1 py-3 border-b border-border last:border-none">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.name}</p>
          {item.estimated_cost && (
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="mr-1">~</span>
              {format.number(item.estimated_cost, { style: 'currency', currency: 'BRL' })}
            </p>
          )}
        </div>

        {isClaimedByMe ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleUnclaim}
            disabled={isLoading}
            className="shrink-0 border-primary text-primary hover:bg-primary/10"
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            {t('items.unclaim')}
          </Button>
        ) : isClaimed ? (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full shrink-0">
            {guestName}
          </span>
        ) : currentGuestId ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleClaim}
            disabled={isLoading}
            className="shrink-0"
          >
            {t('items.claim')}
          </Button>
        ) : null}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function GuestItemsBoard({ items, eventSlug, currentGuestId }: GuestItemsBoardProps) {
  const t = useTranslations('Public')
  const format = useFormatter()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {t('items.title')}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t('items.noItems')}</p>
        ) : (
          items.map((item) => (
            <GuestItemRow
              key={item.id}
              item={item}
              eventSlug={eventSlug}
              currentGuestId={currentGuestId}
              t={t}
              format={format}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}
