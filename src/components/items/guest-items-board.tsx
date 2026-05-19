'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { claimItem, unclaimItem } from '@/actions/items'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Item = {
  id: string
  name: string
  estimated_cost: number | null
  assigned_guest_id: string | null
  guests: { id: string; name: string } | { id: string; name: string }[] | null
}

type GuestItemsBoardProps = {
  items: Item[]
  eventSlug: string
  currentGuestId?: string
}

function getGuestName(guests: Item['guests']): string | null {
  if (!guests) return null
  const guest = Array.isArray(guests) ? guests[0] : guests
  return guest?.name ?? null
}

function GuestItemRow({
  item,
  eventSlug,
  currentGuestId,
}: {
  item: Item
  eventSlug: string
  currentGuestId?: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const guestName = getGuestName(item.guests)
  const isClaimed = !!item.assigned_guest_id
  const isClaimedByMe = item.assigned_guest_id === currentGuestId

  async function handleClaim() {
    setIsLoading(true)
    setError(null)
    const result = await claimItem(item.id, eventSlug)
    if (result?.error) setError(result.error)
    setIsLoading(false)
  }

  async function handleUnclaim() {
    setIsLoading(true)
    setError(null)
    const result = await unclaimItem(item.id, eventSlug)
    if (result?.error) setError(result.error)
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
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(item.estimated_cost)}
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
            Vou levar
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
            Pego eu
          </Button>
        ) : null}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function GuestItemsBoard({ items, eventSlug, currentGuestId }: GuestItemsBoardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          O que levar
        </CardTitle>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum item cadastrado ainda.
          </p>
        ) : (
          items.map((item) => (
            <GuestItemRow
              key={item.id}
              item={item}
              eventSlug={eventSlug}
              currentGuestId={currentGuestId}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}
